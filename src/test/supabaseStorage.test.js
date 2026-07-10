/**
 * DAR-389 — Unit tests for the Supabase data layer (`src/lib/supabaseStorage.js`).
 *
 * These mock the `@supabase/supabase-js` client itself: `createClient` is
 * replaced with a factory returning a chainable query-builder stub, so the real
 * `src/lib/supabaseClient.js` module runs unchanged and hands the stubbed client
 * to the data layer. Env vars are stubbed so that module's config guard passes.
 *
 * Coverage: every exported operation (createStorage list/filter/get/create/
 * update/delete and userStorage get/update) across happy, empty, error, and
 * unauthenticated paths — asserting the target table, the column/order/filter
 * args, the `created_date` alias, and the RLS-scoped `user_id` / profile `id`
 * injection on writes.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

// A single chainable query-builder mock: every method returns the builder, and
// the builder is awaitable, resolving to whatever { data, error } the test set.
const { state, client, qb } = vi.hoisted(() => {
  const state = { result: { data: null, error: null }, sessionUserId: 'user-123' };
  const qb = {};
  const methods = [
    'select', 'order', 'limit', 'match', 'eq',
    'insert', 'update', 'delete', 'upsert', 'maybeSingle', 'single',
  ];
  for (const m of methods) qb[m] = vi.fn(() => qb);
  qb.then = (resolve) => resolve(state.result); // make the builder awaitable

  const client = {
    from: vi.fn(() => qb),
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: state.sessionUserId
              ? { user: { id: state.sessionUserId } }
              : null,
          },
        })
      ),
    },
  };
  return { state, client, qb };
});

// Mock the underlying SDK — supabaseClient.js builds its `supabase` from this.
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => client),
}));

// supabaseClient.js throws if these are missing; stub before it is imported.
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Dynamic import so the env stubs above are in place when the module evaluates.
const { createStorage, userStorage } = await import('@/lib/supabaseStorage');

beforeEach(() => {
  vi.clearAllMocks();
  state.result = { data: null, error: null };
  state.sessionUserId = 'user-123';
});

describe('createStorage — list', () => {
  it('descending order + limit for a "-" prefix, aliases created_date', async () => {
    state.result = {
      data: [
        { id: '1', created_at: 'T1' },
        { id: '2', created_at: 'T2' },
      ],
      error: null,
    };

    const rows = await createStorage('blog_posts').list('-created_at', 5);

    expect(client.from).toHaveBeenCalledWith('blog_posts');
    expect(qb.select).toHaveBeenCalledWith('*');
    expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(qb.limit).toHaveBeenCalledWith(5);
    // RLS scopes rows to the caller; list must not add its own user filter.
    expect(qb.eq).not.toHaveBeenCalled();
    expect(qb.match).not.toHaveBeenCalled();
    expect(rows.map((r) => r.created_date)).toEqual(['T1', 'T2']);
  });

  it('ascending order and no limit call when orderBy has no dash / no limit', async () => {
    state.result = { data: [], error: null };

    await createStorage('blog_posts').list('title');

    expect(qb.order).toHaveBeenCalledWith('title', { ascending: true });
    expect(qb.limit).not.toHaveBeenCalled();
  });

  it('defaults to "-created_at" when orderBy is omitted', async () => {
    state.result = { data: [], error: null };

    await createStorage('blog_posts').list();

    expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('returns [] when supabase hands back a null data set', async () => {
    state.result = { data: null, error: null };

    expect(await createStorage('blog_posts').list()).toEqual([]);
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('list boom') };

    await expect(createStorage('blog_posts').list()).rejects.toThrow('list boom');
  });
});

describe('createStorage — filter', () => {
  it('matches on the provided fields and aliases created_date', async () => {
    state.result = {
      data: [{ id: '1', created_at: 'T', status: 'ready' }],
      error: null,
    };

    const rows = await createStorage('blog_posts').filter({ status: 'ready' });

    expect(client.from).toHaveBeenCalledWith('blog_posts');
    expect(qb.match).toHaveBeenCalledWith({ status: 'ready' });
    expect(rows[0].created_date).toBe('T');
  });

  it('returns [] when nothing matches', async () => {
    state.result = { data: [], error: null };

    expect(await createStorage('blog_posts').filter({ status: 'nope' })).toEqual([]);
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('filter boom') };

    await expect(
      createStorage('blog_posts').filter({ status: 'ready' })
    ).rejects.toThrow('filter boom');
  });
});

describe('createStorage — get', () => {
  it('queries by id via maybeSingle and aliases created_date', async () => {
    state.result = { data: { id: '7', created_at: 'T' }, error: null };

    const row = await createStorage('blog_posts').get('7');

    expect(client.from).toHaveBeenCalledWith('blog_posts');
    expect(qb.eq).toHaveBeenCalledWith('id', '7');
    expect(qb.maybeSingle).toHaveBeenCalled();
    expect(row.created_date).toBe('T');
  });

  it('returns null when the row is not found', async () => {
    state.result = { data: null, error: null };

    expect(await createStorage('blog_posts').get('missing')).toBeNull();
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('get boom') };

    await expect(createStorage('blog_posts').get('7')).rejects.toThrow('get boom');
  });
});

describe('createStorage — create', () => {
  it('injects the session user_id (RLS WITH CHECK) and aliases created_date', async () => {
    state.result = { data: { id: '9', created_at: 'T2', title: 'x' }, error: null };

    const row = await createStorage('blog_ideas').create({ title: 'x' });

    expect(client.from).toHaveBeenCalledWith('blog_ideas');
    expect(qb.insert).toHaveBeenCalledWith({ title: 'x', user_id: 'user-123' });
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(row.created_date).toBe('T2');
  });

  it('injects a null user_id when there is no session', async () => {
    state.sessionUserId = null;
    state.result = { data: { id: '9', created_at: 'T2', title: 'x' }, error: null };

    await createStorage('blog_ideas').create({ title: 'x' });

    expect(qb.insert).toHaveBeenCalledWith({ title: 'x', user_id: null });
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('create boom') };

    await expect(
      createStorage('blog_ideas').create({ title: 'x' })
    ).rejects.toThrow('create boom');
  });
});

describe('createStorage — update', () => {
  it('updates by id, returns the row, and aliases created_date', async () => {
    state.result = { data: { id: '3', created_at: 'T', title: 'new' }, error: null };

    const row = await createStorage('blog_posts').update('3', { title: 'new' });

    expect(client.from).toHaveBeenCalledWith('blog_posts');
    // RLS scopes the row; update must not smuggle in a user_id column.
    expect(qb.update).toHaveBeenCalledWith({ title: 'new' });
    expect(qb.eq).toHaveBeenCalledWith('id', '3');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(row.created_date).toBe('T');
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('update boom') };

    await expect(
      createStorage('blog_posts').update('3', { title: 'new' })
    ).rejects.toThrow('update boom');
  });
});

describe('createStorage — delete', () => {
  it('deletes by id and resolves without a value', async () => {
    state.result = { data: null, error: null };

    const result = await createStorage('blog_posts').delete('4');

    expect(client.from).toHaveBeenCalledWith('blog_posts');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('id', '4');
    expect(result).toBeUndefined();
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('delete boom') };

    await expect(createStorage('blog_posts').delete('4')).rejects.toThrow('delete boom');
  });
});

describe('userStorage — get', () => {
  it('returns a default profile (no id, no query) when unauthenticated', async () => {
    state.sessionUserId = null;

    const user = await userStorage.get();

    expect(client.from).not.toHaveBeenCalled();
    expect(user.brand_voice).toBe('professional');
    expect(user.content_preferences.preferred_length).toBe('medium');
    expect(user.id).toBeUndefined();
  });

  it('reads the profiles row scoped to the session id and aliases created_date', async () => {
    state.result = {
      data: { id: 'user-123', business_name: 'Acme', created_at: 'T' },
      error: null,
    };

    const user = await userStorage.get();

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(qb.eq).toHaveBeenCalledWith('id', 'user-123');
    expect(qb.maybeSingle).toHaveBeenCalled();
    expect(user.business_name).toBe('Acme');
    expect(user.created_date).toBe('T');
  });

  it('falls back to a default carrying the real id when the row is missing (trigger lag)', async () => {
    state.result = { data: null, error: null };

    const user = await userStorage.get();

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(user.id).toBe('user-123');
    expect(user.brand_voice).toBe('professional');
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('profile get boom') };

    await expect(userStorage.get()).rejects.toThrow('profile get boom');
  });
});

describe('userStorage — update', () => {
  it('upserts the profile keyed on the session id (id = auth.uid())', async () => {
    state.result = {
      data: { id: 'user-123', business_name: 'Acme', created_at: 'T' },
      error: null,
    };

    const profile = await userStorage.update({ business_name: 'Acme' });

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(qb.upsert).toHaveBeenCalledWith(
      { business_name: 'Acme', id: 'user-123' },
      { onConflict: 'id' }
    );
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(profile.business_name).toBe('Acme');
    expect(profile.created_date).toBe('T');
  });

  it('upserts with a null id when there is no session', async () => {
    state.sessionUserId = null;
    state.result = { data: { id: null, business_name: 'Acme' }, error: null };

    await userStorage.update({ business_name: 'Acme' });

    expect(qb.upsert).toHaveBeenCalledWith(
      { business_name: 'Acme', id: null },
      { onConflict: 'id' }
    );
  });

  it('throws when supabase returns an error', async () => {
    state.result = { data: null, error: new Error('profile update boom') };

    await expect(
      userStorage.update({ business_name: 'Acme' })
    ).rejects.toThrow('profile update boom');
  });
});
