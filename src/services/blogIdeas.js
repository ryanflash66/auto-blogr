import { createStorage } from '@/lib/storage';

const storage = createStorage('blog_ideas');

/**
 * BlogIdea Service - handles blog idea operations using local storage
 */
export const BlogIdea = {
  async list(userId, orderBy = '-created_at', limit) {
    return storage.list(orderBy, limit);
  },

  async filter(userId, filters) {
    return storage.filter(filters);
  },

  async create(userId, ideaData) {
    return storage.create({
      title: ideaData.title,
      description: ideaData.description,
      target_audience: ideaData.target_audience,
      tone: ideaData.tone || 'professional',
      keywords: ideaData.keywords || [],
      variations_requested: ideaData.variations_requested || 1,
      status: 'draft',
    });
  },

  async update(id, updates) {
    return storage.update(id, updates);
  },

  async delete(id) {
    return storage.delete(id);
  },
};

export default BlogIdea;
