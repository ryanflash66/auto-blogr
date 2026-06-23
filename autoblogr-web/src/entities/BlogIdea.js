// BlogIdea Entity for AutoBlogr
import { supabaseService } from "../services/supabaseService.js";

/**
 * BlogIdea Entity - Represents a blog idea in the AutoBlogr system
 *
 * Status Flow: draft → ready → generating → generated → published
 */
class BlogIdea {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.user_id || data.userId || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.targetKeywords = data.target_keywords || data.targetKeywords || [];
    this.targetAudience = data.target_audience || data.targetAudience || "";
    this.contentType = data.content_type || data.contentType || "blog_post";
    this.tone = data.tone || "professional";
    this.wordCountTarget =
      data.word_count_target || data.wordCountTarget || 1000;
    this.status = data.status || "draft";
    this.seoScore = data.seo_score || data.seoScore || 0;
    this.metadata = data.metadata || {};
    this.aiEnhanced = data.ai_enhanced || data.aiEnhanced || false;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;

    // Validation errors
    this.errors = {};
  }

  /**
   * Validate the blog idea data
   * @returns {boolean} True if valid, false otherwise
   */
  validate() {
    this.errors = {};

    if (!this.title || this.title.trim().length === 0) {
      this.errors.title = "Title is required";
    } else if (this.title.length > 200) {
      this.errors.title = "Title must be under 200 characters";
    }

    if (this.description && this.description.length > 1000) {
      this.errors.description = "Description must be under 1000 characters";
    }

    if (this.wordCountTarget < 100 || this.wordCountTarget > 10000) {
      this.errors.wordCountTarget =
        "Word count target must be between 100 and 10,000";
    }

    const validStatuses = [
      "draft",
      "ready",
      "generating",
      "generated",
      "published",
    ];
    if (!validStatuses.includes(this.status)) {
      this.errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
    }

    const validContentTypes = ["blog_post", "article", "tutorial", "review"];
    if (!validContentTypes.includes(this.contentType)) {
      this.errors.contentType = `Content type must be one of: ${validContentTypes.join(
        ", "
      )}`;
    }

    const validTones = [
      "professional",
      "casual",
      "friendly",
      "authoritative",
      "conversational",
    ];
    if (!validTones.includes(this.tone)) {
      this.errors.tone = `Tone must be one of: ${validTones.join(", ")}`;
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Get validation errors
   * @returns {Object} Validation errors object
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Check if the idea is valid
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.validate();
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDbFormat() {
    return {
      id: this.id,
      user_id: this.userId,
      title: this.title,
      description: this.description,
      target_keywords: this.targetKeywords,
      target_audience: this.targetAudience,
      content_type: this.contentType,
      tone: this.tone,
      word_count_target: this.wordCountTarget,
      status: this.status,
      seo_score: this.seoScore,
      metadata: this.metadata,
      ai_enhanced: this.aiEnhanced,
    };
  }

  /**
   * Save the blog idea to database
   * @returns {Promise<boolean>} True if successful
   */
  async save() {
    if (!this.validate()) {
      throw new Error(
        `Validation failed: ${Object.values(this.errors).join(", ")}`
      );
    }

    try {
      const dbData = this.toDbFormat();

      if (this.id) {
        // Update existing idea
        const { data, error } = await supabaseService.update(
          "blog_ideas",
          dbData,
          { id: this.id }
        );
        if (error) throw error;

        if (data && data.length > 0) {
          this.updatedAt = data[0].updated_at;
        }
      } else {
        // Create new idea
        const { data, error } = await supabaseService.insert(
          "blog_ideas",
          dbData
        );
        if (error) throw error;

        if (data && data.length > 0) {
          this.id = data[0].id;
          this.createdAt = data[0].created_at;
          this.updatedAt = data[0].updated_at;
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving blog idea:", error);
      throw error;
    }
  }

  /**
   * Delete the blog idea from database
   * @returns {Promise<boolean>} True if successful
   */
  async delete() {
    if (!this.id) {
      throw new Error("Cannot delete idea without ID");
    }

    try {
      const { error } = await supabaseService.delete("blog_ideas", {
        id: this.id,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting blog idea:", error);
      throw error;
    }
  }

  /**
   * Update idea status
   * @param {string} newStatus - New status value
   * @returns {Promise<boolean>} True if successful
   */
  async updateStatus(newStatus) {
    const validStatuses = [
      "draft",
      "ready",
      "generating",
      "generated",
      "published",
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    this.status = newStatus;
    return await this.save();
  }

  /**
   * Mark idea as AI enhanced
   * @returns {Promise<boolean>} True if successful
   */
  async markAsAIEnhanced() {
    this.aiEnhanced = true;
    return await this.save();
  }

  /**
   * Update SEO score
   * @param {number} score - SEO score (0-100)
   * @returns {Promise<boolean>} True if successful
   */
  async updateSeoScore(score) {
    if (score < 0 || score > 100) {
      throw new Error("SEO score must be between 0 and 100");
    }

    this.seoScore = score;
    return await this.save();
  }

  /**
   * Clone the idea (create a copy)
   * @returns {BlogIdea} New BlogIdea instance
   */
  clone() {
    const clonedData = { ...this.toDbFormat() };
    delete clonedData.id; // Remove ID for new instance
    clonedData.title = `${clonedData.title} (Copy)`;
    clonedData.status = "draft";

    return new BlogIdea(clonedData);
  }

  // Static methods for querying

  /**
   * Find blog idea by ID
   * @param {string} id - Blog idea ID
   * @returns {Promise<BlogIdea|null>} BlogIdea instance or null
   */
  static async findById(id) {
    try {
      const { data, error } = await supabaseService.query("blog_ideas", {
        filter: { id },
        limit: 1,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return new BlogIdea(data[0]);
    } catch (error) {
      console.error("Error finding blog idea by ID:", error);
      throw error;
    }
  }

  /**
   * Find all blog ideas for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<BlogIdea[]>} Array of BlogIdea instances
   */
  static async findByUserId(userId, options = {}) {
    try {
      const queryOptions = {
        filter: { user_id: userId },
        order: { column: "created_at", ascending: false },
        ...options,
      };

      const { data, error } = await supabaseService.query(
        "blog_ideas",
        queryOptions
      );
      if (error) throw error;

      return (data || []).map((item) => new BlogIdea(item));
    } catch (error) {
      console.error("Error finding blog ideas by user ID:", error);
      throw error;
    }
  }

  /**
   * Find blog ideas by status
   * @param {string} status - Status to filter by
   * @param {string} userId - User ID (optional)
   * @returns {Promise<BlogIdea[]>} Array of BlogIdea instances
   */
  static async findByStatus(status, userId = null) {
    try {
      const filter = { status };
      if (userId) filter.user_id = userId;

      const { data, error } = await supabaseService.query("blog_ideas", {
        filter,
        order: { column: "created_at", ascending: false },
      });

      if (error) throw error;

      return (data || []).map((item) => new BlogIdea(item));
    } catch (error) {
      console.error("Error finding blog ideas by status:", error);
      throw error;
    }
  }

  /**
   * Get ideas ready for generation
   * @param {string} userId - User ID
   * @returns {Promise<BlogIdea[]>} Array of ready BlogIdea instances
   */
  static async getReadyForGeneration(userId) {
    return await BlogIdea.findByStatus("ready", userId);
  }

  /**
   * Create a new blog idea with default values
   * @param {string} userId - User ID
   * @param {Object} data - Initial data
   * @returns {BlogIdea} New BlogIdea instance
   */
  static create(userId, data = {}) {
    return new BlogIdea({
      userId,
      ...data,
    });
  }
}

// Export both named and default exports to satisfy different import patterns
export { BlogIdea };
export default BlogIdea;
