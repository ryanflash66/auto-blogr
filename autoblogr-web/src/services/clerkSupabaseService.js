// Clerk-Supabase Integration Service
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabase } from "../config/supabase.js";

/**
 * ClerkSupabaseService - Integrates Clerk authentication with Supabase RLS
 * Handles JWT token passing and user session management
 */
export class ClerkSupabaseService {
  constructor() {
    this.supabaseClient = supabase;
  }

  /**
   * Set Supabase auth token from Clerk
   * @param {string} token - Clerk JWT token
   */
  async setSupabaseToken(token) {
    if (!this.supabaseClient || !token) return;

    try {
      // Set the auth token for Supabase
      await this.supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: token, // Clerk handles refresh
      });
    } catch (error) {
      console.error("Error setting Supabase token:", error);
    }
  }

  /**
   * Clear Supabase session
   */
  async clearSupabaseSession() {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient.auth.signOut();
    } catch (error) {
      console.error("Error clearing Supabase session:", error);
    }
  }

  /**
   * Get authenticated Supabase client
   * @param {string} clerkToken - Clerk JWT token
   * @returns {Object} Authenticated Supabase client
   */
  async getAuthenticatedClient(clerkToken) {
    if (clerkToken) {
      await this.setSupabaseToken(clerkToken);
    }
    return this.supabaseClient;
  }

  /**
   * Perform authenticated query
   * @param {string} table - Table name
   * @param {Object} options - Query options
   * @param {string} clerkToken - Clerk JWT token
   * @returns {Promise<Object>} Query result
   */
  async authenticatedQuery(table, options = {}, clerkToken) {
    const client = await this.getAuthenticatedClient(clerkToken);

    let query = client.from(table);

    // Apply query options
    if (options.select) {
      query = query.select(options.select);
    }
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    if (options.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending,
      });
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    return await query;
  }

  /**
   * Perform authenticated insert
   * @param {string} table - Table name
   * @param {Object|Array} data - Data to insert
   * @param {string} clerkToken - Clerk JWT token
   * @returns {Promise<Object>} Insert result
   */
  async authenticatedInsert(table, data, clerkToken) {
    const client = await this.getAuthenticatedClient(clerkToken);
    return await client.from(table).insert(data).select();
  }

  /**
   * Perform authenticated update
   * @param {string} table - Table name
   * @param {Object} updates - Data to update
   * @param {Object} filter - Where conditions
   * @param {string} clerkToken - Clerk JWT token
   * @returns {Promise<Object>} Update result
   */
  async authenticatedUpdate(table, updates, filter, clerkToken) {
    const client = await this.getAuthenticatedClient(clerkToken);

    let query = client.from(table).update(updates);

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return await query.select();
  }

  /**
   * Perform authenticated delete
   * @param {string} table - Table name
   * @param {Object} filter - Where conditions
   * @param {string} clerkToken - Clerk JWT token
   * @returns {Promise<Object>} Delete result
   */
  async authenticatedDelete(table, filter, clerkToken) {
    const client = await this.getAuthenticatedClient(clerkToken);

    let query = client.from(table);

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return await query.delete().select();
  }
}

/**
 * React Hook for Clerk-Supabase integration
 * Provides authenticated Supabase operations
 */
export function useClerkSupabase() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const service = new ClerkSupabaseService();

  /**
   * Get current user's JWT token
   */
  const getClerkToken = async () => {
    try {
      return await getToken({ template: "supabase" });
    } catch (error) {
      console.error("Error getting Clerk token:", error);
      return null;
    }
  };

  /**
   * Execute authenticated query
   */
  const query = async (table, options = {}) => {
    const token = await getClerkToken();
    if (!token) throw new Error("User not authenticated");

    return await service.authenticatedQuery(table, options, token);
  };

  /**
   * Execute authenticated insert
   */
  const insert = async (table, data) => {
    const token = await getClerkToken();
    if (!token) throw new Error("User not authenticated");

    // Add user_id to data if not present
    if (user && !data.user_id) {
      data.user_id = user.id;
    }

    return await service.authenticatedInsert(table, data, token);
  };

  /**
   * Execute authenticated update
   */
  const update = async (table, updates, filter) => {
    const token = await getClerkToken();
    if (!token) throw new Error("User not authenticated");

    return await service.authenticatedUpdate(table, updates, filter, token);
  };

  /**
   * Execute authenticated delete
   */
  const remove = async (table, filter) => {
    const token = await getClerkToken();
    if (!token) throw new Error("User not authenticated");

    return await service.authenticatedDelete(table, filter, token);
  };

  /**
   * Get current user ID
   */
  const getCurrentUserId = () => {
    return user?.id || null;
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
  };

  return {
    query,
    insert,
    update,
    remove,
    getCurrentUserId,
    isAuthenticated,
    user,
    service,
  };
}

// Export singleton service
export const clerkSupabaseService = new ClerkSupabaseService();
export default ClerkSupabaseService;
