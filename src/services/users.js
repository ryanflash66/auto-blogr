import { supabase } from '@/lib/supabase';

/**
 * User Service - handles user-related database operations
 */
export const User = {
  /**
   * Get the current user's data
   * @param {string} clerkId - The Clerk user ID
   * @returns {Promise<Object>} User data
   */
  async me(clerkId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update the current user's data
   * @param {string} clerkId - The Clerk user ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateMyUserData(clerkId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user by Clerk ID
   * @param {string} clerkId - The Clerk user ID
   * @returns {Promise<Object|null>} User data or null
   */
  async getByClerkId(clerkId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

export default User;
