import { supabase } from '@/lib/supabase';

/**
 * BlogIdea Service - handles blog idea database operations
 */
export const BlogIdea = {
  /**
   * List all blog ideas for the current user
   * @param {string} userId - The user's database ID
   * @param {string} [orderBy='-created_at'] - Sort order (prefix with - for descending)
   * @param {number} [limit] - Maximum number of records to return
   * @returns {Promise<Array>} List of blog ideas
   */
  async list(userId, orderBy = '-created_at', limit) {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '').replace('created_date', 'created_at');

    let query = supabase
      .from('blog_ideas')
      .select('*')
      .eq('user_id', userId)
      .order(column, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map database fields to expected format
    return data.map(mapIdeaFromDb);
  },

  /**
   * Filter blog ideas
   * @param {string} userId - The user's database ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered blog ideas
   */
  async filter(userId, filters) {
    let query = supabase
      .from('blog_ideas')
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
    return data.map(mapIdeaFromDb);
  },

  /**
   * Create a new blog idea
   * @param {string} userId - The user's database ID
   * @param {Object} ideaData - Blog idea data
   * @returns {Promise<Object>} Created blog idea
   */
  async create(userId, ideaData) {
    const { data, error } = await supabase
      .from('blog_ideas')
      .insert({
        user_id: userId,
        title: ideaData.title,
        description: ideaData.description,
        target_audience: ideaData.target_audience,
        tone: ideaData.tone,
        keywords: ideaData.keywords || [],
        variations_requested: ideaData.variations_requested || 1,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return mapIdeaFromDb(data);
  },

  /**
   * Update a blog idea
   * @param {string} id - Blog idea ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated blog idea
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('blog_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapIdeaFromDb(data);
  },

  /**
   * Delete a blog idea
   * @param {string} id - Blog idea ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('blog_ideas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Helper to map database fields to expected format
function mapIdeaFromDb(idea) {
  if (!idea) return null;
  return {
    ...idea,
    created_date: idea.created_at,
    updated_date: idea.updated_at,
  };
}

export default BlogIdea;
