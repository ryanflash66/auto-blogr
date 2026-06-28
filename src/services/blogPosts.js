import { createStorage } from '@/lib/supabaseStorage';

const storage = createStorage('blog_posts');

/**
 * BlogPost Service - handles blog post operations using local storage
 */
export const BlogPost = {
  async list(userId, orderBy = '-created_at', limit) {
    return storage.list(orderBy, limit);
  },

  async filter(userId, filters) {
    return storage.filter(filters);
  },

  async get(id) {
    return storage.get(id);
  },

  async create(userId, postData) {
    return storage.create({
      blog_idea_id: postData.blog_idea_id,
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      hero_image_url: postData.hero_image_url,
      hero_image_alt: postData.hero_image_alt,
      variation_number: postData.variation_number || 1,
      status: postData.status || 'ready',
      seo_title: postData.seo_title,
      meta_description: postData.meta_description,
      tags: postData.tags || [],
      word_count: postData.word_count || 0,
    });
  },

  async update(id, updates) {
    return storage.update(id, updates);
  },

  async delete(id) {
    return storage.delete(id);
  },
};

export default BlogPost;
