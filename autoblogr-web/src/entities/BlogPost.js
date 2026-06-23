// BlogPost Entity for AutoBlogr
import { supabaseService } from "../services/supabaseService.js";

/**
 * BlogPost Entity - Represents a generated blog post in the AutoBlogr system
 *
 * Status Flow: draft → review → published → archived
 */
class BlogPost {
  constructor(data = {}) {
    this.id = data.id || null;
    this.ideaId = data.idea_id || data.ideaId || null;
    this.userId = data.user_id || data.userId || null;
    this.title = data.title || "";
    this.slug = data.slug || "";
    this.excerpt = data.excerpt || "";
    this.content = data.content || "";
    this.featuredImageUrl =
      data.featured_image_url || data.featuredImageUrl || "";
    this.metaDescription = data.meta_description || data.metaDescription || "";
    this.metaKeywords = data.meta_keywords || data.metaKeywords || [];
    this.wordCount = data.word_count || data.wordCount || 0;
    this.readingTime = data.reading_time || data.readingTime || 0;
    this.status = data.status || "draft";
    this.wordpressPostId =
      data.wordpress_post_id || data.wordpressPostId || null;
    this.wordpressSiteId =
      data.wordpress_site_id || data.wordpressSiteId || null;
    this.publishedAt = data.published_at || data.publishedAt || null;
    this.aiGenerated =
      data.ai_generated !== undefined
        ? data.ai_generated
        : data.aiGenerated !== undefined
        ? data.aiGenerated
        : true;
    this.aiModel = data.ai_model || data.aiModel || "";
    this.generationCost = data.generation_cost || data.generationCost || 0.0;
    this.seoAnalysis = data.seo_analysis || data.seoAnalysis || {};
    this.performanceMetrics =
      data.performance_metrics || data.performanceMetrics || {};
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;

    // Validation errors
    this.errors = {};
  }

  /**
   * Validate the blog post data
   * @returns {boolean} True if valid, false otherwise
   */
  validate() {
    this.errors = {};

    if (!this.title || this.title.trim().length === 0) {
      this.errors.title = "Title is required";
    } else if (this.title.length > 300) {
      this.errors.title = "Title must be under 300 characters";
    }

    if (!this.content || this.content.trim().length === 0) {
      this.errors.content = "Content is required";
    } else if (this.content.length < 100) {
      this.errors.content = "Content must be at least 100 characters";
    }

    if (this.excerpt && this.excerpt.length > 500) {
      this.errors.excerpt = "Excerpt must be under 500 characters";
    }

    if (this.metaDescription && this.metaDescription.length > 160) {
      this.errors.metaDescription =
        "Meta description should be under 160 characters for SEO";
    }

    const validStatuses = ["draft", "review", "published", "archived"];
    if (!validStatuses.includes(this.status)) {
      this.errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
    }

    if (this.slug && !/^[a-z0-9-]+$/.test(this.slug)) {
      this.errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Generate a slug from the title
   * @returns {string} Generated slug
   */
  generateSlug() {
    if (!this.title) return "";

    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    return this.slug;
  }

  /**
   * Generate an excerpt from content if not provided
   * @param {number} maxLength - Maximum excerpt length
   * @returns {string} Generated excerpt
   */
  generateExcerpt(maxLength = 300) {
    if (this.excerpt) return this.excerpt;

    if (!this.content) return "";

    // Remove HTML tags and get plain text
    const plainText = this.content.replace(/<[^>]*>/g, "").trim();

    if (plainText.length <= maxLength) {
      this.excerpt = plainText;
    } else {
      // Find the last complete sentence within the limit
      const truncated = plainText.substring(0, maxLength);
      const lastSentence = truncated.lastIndexOf(".");

      if (lastSentence > maxLength * 0.7) {
        this.excerpt = truncated.substring(0, lastSentence + 1);
      } else {
        this.excerpt = truncated + "...";
      }
    }

    return this.excerpt;
  }

  /**
   * Calculate reading time based on content
   * @param {number} wordsPerMinute - Average reading speed
   * @returns {number} Reading time in minutes
   */
  calculateReadingTime(wordsPerMinute = 200) {
    if (!this.content) return 0;

    const plainText = this.content.replace(/<[^>]*>/g, "");
    const wordCount = plainText.trim().split(/\s+/).length;
    this.wordCount = wordCount;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);

    return this.readingTime;
  }

  /**
   * Generate meta description from content if not provided
   * @param {number} maxLength - Maximum meta description length
   * @returns {string} Generated meta description
   */
  generateMetaDescription(maxLength = 160) {
    if (this.metaDescription) return this.metaDescription;

    const excerpt = this.generateExcerpt(maxLength);
    this.metaDescription = excerpt.replace(/\.\.\.$/, "").trim();

    return this.metaDescription;
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDbFormat() {
    return {
      id: this.id,
      idea_id: this.ideaId,
      user_id: this.userId,
      title: this.title,
      slug: this.slug,
      excerpt: this.excerpt,
      content: this.content,
      featured_image_url: this.featuredImageUrl,
      meta_description: this.metaDescription,
      meta_keywords: this.metaKeywords,
      word_count: this.wordCount,
      reading_time: this.readingTime,
      status: this.status,
      wordpress_post_id: this.wordpressPostId,
      wordpress_site_id: this.wordpressSiteId,
      published_at: this.publishedAt,
      ai_generated: this.aiGenerated,
      ai_model: this.aiModel,
      generation_cost: this.generationCost,
      seo_analysis: this.seoAnalysis,
      performance_metrics: this.performanceMetrics,
    };
  }

  /**
   * Save the blog post to database
   * @returns {Promise<boolean>} True if successful
   */
  async save() {
    // Auto-calculate fields before validation
    this.calculateReadingTime();
    if (!this.slug) this.generateSlug();
    if (!this.excerpt) this.generateExcerpt();
    if (!this.metaDescription) this.generateMetaDescription();

    if (!this.validate()) {
      throw new Error(
        `Validation failed: ${Object.values(this.errors).join(", ")}`
      );
    }

    try {
      const dbData = this.toDbFormat();

      if (this.id) {
        // Update existing post
        const { data, error } = await supabaseService.update(
          "blog_posts",
          dbData,
          { id: this.id }
        );
        if (error) throw error;

        if (data && data.length > 0) {
          this.updatedAt = data[0].updated_at;
        }
      } else {
        // Create new post
        const { data, error } = await supabaseService.insert(
          "blog_posts",
          dbData
        );
        if (error) throw error;

        if (data && data.length > 0) {
          this.id = data[0].id;
          this.createdAt = data[0].created_at;
          this.updatedAt = data[0].updated_at;
          this.wordCount = data[0].word_count;
          this.readingTime = data[0].reading_time;
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving blog post:", error);
      throw error;
    }
  }

  /**
   * Delete the blog post from database
   * @returns {Promise<boolean>} True if successful
   */
  async delete() {
    if (!this.id) {
      throw new Error("Cannot delete post without ID");
    }

    try {
      const { error } = await supabaseService.delete("blog_posts", {
        id: this.id,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  }

  /**
   * Update post status
   * @param {string} newStatus - New status value
   * @returns {Promise<boolean>} True if successful
   */
  async updateStatus(newStatus) {
    const validStatuses = ["draft", "review", "published", "archived"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    this.status = newStatus;

    // Set published date if publishing
    if (newStatus === "published" && !this.publishedAt) {
      this.publishedAt = new Date().toISOString();
    }

    return await this.save();
  }

  /**
   * Publish the post
   * @returns {Promise<boolean>} True if successful
   */
  async publish() {
    return await this.updateStatus("published");
  }

  /**
   * Archive the post
   * @returns {Promise<boolean>} True if successful
   */
  async archive() {
    return await this.updateStatus("archived");
  }

  /**
   * Update WordPress post ID after publishing
   * @param {number} wordpressPostId - WordPress post ID
   * @param {string} wordpressSiteId - WordPress site ID
   * @returns {Promise<boolean>} True if successful
   */
  async updateWordPressInfo(wordpressPostId, wordpressSiteId) {
    this.wordpressPostId = wordpressPostId;
    this.wordpressSiteId = wordpressSiteId;
    return await this.save();
  }

  /**
   * Update SEO analysis
   * @param {Object} analysis - SEO analysis data
   * @returns {Promise<boolean>} True if successful
   */
  async updateSeoAnalysis(analysis) {
    this.seoAnalysis = { ...this.seoAnalysis, ...analysis };
    return await this.save();
  }

  /**
   * Update performance metrics
   * @param {Object} metrics - Performance metrics
   * @returns {Promise<boolean>} True if successful
   */
  async updatePerformanceMetrics(metrics) {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
    return await this.save();
  }

  // Static methods for querying

  /**
   * Find blog post by ID
   * @param {string} id - Blog post ID
   * @returns {Promise<BlogPost|null>} BlogPost instance or null
   */
  static async findById(id) {
    try {
      const { data, error } = await supabaseService.query("blog_posts", {
        filter: { id },
        limit: 1,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return new BlogPost(data[0]);
    } catch (error) {
      console.error("Error finding blog post by ID:", error);
      throw error;
    }
  }

  /**
   * Find blog posts by idea ID
   * @param {string} ideaId - Blog idea ID
   * @returns {Promise<BlogPost[]>} Array of BlogPost instances
   */
  static async findByIdeaId(ideaId) {
    try {
      const { data, error } = await supabaseService.query("blog_posts", {
        filter: { idea_id: ideaId },
        order: { column: "created_at", ascending: false },
      });

      if (error) throw error;

      return (data || []).map((item) => new BlogPost(item));
    } catch (error) {
      console.error("Error finding blog posts by idea ID:", error);
      throw error;
    }
  }

  /**
   * Find all blog posts for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<BlogPost[]>} Array of BlogPost instances
   */
  static async findByUserId(userId, options = {}) {
    try {
      const queryOptions = {
        filter: { user_id: userId },
        order: { column: "created_at", ascending: false },
        ...options,
      };

      const { data, error } = await supabaseService.query(
        "blog_posts",
        queryOptions
      );
      if (error) throw error;

      return (data || []).map((item) => new BlogPost(item));
    } catch (error) {
      console.error("Error finding blog posts by user ID:", error);
      throw error;
    }
  }

  /**
   * Find blog posts by status
   * @param {string} status - Status to filter by
   * @param {string} userId - User ID (optional)
   * @returns {Promise<BlogPost[]>} Array of BlogPost instances
   */
  static async findByStatus(status, userId = null) {
    try {
      const filter = { status };
      if (userId) filter.user_id = userId;

      const { data, error } = await supabaseService.query("blog_posts", {
        filter,
        order: { column: "created_at", ascending: false },
      });

      if (error) throw error;

      return (data || []).map((item) => new BlogPost(item));
    } catch (error) {
      console.error("Error finding blog posts by status:", error);
      throw error;
    }
  }

  /**
   * Get published posts for a user
   * @param {string} userId - User ID
   * @returns {Promise<BlogPost[]>} Array of published BlogPost instances
   */
  static async getPublishedPosts(userId) {
    return await BlogPost.findByStatus("published", userId);
  }

  /**
   * Create a new blog post from an idea
   * @param {Object} ideaData - Blog idea data
   * @param {Object} postData - Additional post data
   * @returns {BlogPost} New BlogPost instance
   */
  static createFromIdea(ideaData, postData = {}) {
    return new BlogPost({
      ideaId: ideaData.id,
      userId: ideaData.userId || ideaData.user_id,
      title: postData.title || ideaData.title,
      aiModel: postData.aiModel || "gpt-4o-mini",
      ...postData,
    });
  }

  /**
   * Create a new blog post with default values
   * @param {string} userId - User ID
   * @param {Object} data - Initial data
   * @returns {BlogPost} New BlogPost instance
   */
  static create(userId, data = {}) {
    return new BlogPost({
      userId,
      ...data,
    });
  }
}

// Export both named and default exports
export { BlogPost };
export default BlogPost;
