import { supabase } from '@/lib/supabase';

/**
 * WordPressSite Service - handles WordPress site connections
 */
export const WordPressSite = {
  /**
   * List all WordPress sites for the current user
   * @param {string} userId - The user's database ID
   * @param {string} [orderBy='-created_at'] - Sort order
   * @param {number} [limit] - Maximum number of records
   * @returns {Promise<Array>} List of sites
   */
  async list(userId, orderBy = '-created_at', limit) {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '').replace('created_date', 'created_at');

    let query = supabase
      .from('wordpress_sites')
      .select('*')
      .eq('user_id', userId)
      .order(column, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapSiteFromDb);
  },

  /**
   * Filter WordPress sites
   * @param {string} userId - The user's database ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered sites
   */
  async filter(userId, filters) {
    let query = supabase
      .from('wordpress_sites')
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
    return data.map(mapSiteFromDb);
  },

  /**
   * Get a single site by ID
   * @param {string} id - Site ID
   * @returns {Promise<Object>} Site data
   */
  async get(id) {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapSiteFromDb(data);
  },

  /**
   * Create a new WordPress site
   * @param {string} userId - The user's database ID
   * @param {Object} siteData - Site data
   * @returns {Promise<Object>} Created site
   */
  async create(userId, siteData) {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .insert({
        user_id: userId,
        name: siteData.name,
        url: siteData.url,
        username: siteData.username,
        api_key: siteData.api_key,
        default_category: siteData.default_category,
        default_author: siteData.default_author,
        connection_status: siteData.connection_status || 'disconnected',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return mapSiteFromDb(data);
  },

  /**
   * Update a WordPress site
   * @param {string} id - Site ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated site
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSiteFromDb(data);
  },

  /**
   * Delete a WordPress site
   * @param {string} id - Site ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('wordpress_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Test connection to a WordPress site
   * @param {Object} site - Site data with credentials
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testConnection(site) {
    try {
      const baseUrl = site.url.replace(/\/$/, '');
      const auth = btoa(`${site.username}:${site.api_key}`);

      const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: error.message || `HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Connection failed' 
      };
    }
  },
};

// Helper to map database fields to expected format
function mapSiteFromDb(site) {
  if (!site) return null;
  return {
    ...site,
    created_date: site.created_at,
    updated_date: site.updated_at,
  };
}

export default WordPressSite;
