import { supabase } from '@/lib/supabase';

/**
 * BlogPostVersion Service - handles blog post version history
 */
export const BlogPostVersion = {
  /**
   * List all versions for a blog post
   * @param {string} blogPostId - The blog post ID
   * @param {string} [orderBy='-created_at'] - Sort order
   * @returns {Promise<Array>} List of versions
   */
  async list(blogPostId, orderBy = '-created_at') {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '').replace('created_date', 'created_at');

    const { data, error } = await supabase
      .from('blog_post_versions')
      .select('*')
      .eq('blog_post_id', blogPostId)
      .order(column, { ascending });

    if (error) throw error;
    return data.map(mapVersionFromDb);
  },

  /**
   * Filter versions
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered versions
   */
  async filter(filters) {
    let query = supabase
      .from('blog_post_versions')
      .select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapVersionFromDb);
  },

  /**
   * Create a new version
   * @param {Object} versionData - Version data
   * @returns {Promise<Object>} Created version
   */
  async create(versionData) {
    const { data, error } = await supabase
      .from('blog_post_versions')
      .insert({
        blog_post_id: versionData.blog_post_id,
        title: versionData.title,
        content: versionData.content,
        excerpt: versionData.excerpt,
        version_number: versionData.version_number,
        change_type: versionData.change_type || 'manual_save',
      })
      .select()
      .single();

    if (error) throw error;
    return mapVersionFromDb(data);
  },

  /**
   * Get a specific version
   * @param {string} id - Version ID
   * @returns {Promise<Object>} Version data
   */
  async get(id) {
    const { data, error } = await supabase
      .from('blog_post_versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapVersionFromDb(data);
  },
};

// Helper to map database fields to expected format
function mapVersionFromDb(version) {
  if (!version) return null;
  return {
    ...version,
    created_date: version.created_at,
  };
}

export default BlogPostVersion;
