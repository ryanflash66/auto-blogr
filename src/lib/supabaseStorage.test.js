import { vi, describe, it, expect, beforeEach } from 'vitest';

// A chainable query-builder mock: every method returns the builder, and the
// builder is awaitable, resolving to a configurable { data, error } result.
const { state, supabase } = vi.hoisted(() => {
  const state = { result: { data: null, error: null }, sessionUserId: 'user-123' };
  const qb = {};
  const methods = [
    'select', 'order', 'limit', 'match', 'eq',
    'insert', 'update', 'delete', 'upsert', 'maybeSingle', 'single',
  ];
  for (const m of methods) qb[m] = vi.fn(() => qb);
  qb.then = (resolve) => resolve(state.result); // make the builder awaitable

  const supabase = {
    _qb: qb,
    from: vi.fn(() => qb),
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: state.sessionUserId ? { user: { id: state.sessionUserId } } : null,
          },
        })
      ),
    },
  };
  return { state, supabase };
});

vi.mock('@/lib/supabaseClient', () => ({ supabase, default: supabase }));

const { createStorage, userStorage } = await import('@/lib/supabaseStorage');
const qb = supabase._qb;

beforeEach(() => {
  vi.clearAllMocks();
  state.result = { data: null, error: null };
  state.sessionUserId = 'user-123';
});

describe('createStorage CRUD', () => {
  it('list: "-created_at" → descending order + limit, aliases created_date', async () => {
    state.result = { data: [{ id: '1', created_at: 'T1' }], error: null };
    const rows = await createStorage('blog_posts').list('-created_at', 5);
    expect(supabase.from).toHaveBeenCalledWith('blog_posts');
    expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(qb.limit).toHaveBeenCalledWith(5);
    expect(rows[0].created_date).toBe('T1');
  });

  it('list: ascending when no leading dash, no limit call when omitted', async () => {
    state.result = { data: [], error: null };
    await createStorage('blog_posts').list('created_at');
    expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(qb.limit).not.toHaveBeenCalled();
  });

  it('create: injects user_id from session and aliases created_date', async () => {
    state.result = { data: { id: '9', created_at: 'T2', title: 'x' }, error: null };
    const row = await createStorage('blog_ideas').create({ title: 'x' });
    expect(qb.insert).toHaveBeenCalledWith({ title: 'x', user_id: 'user-123' });
    expect(row.created_date).toBe('T2');
  });

  it('filter: uses match()', async () => {
    state.result = { data: [], error: null };
    await createStorage('blog_posts').filter({ status: 'ready' });
    expect(qb.match).toHaveBeenCalledWith({ status: 'ready' });
  });

  it('get: uses eq(id) + maybeSingle()', async () => {
    state.result = { data: { id: '1', created_at: 'T' }, error: null };
    const row = await createStorage('blog_posts').get('1');
    expect(qb.eq).toHaveBeenCalledWith('id', '1');
    expect(qb.maybeSingle).toHaveBeenCalled();
    expect(row.created_date).toBe('T');
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('boom') };
    await expect(createStorage('blog_posts').list()).rejects.toThrow('boom');
  });
});

describe('userStorage', () => {
  it('get: returns a default profile (no id) when unauthenticated', async () => {
    state.sessionUserId = null;
    const u = await userStorage.get();
    expect(u.brand_voice).toBe('professional');
    expect(u.id).toBeUndefined();
  });

  it('update: upserts the profile keyed on the session id', async () => {
    state.result = { data: { id: 'user-123', business_name: 'Acme', created_at: 'T' }, error: null };
    const p = await userStorage.update({ business_name: 'Acme' });
    expect(qb.upsert).toHaveBeenCalledWith(
      { business_name: 'Acme', id: 'user-123' },
      { onConflict: 'id' }
    );
    expect(p.business_name).toBe('Acme');
  });
});
