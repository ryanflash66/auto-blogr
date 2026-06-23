import wordpressService from "@/services/wordpressService";

/**
 * WordPressSite Entity
 * Manages WordPress site connections and operations
 */
export class WordPressSite {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.url = data.url || "";
    this.username = data.username || "";
    this.password = data.password || ""; // Application password
    this.authMethod = data.authMethod || "application_password";
    this.status = data.status || "disconnected";
    this.lastSync = data.lastSync || null;
    this.capabilities = data.capabilities || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate WordPress site data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = {};

    if (!this.name?.trim()) {
      errors.name = "Site name is required";
    }

    if (!this.url?.trim()) {
      errors.url = "Site URL is required";
    } else if (!this.isValidUrl(this.url)) {
      errors.url = "Please enter a valid URL";
    }

    if (!this.username?.trim()) {
      errors.username = "Username is required";
    }

    if (!this.password?.trim()) {
      errors.password = "Application password is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL to validate
   * @returns {boolean} Validation result
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test connection to WordPress site
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      // Update service configuration temporarily for this test
      const originalConfig = wordpressService.config;
      wordpressService.config = {
        ...originalConfig,
        apiUrl: `${this.url.replace(/\/$/, "")}/wp-json/wp/v2`,
        username: this.username,
        password: this.password,
        mockMode: false,
      };

      const result = await wordpressService.testConnection();

      // Restore original configuration
      wordpressService.config = originalConfig;

      if (result.success) {
        this.status = "connected";
        this.capabilities = result.capabilities;
        this.lastSync = new Date();
      } else {
        this.status = "error";
      }

      return result;
    } catch (error) {
      this.status = "error";
      return {
        success: false,
        message: error.message,
        error: error.toString(),
      };
    }
  }

  /**
   * Publish blog post to this WordPress site
   * @param {Object} postData - Blog post data
   * @returns {Promise<Object>} Publishing result
   */
  async publishPost(postData) {
    if (this.status !== "connected") {
      throw new Error("WordPress site is not connected");
    }

    try {
      // Update service configuration for this site
      const originalConfig = wordpressService.config;
      wordpressService.config = {
        ...originalConfig,
        apiUrl: `${this.url.replace(/\/$/, "")}/wp-json/wp/v2`,
        username: this.username,
        password: this.password,
        mockMode: originalConfig.mockMode,
      };

      const result = await wordpressService.createPost({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        status: postData.status || "draft",
        categories: postData.categories || [],
        tags: postData.tags || [],
      });

      // Restore original configuration
      wordpressService.config = originalConfig;

      this.lastSync = new Date();
      return result;
    } catch (error) {
      throw new Error(`Failed to publish to ${this.name}: ${error.message}`);
    }
  }

  /**
   * Get categories from this WordPress site
   * @returns {Promise<Array>} Categories list
   */
  async getCategories() {
    // Similar pattern as publishPost - update config temporarily
    const originalConfig = wordpressService.config;
    wordpressService.config = {
      ...originalConfig,
      apiUrl: `${this.url.replace(/\/$/, "")}/wp-json/wp/v2`,
      username: this.username,
      password: this.password,
      mockMode: originalConfig.mockMode,
    };

    try {
      const categories = await wordpressService.getCategories();
      wordpressService.config = originalConfig;
      return categories;
    } catch (error) {
      wordpressService.config = originalConfig;
      throw error;
    }
  }

  /**
   * Get tags from this WordPress site
   * @returns {Promise<Array>} Tags list
   */
  async getTags() {
    const originalConfig = wordpressService.config;
    wordpressService.config = {
      ...originalConfig,
      apiUrl: `${this.url.replace(/\/$/, "")}/wp-json/wp/v2`,
      username: this.username,
      password: this.password,
      mockMode: originalConfig.mockMode,
    };

    try {
      const tags = await wordpressService.getTags();
      wordpressService.config = originalConfig;
      return tags;
    } catch (error) {
      wordpressService.config = originalConfig;
      throw error;
    }
  }

  /**
   * Save WordPress site configuration
   * @returns {Promise<WordPressSite>} Saved site
   */
  async save() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${Object.values(validation.errors).join(", ")}`
      );
    }

    this.updatedAt = new Date();

    // In development mode, simulate saving
    if (import.meta.env.DEV) {
      this.id = this.id || `wp-site-${Date.now()}`;
      console.log("🔧 WordPress Site saved in development mode:", this.name);
      return this;
    }

    // TODO: Implement actual Supabase persistence
    // const { data, error } = await supabase
    //   .from('wordpress_sites')
    //   .upsert(this.toJSON())
    //   .select()
    //   .single();

    return this;
  }

  /**
   * Delete WordPress site
   * @returns {Promise<boolean>} Deletion result
   */
  async delete() {
    if (import.meta.env.DEV) {
      console.log("🔧 WordPress Site deleted in development mode:", this.name);
      return true;
    }

    // TODO: Implement actual Supabase deletion
    // const { error } = await supabase
    //   .from('wordpress_sites')
    //   .delete()
    //   .eq('id', this.id);

    return true;
  }

  /**
   * Convert to JSON for API persistence
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      username: this.username,
      password: this.password, // Note: In production, encrypt this
      authMethod: this.authMethod,
      status: this.status,
      lastSync: this.lastSync,
      capabilities: this.capabilities,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create WordPress site from JSON data
   * @param {Object} data - JSON data
   * @returns {WordPressSite} WordPress site instance
   */
  static fromJSON(data) {
    return new WordPressSite(data);
  }

  /**
   * Get all WordPress sites
   * @returns {Promise<Array<WordPressSite>>} List of sites
   */
  static async findAll() {
    if (import.meta.env.DEV) {
      // Return mock data in development
      return [
        new WordPressSite({
          id: "dev-site-1",
          name: "Development Blog",
          url: "https://example.dev",
          username: "dev_user",
          password: "dev_password",
          status: "connected",
          lastSync: new Date(),
          capabilities: { publish_posts: true, edit_posts: true },
        }),
        new WordPressSite({
          id: "dev-site-2",
          name: "Test Site",
          url: "https://test.example.com",
          username: "test_user",
          password: "test_password",
          status: "disconnected",
          lastSync: null,
          capabilities: {},
        }),
      ];
    }

    // TODO: Implement actual Supabase query
    // const { data, error } = await supabase
    //   .from('wordpress_sites')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    return [];
  }

  /**
   * Find WordPress site by ID
   * @param {string} id - Site ID
   * @returns {Promise<WordPressSite|null>} WordPress site or null
   */
  static async findById(id) {
    if (import.meta.env.DEV) {
      const sites = await WordPressSite.findAll();
      return sites.find((site) => site.id === id) || null;
    }

    // TODO: Implement actual Supabase query
    // const { data, error } = await supabase
    //   .from('wordpress_sites')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    return null;
  }
}

export default WordPressSite;
