import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStorage, userStorage } from './storage';

describe('createStorage CRUD', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    store = createStorage('things');
  });

  it('create assigns an id and timestamps and persists the item', async () => {
    const item = await store.create({ title: 'Hello' });

    expect(item.id).toMatch(/^id_/);
    expect(item.title).toBe('Hello');
    expect(item.created_at).toBeTruthy();
    expect(item.updated_at).toBe(item.created_at);
    // created_date is a read alias kept in sync with created_at.
    expect(item.created_date).toBe(item.created_at);

    // Persisted under the prefixed key.
    const raw = JSON.parse(localStorage.getItem('autoblogr_things'));
    expect(raw).toHaveLength(1);
    expect(raw[0].id).toBe(item.id);
  });

  it('generates unique ids for separate items', async () => {
    const a = await store.create({ title: 'A' });
    const b = await store.create({ title: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  it('list sorts by -created_at (descending) by default', async () => {
    // `create` stamps its own `created_at`, so set deterministic values via
    // `update` (which honors passed fields) to make ordering unambiguous.
    const first = await store.create({ title: 'first' });
    const second = await store.create({ title: 'second' });
    await store.update(first.id, { created_at: '2020-01-01T00:00:00.000Z' });
    await store.update(second.id, { created_at: '2022-01-01T00:00:00.000Z' });

    const items = await store.list();
    expect(items.map((i) => i.id)).toEqual([second.id, first.id]);
  });

  it('list sorts ascending when orderBy has no leading dash', async () => {
    await store.create({ title: 'b' });
    await store.create({ title: 'a' });

    const items = await store.list('title');
    expect(items.map((i) => i.title)).toEqual(['a', 'b']);
  });

  it('list applies a limit', async () => {
    const one = await store.create({ title: 'one' });
    const two = await store.create({ title: 'two' });
    const three = await store.create({ title: 'three' });
    await store.update(one.id, { created_at: '2020-01-01T00:00:00.000Z' });
    await store.update(two.id, { created_at: '2021-01-01T00:00:00.000Z' });
    await store.update(three.id, { created_at: '2022-01-01T00:00:00.000Z' });

    const items = await store.list('-created_at', 2);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.title)).toEqual(['three', 'two']);
  });

  it('list returns an empty array for an unknown collection', async () => {
    const empty = createStorage('nope');
    expect(await empty.list()).toEqual([]);
  });

  it('filter matches items by all provided fields', async () => {
    await store.create({ title: 'keep', status: 'ready', tag: 'x' });
    await store.create({ title: 'drop', status: 'draft', tag: 'x' });
    await store.create({ title: 'drop2', status: 'ready', tag: 'y' });

    const matches = await store.filter({ status: 'ready', tag: 'x' });
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('keep');
  });

  it('get returns the matching item or null', async () => {
    const item = await store.create({ title: 'findme' });

    expect((await store.get(item.id)).title).toBe('findme');
    expect(await store.get('missing')).toBeNull();
  });

  it('update merges changes, refreshes updated_at, and preserves created_at', async () => {
    // Fake timers guarantee update() stamps a strictly later updated_at than
    // create(), independent of the host clock's resolution.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-01-01T00:00:00.000Z'));
    const item = await store.create({ title: 'old' });

    vi.setSystemTime(new Date('2021-01-01T00:00:01.000Z'));
    const updated = await store.update(item.id, { title: 'new' });
    vi.useRealTimers();

    expect(updated.title).toBe('new');
    // created_at (and its created_date alias) carry over from the original record.
    expect(updated.created_at).toBe(item.created_at);
    expect(updated.created_date).toBe(item.created_date);
    expect(updated.updated_at).not.toBe(item.updated_at);

    // Change is persisted.
    expect((await store.get(item.id)).title).toBe('new');
  });

  it('update throws when the id does not exist', async () => {
    await expect(store.update('missing', { title: 'x' })).rejects.toThrow('Item not found');
  });

  it('delete removes only the targeted item', async () => {
    const a = await store.create({ title: 'a' });
    const b = await store.create({ title: 'b' });

    await store.delete(a.id);

    const items = await store.list();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(b.id);
  });

  it('isolates collections from one another', async () => {
    const other = createStorage('others');
    await store.create({ title: 'in things' });

    expect(await other.list()).toEqual([]);
    expect(await store.list()).toHaveLength(1);
  });
});

describe('userStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('get seeds and persists a default user on first call', async () => {
    expect(localStorage.getItem('autoblogr_user')).toBeNull();

    const user = await userStorage.get();
    expect(user.id).toBe('local_user');
    expect(user.email).toBe('user@local.app');
    expect(user.brand_voice).toBe('professional');

    // Persisted for subsequent reads.
    expect(JSON.parse(localStorage.getItem('autoblogr_user')).id).toBe('local_user');
  });

  it('get returns the existing user without overwriting it', async () => {
    localStorage.setItem(
      'autoblogr_user',
      JSON.stringify({ id: 'local_user', full_name: 'Custom Name' })
    );

    const user = await userStorage.get();
    expect(user.full_name).toBe('Custom Name');
  });

  it('update merges changes and stamps updated_at', async () => {
    await userStorage.get();

    const updated = await userStorage.update({ business_name: 'Acme' });
    expect(updated.business_name).toBe('Acme');
    expect(updated.id).toBe('local_user');
    expect(updated.updated_at).toBeTruthy();

    expect(JSON.parse(localStorage.getItem('autoblogr_user')).business_name).toBe('Acme');
  });
});
