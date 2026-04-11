import { createStorage } from '@/lib/storage';

const storage = createStorage('wordpress_sites');

/**
 * WordPressSite Service - handles WordPress site connections using local storage
 */
export const WordPressSite = {
  async list(userId, orderBy = '-created_at', limit) {
    return storage.list(orderBy, limit);
  },

  async filter(userId, filters) {
    return storage.filter(filters);
  },

  async get(id) {
    return storage.get(id);
  },

  async create(userId, siteData) {
    return storage.create({
      name: siteData.name,
      url: siteData.url,
      username: siteData.username,
      api_key: siteData.api_key,
      default_category: siteData.default_category,
      default_author: siteData.default_author,
      connection_status: siteData.connection_status || 'disconnected',
      is_active: true,
    });
  },

  async update(id, updates) {
    return storage.update(id, updates);
  },

  async delete(id) {
    return storage.delete(id);
  },

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

export default WordPressSite;
