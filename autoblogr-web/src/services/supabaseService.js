// Supabase service layer for AutoBlogr
import {
  supabase,
  isSupabaseConfigured,
  mockData,
} from "../config/supabase.js";

/**
 * SupabaseService - Centralized service for all Supabase operations
 * Provides fallback to mock data when Supabase is not configured
 * Integrates with Clerk authentication for RLS
 */
export class SupabaseService {
  constructor() {
    this.client = supabase;
    this.configured = isSupabaseConfigured;
    this.clerkToken = null;
  }

  /**
   * Set Clerk authentication token for RLS
   * @param {string} token - Clerk JWT token
   */
  setClerkToken(token) {
    this.clerkToken = token;
    if (this.client && token) {
      // Set custom authorization header for RLS
      this.client.rest.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  /**
   * Clear Clerk authentication
   */
  clearClerkToken() {
    this.clerkToken = null;
    if (this.client) {
      delete this.client.rest.headers["Authorization"];
    }
  }

  /**
   * Check if Supabase is properly configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return this.configured;
  }

  /**
   * Check if user is authenticated via Clerk
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.clerkToken;
  }

  /**
   * Get current user
   * @returns {Promise<Object|null>} User object or null
   */
  async getCurrentUser() {
    if (!this.configured) {
      console.log("Supabase not configured, returning mock user");
      return { data: { user: mockData.user }, error: null };
    }

    try {
      const { data, error } = await this.client.auth.getUser();
      return { data, error };
    } catch (error) {
      console.error("Error getting current user:", error);
      return { data: null, error };
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  async signIn(email, password) {
    if (!this.configured) {
      console.log("Supabase not configured, returning mock sign in");
      return {
        data: { user: mockData.user, session: { access_token: "mock-token" } },
        error: null,
      };
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { data: null, error };
    }
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} Registration result
   */
  async signUp(email, password, metadata = {}) {
    if (!this.configured) {
      console.log("Supabase not configured, returning mock sign up");
      return {
        data: { user: { ...mockData.user, email }, session: null },
        error: null,
      };
    }

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      return { data, error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { data: null, error };
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<Object>} Sign out result
   */
  async signOut() {
    if (!this.configured) {
      console.log("Supabase not configured, mock sign out successful");
      return { error: null };
    }

    try {
      const { error } = await this.client.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    }
  }

  /**
   * Subscribe to authentication state changes
   * @param {Function} callback - Callback function for auth changes
   * @returns {Object} Subscription object
   */
  onAuthStateChange(callback) {
    if (!this.configured) {
      console.log("Supabase not configured, mock auth state subscription");
      // Simulate initial auth state
      setTimeout(() => callback("SIGNED_OUT", null), 100);
      return { unsubscribe: () => {} };
    }

    return this.client.auth.onAuthStateChange(callback);
  }

  /**
   * Generic database query method
   * @param {string} table - Table name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query result
   */
  async query(table, options = {}) {
    if (!this.configured || !this.client) {
      console.log(
        `Supabase not configured, returning mock data for table: ${table}`
      );

      // Return mock data based on table name
      switch (table) {
        case "blog_ideas":
          return { data: mockData.blogIdeas, error: null };
        case "blog_posts":
          return { data: [], error: null };
        case "user_profiles":
          return { data: [mockData.user], error: null };
        default:
          return { data: [], error: null };
      }
    }

    try {
      let query = this.client.from(table);

      // Apply select first (default to all columns)
      query = query.select(options.select || "*");

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error(`Error querying ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Insert data into a table
   * @param {string} table - Table name
   * @param {Object|Array} data - Data to insert
   * @returns {Promise<Object>} Insert result
   */
  async insert(table, data) {
    if (!this.configured || !this.client) {
      console.log(`Supabase not configured, mock insert into ${table}:`, data);
      const mockResult = Array.isArray(data) ? data : [data];
      return {
        data: mockResult.map((item) => ({
          ...item,
          id: Math.random().toString(36),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        error: null,
      };
    }

    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select();
      return { data: result, error };
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Update data in a table
   * @param {string} table - Table name
   * @param {Object} updates - Data to update
   * @param {Object} filter - Where conditions
   * @returns {Promise<Object>} Update result
   */
  async update(table, updates, filter) {
    if (!this.configured || !this.client) {
      console.log(`Supabase not configured, mock update in ${table}:`, {
        updates,
        filter,
      });
      return {
        data: [{ ...updates, ...filter, updated_at: new Date().toISOString() }],
        error: null,
      };
    }

    try {
      let query = this.client.from(table).update(updates);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.select();
      return { data, error };
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Delete data from a table
   * @param {string} table - Table name
   * @param {Object} filter - Where conditions
   * @returns {Promise<Object>} Delete result
   */
  async delete(table, filter) {
    if (!this.configured || !this.client) {
      console.log(
        `Supabase not configured, mock delete from ${table}:`,
        filter
      );
      return { data: [], error: null };
    }

    try {
      let query = this.client.from(table);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.delete().select();
      return { data, error };
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default supabaseService;
