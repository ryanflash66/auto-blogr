/**
 * Local Storage Service
 * Simple persistent storage using localStorage - no Supabase needed
 */

const STORAGE_PREFIX = 'autoblogr_';

const getKey = (collection) => `${STORAGE_PREFIX}${collection}`;

const getCollection = (name) => {
  const data = localStorage.getItem(getKey(name));
  return data ? JSON.parse(data) : [];
};

const saveCollection = (name, data) => {
  localStorage.setItem(getKey(name), JSON.stringify(data));
};

const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Generic CRUD operations for any collection
 */
export const createStorage = (collectionName) => ({
  list: async (orderBy = '-created_at', limit) => {
    let items = getCollection(collectionName);
    
    // Sort
    const ascending = !orderBy.startsWith('-');
    const field = orderBy.replace(/^-/, '');
    items.sort((a, b) => {
      const aVal = a[field] || '';
      const bVal = b[field] || '';
      return ascending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    // Limit
    if (limit) items = items.slice(0, limit);
    
    return items;
  },

  filter: async (filters) => {
    const items = getCollection(collectionName);
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => item[key] === value);
    });
  },

  get: async (id) => {
    const items = getCollection(collectionName);
    return items.find(item => item.id === id) || null;
  },

  create: async (data) => {
    const items = getCollection(collectionName);
    const newItem = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_date: new Date().toISOString(),
    };
    items.push(newItem);
    saveCollection(collectionName, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = getCollection(collectionName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveCollection(collectionName, items);
    return items[index];
  },

  delete: async (id) => {
    const items = getCollection(collectionName);
    const filtered = items.filter(item => item.id !== id);
    saveCollection(collectionName, filtered);
  },
});

// User storage (special case - single user)
export const userStorage = {
  get: async () => {
    const data = localStorage.getItem(getKey('user'));
    if (data) return JSON.parse(data);
    
    // Create default user
    const defaultUser = {
      id: 'local_user',
      full_name: 'Local User',
      email: 'user@local.app',
      business_name: '',
      business_description: '',
      industry: '',
      target_audience: '',
      brand_voice: 'professional',
      content_preferences: {
        preferred_length: 'medium',
        include_images: true,
        seo_focused: true
      },
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(getKey('user'), JSON.stringify(defaultUser));
    return defaultUser;
  },
  
  update: async (updates) => {
    const current = await userStorage.get();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(getKey('user'), JSON.stringify(updated));
    return updated;
  },
};

export default { createStorage, userStorage };
