// UserProfile Entity for AutoBlogr
import { supabaseService } from "../services/supabaseService.js";

/**
 * UserProfile Entity - Represents a user profile in the AutoBlogr system
 * Extends Supabase auth.users with additional application-specific data
 */
export default class UserProfile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || "";
    this.fullName = data.full_name || data.fullName || "";
    this.avatarUrl = data.avatar_url || data.avatarUrl || "";
    this.subscriptionTier =
      data.subscription_tier || data.subscriptionTier || "free";
    this.wordpressSites = data.wordpress_sites || data.wordpressSites || [];
    this.aiUsageCount = data.ai_usage_count || data.aiUsageCount || 0;
    this.aiUsageLimit =
      data.ai_usage_limit || data.aiUsageLimit || this.getDefaultUsageLimit();
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;

    // Validation errors
    this.errors = {};
  }

  /**
   * Get default AI usage limit based on subscription tier
   * @returns {number} Usage limit
   */
  getDefaultUsageLimit() {
    const limits = {
      free: 10,
      pro: 100,
      enterprise: 1000,
    };
    return limits[this.subscriptionTier] || limits.free;
  }

  /**
   * Validate the user profile data
   * @returns {boolean} True if valid, false otherwise
   */
  validate() {
    this.errors = {};

    if (!this.email || this.email.trim().length === 0) {
      this.errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errors.email = "Email must be a valid email address";
    }

    if (this.fullName && this.fullName.length > 100) {
      this.errors.fullName = "Full name must be under 100 characters";
    }

    const validTiers = ["free", "pro", "enterprise"];
    if (!validTiers.includes(this.subscriptionTier)) {
      this.errors.subscriptionTier = `Subscription tier must be one of: ${validTiers.join(
        ", "
      )}`;
    }

    if (this.aiUsageLimit < 0) {
      this.errors.aiUsageLimit = "AI usage limit cannot be negative";
    }

    if (this.aiUsageCount < 0) {
      this.errors.aiUsageCount = "AI usage count cannot be negative";
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Check if user has AI usage remaining
   * @returns {boolean} True if usage available
   */
  hasAiUsageRemaining() {
    return this.aiUsageCount < this.aiUsageLimit;
  }

  /**
   * Get remaining AI usage count
   * @returns {number} Remaining usage count
   */
  getRemainingAiUsage() {
    return Math.max(0, this.aiUsageLimit - this.aiUsageCount);
  }

  /**
   * Get AI usage percentage
   * @returns {number} Usage percentage (0-100)
   */
  getAiUsagePercentage() {
    if (this.aiUsageLimit === 0) return 100;
    return Math.min(100, (this.aiUsageCount / this.aiUsageLimit) * 100);
  }

  /**
   * Check if user is on a paid plan
   * @returns {boolean} True if on paid plan
   */
  isPaidUser() {
    return this.subscriptionTier !== "free";
  }

  /**
   * Add a WordPress site to the user's profile
   * @param {Object} siteData - WordPress site data
   * @returns {boolean} True if added successfully
   */
  addWordPressSite(siteData) {
    const site = {
      id: siteData.id || Math.random().toString(36),
      name: siteData.name,
      url: siteData.url,
      authType: siteData.authType || "basic",
      addedAt: new Date().toISOString(),
      ...siteData,
    };

    // Check if site already exists
    const existingIndex = this.wordpressSites.findIndex(
      (s) => s.url === site.url
    );
    if (existingIndex >= 0) {
      this.wordpressSites[existingIndex] = site;
    } else {
      this.wordpressSites.push(site);
    }

    return true;
  }

  /**
   * Remove a WordPress site from the user's profile
   * @param {string} siteId - Site ID to remove
   * @returns {boolean} True if removed successfully
   */
  removeWordPressSite(siteId) {
    const initialLength = this.wordpressSites.length;
    this.wordpressSites = this.wordpressSites.filter(
      (site) => site.id !== siteId
    );
    return this.wordpressSites.length < initialLength;
  }

  /**
   * Get WordPress site by ID
   * @param {string} siteId - Site ID
   * @returns {Object|null} WordPress site data or null
   */
  getWordPressSite(siteId) {
    return this.wordpressSites.find((site) => site.id === siteId) || null;
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDbFormat() {
    return {
      id: this.id,
      email: this.email,
      full_name: this.fullName,
      avatar_url: this.avatarUrl,
      subscription_tier: this.subscriptionTier,
      wordpress_sites: this.wordpressSites,
      ai_usage_count: this.aiUsageCount,
      ai_usage_limit: this.aiUsageLimit,
    };
  }

  /**
   * Save the user profile to database
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
        // Update existing profile
        const { data, error } = await supabaseService.update(
          "user_profiles",
          dbData,
          { id: this.id }
        );
        if (error) throw error;

        if (data && data.length > 0) {
          this.updatedAt = data[0].updated_at;
        }
      } else {
        // Create new profile
        const { data, error } = await supabaseService.insert(
          "user_profiles",
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
      console.error("Error saving user profile:", error);
      throw error;
    }
  }

  /**
   * Increment AI usage count
   * @param {number} count - Usage count to add (default: 1)
   * @returns {Promise<boolean>} True if successful
   */
  async incrementAiUsage(count = 1) {
    this.aiUsageCount += count;
    return await this.save();
  }

  /**
   * Reset AI usage count (for new billing period)
   * @returns {Promise<boolean>} True if successful
   */
  async resetAiUsage() {
    this.aiUsageCount = 0;
    return await this.save();
  }

  /**
   * Update subscription tier
   * @param {string} newTier - New subscription tier
   * @returns {Promise<boolean>} True if successful
   */
  async updateSubscriptionTier(newTier) {
    const validTiers = ["free", "pro", "enterprise"];
    if (!validTiers.includes(newTier)) {
      throw new Error(`Invalid subscription tier: ${newTier}`);
    }

    this.subscriptionTier = newTier;
    this.aiUsageLimit = this.getDefaultUsageLimit();
    return await this.save();
  }

  /**
   * Update profile information
   * @param {Object} updates - Profile updates
   * @returns {Promise<boolean>} True if successful
   */
  async updateProfile(updates) {
    Object.keys(updates).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = updates[key];
      }
    });

    return await this.save();
  }

  // Static methods for querying

  /**
   * Find user profile by ID
   * @param {string} id - User ID
   * @returns {Promise<UserProfile|null>} UserProfile instance or null
   */
  static async findById(id) {
    try {
      const { data, error } = await supabaseService.query("user_profiles", {
        filter: { id },
        limit: 1,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return new UserProfile(data[0]);
    } catch (error) {
      console.error("Error finding user profile by ID:", error);
      throw error;
    }
  }

  /**
   * Find user profile by email
   * @param {string} email - User email
   * @returns {Promise<UserProfile|null>} UserProfile instance or null
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabaseService.query("user_profiles", {
        filter: { email },
        limit: 1,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return new UserProfile(data[0]);
    } catch (error) {
      console.error("Error finding user profile by email:", error);
      throw error;
    }
  }

  /**
   * Find users by subscription tier
   * @param {string} tier - Subscription tier
   * @returns {Promise<UserProfile[]>} Array of UserProfile instances
   */
  static async findBySubscriptionTier(tier) {
    try {
      const { data, error } = await supabaseService.query("user_profiles", {
        filter: { subscription_tier: tier },
        order: { column: "created_at", ascending: false },
      });

      if (error) throw error;

      return (data || []).map((item) => new UserProfile(item));
    } catch (error) {
      console.error("Error finding user profiles by subscription tier:", error);
      throw error;
    }
  }

  /**
   * Create a new user profile
   * @param {Object} userData - User data from authentication
   * @returns {UserProfile} New UserProfile instance
   */
  static create(userData) {
    return new UserProfile({
      id: userData.id,
      email: userData.email,
      fullName: userData.user_metadata?.full_name || userData.full_name || "",
      avatarUrl:
        userData.user_metadata?.avatar_url || userData.avatar_url || "",
      ...userData,
    });
  }

  /**
   * Create or update user profile from auth user
   * @param {Object} authUser - Supabase auth user object
   * @returns {Promise<UserProfile>} UserProfile instance
   */
  static async createOrUpdate(authUser) {
    try {
      // Check if profile exists
      let profile = await UserProfile.findById(authUser.id);

      if (profile) {
        // Update existing profile
        await profile.updateProfile({
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || profile.fullName,
          avatarUrl: authUser.user_metadata?.avatar_url || profile.avatarUrl,
        });
      } else {
        // Create new profile
        profile = UserProfile.create(authUser);
        await profile.save();
      }

      return profile;
    } catch (error) {
      console.error("Error creating or updating user profile:", error);
      throw error;
    }
  }
}
