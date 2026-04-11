import { createStorage } from '@/lib/storage';

const storage = createStorage('blog_post_versions');

/**
 * BlogPostVersion Service - handles version history using local storage
 */
export const BlogPostVersion = {
  async list(blogPostId, orderBy = '-created_at') {
    const all = await storage.list(orderBy);
    return all.filter(v => v.blog_post_id === blogPostId);
  },

  async filter(filters) {
    return storage.filter(filters);
  },

  async get(id) {
    return storage.get(id);
  },

  async create(versionData) {
    return storage.create({
      blog_post_id: versionData.blog_post_id,
      title: versionData.title,
      content: versionData.content,
      excerpt: versionData.excerpt,
      version_number: versionData.version_number,
      change_type: versionData.change_type || 'manual_save',
    });
  },
};

export default BlogPostVersion;
