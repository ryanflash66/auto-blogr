import { supabase } from '@/lib/supabase';

/**
 * BlogPost Service - handles blog post database operations
 */
export const BlogPost = {
  /**
   * List all blog posts for the current user
   * @param {string} userId - The user's database ID
   * @param {string} [orderBy='-created_at'] - Sort order
   * @param {number} [limit] - Maximum number of records
   * @returns {Promise<Array>} List of blog posts
   */
  async list(userId, orderBy = '-created_at', limit) {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '').replace('created_date', 'created_at');

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('user_id', userId)
      .order(column, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapPostFromDb);
  },

  /**
   * Filter blog posts
   * @param {string} userId - The user's database ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered blog posts
   */
  async filter(userId, filters) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('user_id', userId);

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'id') {
        query = query.eq('id', value);
      } else {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapPostFromDb);
  },

  /**
   * Get a single blog post by ID
   * @param {string} id - Blog post ID
   * @returns {Promise<Object>} Blog post
   */
  async get(id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapPostFromDb(data);
  },

  /**
   * Create a new blog post
   * @param {string} userId - The user's database ID
   * @param {Object} postData - Blog post data
   * @returns {Promise<Object>} Created blog post
   */
  async create(userId, postData) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        user_id: userId,
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
      })
      .select()
      .single();

    if (error) throw error;
    return mapPostFromDb(data);
  },

  /**
   * Update a blog post
   * @param {string} id - Blog post ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated blog post
   */
  async update(id, updates) {
    // Map field names if needed
    const dbUpdates = { ...updates };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapPostFromDb(data);
  },

  /**
   * Delete a blog post
   * @param {string} id - Blog post ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Helper to map database fields to expected format
function mapPostFromDb(post) {
  if (!post) return null;
  return {
    ...post,
    created_date: post.created_at,
    updated_date: post.updated_at,
  };
}

export default BlogPost;
