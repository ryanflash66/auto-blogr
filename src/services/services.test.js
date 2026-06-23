import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage } from '@/lib/storage';
import { BlogPost } from './blogPosts';
import { BlogIdea } from './blogIdeas';
import { WordPressSite } from './wordpressSites';
import { User } from './users';

// These exercise the real storage layer (backed by jsdom's localStorage) to
// confirm the service wrappers delegate create/list/filter/get correctly and
// map their input fields onto the persisted records.
describe('service wrappers delegate to storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('BlogPost', () => {
    it('create persists the post and list returns it', async () => {
      const created = await BlogPost.create('user-1', {
        title: 'My Post',
        content: 'body',
        status: 'ready',
      });

      expect(created.id).toMatch(/^id_/);
      expect(created.title).toBe('My Post');
      // Defaults applied by the wrapper.
      expect(created.variation_number).toBe(1);
      expect(created.tags).toEqual([]);

      const all = await BlogPost.list('user-1');
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(created.id);
    });

    it('filter delegates field matching to storage', async () => {
      await BlogPost.create('user-1', { title: 'Ready', status: 'ready' });
      await BlogPost.create('user-1', { title: 'Draft', status: 'draft' });

      const ready = await BlogPost.filter('user-1', { status: 'ready' });
      expect(ready).toHaveLength(1);
      expect(ready[0].title).toBe('Ready');
    });

    it('get and update round-trip through storage', async () => {
      const created = await BlogPost.create('user-1', { title: 'Original' });

      const updated = await BlogPost.update(created.id, { title: 'Edited' });
      expect(updated.title).toBe('Edited');

      const fetched = await BlogPost.get(created.id);
      expect(fetched.title).toBe('Edited');
    });
  });

  describe('BlogIdea', () => {
    it('create applies defaults and persists', async () => {
      const idea = await BlogIdea.create('user-1', {
        title: 'Idea',
        description: 'desc',
      });

      expect(idea.tone).toBe('professional');
      expect(idea.keywords).toEqual([]);
      expect(idea.status).toBe('draft');

      const all = await BlogIdea.list('user-1');
      expect(all.map((i) => i.id)).toContain(idea.id);
    });
  });

  describe('WordPressSite', () => {
    it('create defaults connection_status and is_active, then filters', async () => {
      const site = await WordPressSite.create('user-1', {
        name: 'Blog',
        url: 'https://blog.example',
        username: 'admin',
        api_key: 'secret',
      });

      expect(site.connection_status).toBe('disconnected');
      expect(site.is_active).toBe(true);

      // Seed an inactive site directly (the wrapper hardcodes is_active: true)
      // so the filter has a non-matching record to exclude — otherwise the
      // assertion would pass even if filtering were a no-op.
      await createStorage('wordpress_sites').create({ name: 'Old', is_active: false });

      const active = await WordPressSite.filter('user-1', { is_active: true });
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(site.id);
    });
  });

  describe('isolation across services', () => {
    it('each service uses its own collection', async () => {
      await BlogPost.create('user-1', { title: 'post' });

      // Creating a post must not leak into other collections.
      expect(await BlogIdea.list('user-1')).toEqual([]);
      expect(await WordPressSite.list('user-1')).toEqual([]);
    });
  });

  describe('User', () => {
    it('me seeds and returns the default local user', async () => {
      const user = await User.me();
      expect(user.id).toBe('local_user');

      const updated = await User.updateMyUserData('clerk-ignored', {
        business_name: 'Acme',
      });
      expect(updated.business_name).toBe('Acme');
    });
  });
});
