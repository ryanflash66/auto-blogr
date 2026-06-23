import { getWordPressConfig, isWordPressConfigured } from "@/config/wordpress";

/**
 * WordPress API Service
 * Handles all WordPress integration operations with proper error handling
 */
class WordPressService {
  constructor() {
    this.config = getWordPressConfig();
    this.isConfigured = isWordPressConfigured();
  }

  /**
   * Create authentication headers for WordPress API
   * @returns {Object} Authentication headers
   */
  getAuthHeaders() {
    if (this.config.mockMode) {
      return { "X-Mock-Mode": "true" };
    }

    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Make authenticated request to WordPress API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint, options = {}) {
    if (this.config.mockMode) {
      console.log(`🔧 WordPress Mock Request: ${endpoint}`);
      return this.getMockResponse(endpoint, options);
    }

    const url = `${this.config.apiUrl}/${endpoint}`;
    const requestOptions = {
      timeout: this.config.timeout,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(
          `WordPress API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("WordPress API request failed:", error);
      throw new Error(`Failed to connect to WordPress: ${error.message}`);
    }
  }

  /**
   * Get mock response for development mode
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Mock response
   */
  async getMockResponse(endpoint, options) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (endpoint.includes("posts")) {
      if (options.method === "POST") {
        const postData = options.body ? JSON.parse(options.body) : {};
        return {
          id: Math.floor(Math.random() * 1000),
          title: { rendered: postData.title || "Mock Post" },
          content: { rendered: postData.content || "<p>Mock content</p>" },
          status: postData.status || "draft",
          link: `https://example.dev/mock-post-${Date.now()}`,
          date: new Date().toISOString(),
        };
      }
      return this.config.mockData.posts;
    }

    if (endpoint.includes("categories")) {
      return this.config.mockData.categories;
    }

    if (endpoint.includes("tags")) {
      return this.config.mockData.tags;
    }

    if (endpoint.includes("users/me")) {
      return {
        id: 1,
        name: "Development User",
        username: "dev_user",
        email: "dev@example.com",
        capabilities: { publish_posts: true, edit_posts: true },
      };
    }

    if (endpoint.includes("media") && options.method === "POST") {
      return {
        id: Math.floor(Math.random() * 1000),
        url: `https://example.dev/wp-content/uploads/mock-image-${Date.now()}.jpg`,
        title: { rendered: "Mock Image" },
        alt_text: "Mock image for development",
      };
    }

    return { success: true, data: `Mock response for ${endpoint}` };
  }

  /**
   * Test WordPress connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const userInfo = await this.makeRequest("users/me");
      return {
        success: true,
        message: "WordPress connection successful",
        user: userInfo.name || userInfo.username,
        capabilities: userInfo.capabilities || {},
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.toString(),
      };
    }
  }

  /**
   * Get all WordPress sites (for multi-site support)
   * @returns {Promise<Array>} List of sites
   */
  async getSites() {
    if (this.config.mockMode) {
      return this.config.mockData.sites;
    }

    try {
      const sites = await this.makeRequest("sites");
      return sites;
    } catch (error) {
      console.warn(
        "Failed to fetch sites, returning current site only:",
        error
      );
      return [
        {
          id: "current",
          name: "Current Site",
          url: this.config.apiUrl.replace("/wp-json", ""),
          status: "connected",
        },
      ];
    }
  }

  /**
   * Create a new WordPress post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  async createPost(postData) {
    const {
      title,
      content,
      excerpt,
      status = "draft",
      categories = [],
      tags = [],
    } = postData;

    const wordpressPost = {
      title,
      content,
      excerpt,
      status,
      categories,
      tags,
    };

    try {
      const response = await this.makeRequest("posts", {
        method: "POST",
        body: JSON.stringify(wordpressPost),
      });

      return {
        success: true,
        post: response,
        message: `Post "${title}" created successfully as ${status}`,
      };
    } catch (error) {
      throw new Error(`Failed to create WordPress post: ${error.message}`);
    }
  }

  /**
   * Update an existing WordPress post
   * @param {number} postId - WordPress post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(postId, postData) {
    try {
      const response = await this.makeRequest(`posts/${postId}`, {
        method: "POST",
        body: JSON.stringify(postData),
      });

      return {
        success: true,
        post: response,
        message: `Post updated successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to update WordPress post: ${error.message}`);
    }
  }

  /**
   * Get WordPress categories
   * @returns {Promise<Array>} List of categories
   */
  async getCategories() {
    try {
      return await this.makeRequest("categories?per_page=100");
    } catch (error) {
      console.warn("Failed to fetch categories:", error);
      return this.config.mockData.categories;
    }
  }

  /**
   * Get WordPress tags
   * @returns {Promise<Array>} List of tags
   */
  async getTags() {
    try {
      return await this.makeRequest("tags?per_page=100");
    } catch (error) {
      console.warn("Failed to fetch tags:", error);
      return this.config.mockData.tags;
    }
  }

  /**
   * Upload media to WordPress
   * @param {File} file - File to upload
   * @param {string} title - Media title
   * @returns {Promise<Object>} Uploaded media info
   */
  async uploadMedia(file, title) {
    if (this.config.mockMode) {
      return {
        id: Math.floor(Math.random() * 1000),
        url: `https://example.dev/wp-content/uploads/mock-image-${Date.now()}.jpg`,
        title: { rendered: title || file.name },
        alt_text: title || file.name,
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    try {
      const headers = this.getAuthHeaders();
      delete headers["Content-Type"]; // Let browser set with boundary

      const response = await this.makeRequest("media", {
        method: "POST",
        body: formData,
        headers,
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new WordPressService();
