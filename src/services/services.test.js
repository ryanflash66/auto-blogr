import { vi, describe, it, expect, beforeEach } from 'vitest';

// The services now delegate to the Supabase-backed storage layer. We mock that
// layer so these tests stay pure (no network, no env) and verify what the
// service wrappers are actually responsible for: field mapping, defaults, and
// delegating to the right storage method.
const { stores, userStorageMock, makeStore } = vi.hoisted(() => {
  const makeStore = () => ({
    list: vi.fn(() => Promise.resolve([])),
    filter: vi.fn(() => Promise.resolve([])),
    get: vi.fn(() => Promise.resolve(null)),
    create: vi.fn((d) => Promise.resolve({ id: 'row-1', ...d })),
    update: vi.fn((id, u) => Promise.resolve({ id, ...u })),
    delete: vi.fn(() => Promise.resolve()),
  });
  const stores = {};
  const userStorageMock = {
    get: vi.fn(() => Promise.resolve({ id: 'me', business_name: '' })),
    update: vi.fn((u) => Promise.resolve({ id: 'me', ...u })),
  };
  return { stores, userStorageMock, makeStore };
});

vi.mock('@/lib/supabaseStorage', () => ({
  createStorage: (table) => (stores[table] ||= makeStore()),
  userStorage: userStorageMock,
  default: {},
}));

const { BlogPost } = await import('./blogPosts');
const { BlogIdea } = await import('./blogIdeas');
const { WordPressSite } = await import('./wordpressSites');
const { User } = await import('./users');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BlogPost', () => {
  it('create maps fields and applies defaults', async () => {
    await BlogPost.create('user-1', { title: 'My Post', content: 'body', status: 'ready' });
    expect(stores['blog_posts'].create).toHaveBeenCalledWith({
      blog_idea_id: undefined,
      title: 'My Post',
      content: 'body',
      excerpt: undefined,
      hero_image_url: undefined,
      hero_image_alt: undefined,
      variation_number: 1,
      status: 'ready',
      seo_title: undefined,
      meta_description: undefined,
      tags: [],
      word_count: 0,
    });
  });

  it('list/filter/get/update/delete delegate to storage', async () => {
    await BlogPost.list('user-1', '-created_at', 5);
    expect(stores['blog_posts'].list).toHaveBeenCalledWith('-created_at', 5);

    await BlogPost.filter('user-1', { status: 'ready' });
    expect(stores['blog_posts'].filter).toHaveBeenCalledWith({ status: 'ready' });

    await BlogPost.get('p1');
    expect(stores['blog_posts'].get).toHaveBeenCalledWith('p1');

    await BlogPost.update('p1', { title: 'Edited' });
    expect(stores['blog_posts'].update).toHaveBeenCalledWith('p1', { title: 'Edited' });

    await BlogPost.delete('p1');
    expect(stores['blog_posts'].delete).toHaveBeenCalledWith('p1');
  });
});

describe('BlogIdea', () => {
  it('create applies defaults (tone, keywords, variations, status)', async () => {
    await BlogIdea.create('user-1', { title: 'Idea', description: 'desc' });
    expect(stores['blog_ideas'].create).toHaveBeenCalledWith({
      title: 'Idea',
      description: 'desc',
      target_audience: undefined,
      tone: 'professional',
      keywords: [],
      variations_requested: 1,
      status: 'draft',
    });
  });
});

describe('WordPressSite', () => {
  it('create defaults connection_status and is_active', async () => {
    await WordPressSite.create('user-1', {
      name: 'Blog',
      url: 'https://blog.example',
      username: 'admin',
      api_key: 'secret',
    });
    expect(stores['wordpress_sites'].create).toHaveBeenCalledWith({
      name: 'Blog',
      url: 'https://blog.example',
      username: 'admin',
      api_key: 'secret',
      default_category: undefined,
      default_author: undefined,
      connection_status: 'disconnected',
      is_active: true,
    });
  });
});

describe('User', () => {
  it('me reads, and updateMyUserData writes, the profile (clerkId ignored)', async () => {
    await User.me();
    expect(userStorageMock.get).toHaveBeenCalled();

    await User.updateMyUserData('clerk-ignored', { business_name: 'Acme' });
    expect(userStorageMock.update).toHaveBeenCalledWith({ business_name: 'Acme' });
  });
});
