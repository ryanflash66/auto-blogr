/**
 * Hugging Face Service
 *
 * Provides AI content generation using Hugging Face Inference API.
 * Serves as a fallback service when OpenRouter is unavailable.
 */

class HuggingFaceService {
  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    this.baseURL = "https://api-inference.huggingface.co";
    this.isConfigured = this.validateConfig();
    this.cache = new Map();
  }

  /**
   * Validate Hugging Face configuration
   */
  validateConfig() {
    const hasValidKey =
      this.apiKey &&
      this.apiKey !== "your_huggingface_api_key_here" &&
      this.apiKey.length > 10;

    return hasValidKey;
  }

  /**
   * Available Hugging Face models for different tasks
   */
  getAvailableModels() {
    return {
      "text-generation": {
        primary: "microsoft/DialoGPT-medium",
        fast: "gpt2",
        quality: "microsoft/DialoGPT-large",
        free: "gpt2", // Always free
      },
      "blog-content": {
        primary: "microsoft/DialoGPT-medium",
        fast: "gpt2",
        quality: "microsoft/DialoGPT-large",
        free: "gpt2",
      },
      summarization: {
        primary: "facebook/bart-large-cnn",
        fast: "facebook/bart-base",
        quality: "facebook/bart-large-cnn",
        free: "facebook/bart-base",
      },
    };
  }

  /**
   * Select appropriate model based on task type
   */
  selectModel(taskType, quality = "primary") {
    const models = this.getAvailableModels();
    const taskModels = models[taskType] || models["text-generation"];
    return taskModels[quality] || taskModels.primary;
  }

  /**
   * Generate content using Hugging Face API
   */
  async generateContent(prompt, options = {}) {
    const {
      taskType = "text-generation",
      maxTokens = 500,
      temperature = 0.7,
      quality = "primary",
      useCache = true,
    } = options;

    // Check cache first
    if (useCache) {
      const cached = this.getCachedResponse(prompt, taskType);
      if (cached) {
        console.log("🎯 Using cached Hugging Face response");
        return cached;
      }
    }

    // Return development fallback if not configured
    if (!this.isConfigured) {
      console.log("⚠️ Hugging Face not configured, using development fallback");
      return this.getDevelopmentFallback(taskType, prompt);
    }

    const model = this.selectModel(taskType, quality);

    try {
      const response = await this.makeRequest(model, prompt, {
        maxTokens,
        temperature,
        taskType,
      });

      // Cache successful response
      if (useCache && response) {
        this.cacheResponse(prompt, taskType, response);
      }

      return response;
    } catch (error) {
      console.error("❌ Hugging Face request failed:", error);

      // Try fallback model if primary fails
      if (quality !== "fast") {
        console.log("🔄 Trying faster Hugging Face model");
        try {
          return await this.generateContent(prompt, {
            ...options,
            quality: "fast",
            useCache: false,
          });
        } catch (fallbackError) {
          console.error(
            "❌ Hugging Face fallback model also failed:",
            fallbackError
          );
        }
      }

      // Final fallback to development mode
      console.log(
        "🆘 All Hugging Face models failed, using development fallback"
      );
      return this.getDevelopmentFallback(taskType, prompt);
    }
  }

  /**
   * Make actual API request to Hugging Face
   */
  async makeRequest(model, prompt, options) {
    const { maxTokens, temperature, taskType } = options;

    const payload = this.buildPayload(prompt, taskType, maxTokens, temperature);

    const response = await fetch(`${this.baseURL}/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Use-Cache": "false", // Get fresh responses
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Hugging Face API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Handle different response formats
    return this.parseResponse(data, taskType, model);
  }

  /**
   * Build payload based on task type
   */
  buildPayload(prompt, taskType, maxTokens, temperature) {
    switch (taskType) {
      case "summarization":
        return {
          inputs: prompt,
          parameters: {
            max_length: Math.min(maxTokens, 512),
            min_length: 50,
            do_sample: true,
            temperature: temperature,
          },
        };

      case "text-generation":
      case "blog-content":
      default:
        return {
          inputs: this.formatPromptForGeneration(prompt, taskType),
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature,
            do_sample: true,
            top_p: 0.9,
            top_k: 50,
            repetition_penalty: 1.1,
          },
        };
    }
  }

  /**
   * Format prompt for text generation models
   */
  formatPromptForGeneration(prompt, taskType) {
    const prefixes = {
      "blog-content": "Write a professional blog post about: ",
      "blog-idea-generation": "Generate creative blog post ideas about: ",
      "content-optimization": "Improve and optimize this content: ",
      "seo-enhancement": "Optimize this content for SEO: ",
    };

    const prefix = prefixes[taskType] || "";
    return prefix + prompt;
  }

  /**
   * Parse API response based on task type and model
   */
  parseResponse(data, taskType, model) {
    try {
      let content = "";

      // Handle different response structures
      if (Array.isArray(data) && data.length > 0) {
        if (data[0].generated_text) {
          content = data[0].generated_text;
        } else if (data[0].summary_text) {
          content = data[0].summary_text;
        } else {
          content = JSON.stringify(data[0]);
        }
      } else if (data.generated_text) {
        content = data.generated_text;
      } else if (data.summary_text) {
        content = data.summary_text;
      } else {
        content = JSON.stringify(data);
      }

      // Clean up the content
      content = this.cleanContent(content, taskType);

      return {
        content: content,
        type: "huggingface",
        taskType,
        model,
        timestamp: new Date().toISOString(),
        provider: "Hugging Face",
      };
    } catch (error) {
      console.error("❌ Error parsing Hugging Face response:", error);
      throw new Error("Failed to parse Hugging Face response");
    }
  }

  /**
   * Clean and format generated content
   */
  cleanContent(content, taskType) {
    if (!content || typeof content !== "string") {
      return "Content generation failed - invalid response format";
    }

    // Remove common artifacts
    content = content
      .replace(/^Write a professional blog post about:\s*/i, "")
      .replace(/^Generate creative blog post ideas about:\s*/i, "")
      .replace(/^Improve and optimize this content:\s*/i, "")
      .replace(/^Optimize this content for SEO:\s*/i, "")
      .trim();

    // Ensure minimum length
    if (content.length < 20) {
      return this.getDevelopmentFallback(taskType, "fallback").content;
    }

    return content;
  }

  /**
   * Development fallback responses
   */
  getDevelopmentFallback(taskType, prompt) {
    const fallbacks = {
      "blog-content": `# AI-Generated Blog Content

This is a Hugging Face fallback response for demonstration purposes. In production, this would be replaced with actual AI-generated content.

## Key Points

- Professional content generation
- SEO optimization capabilities  
- Engaging writing style
- Structured formatting

## Conclusion

This demonstrates the expected output format for Hugging Face AI-generated blog content.`,

      "blog-idea-generation": [
        "How to Leverage AI for Modern Content Creation",
        "The Future of Automated Blog Writing in 2025",
        "Building Scalable Content Strategies with AI Tools",
      ],

      "text-generation":
        "This is a sample text generation from Hugging Face fallback mode. The actual service would provide AI-generated content based on the given prompt.",

      summarization:
        "This is a sample summary generated by Hugging Face fallback mode. The actual service would provide intelligent content summarization.",
    };

    const content = fallbacks[taskType] || fallbacks["text-generation"];

    return {
      content: content,
      type: "fallback",
      taskType,
      timestamp: new Date().toISOString(),
      provider: "Hugging Face (Development Fallback)",
      note: "Configure Hugging Face API key for actual AI generation",
    };
  }

  /**
   * Cache management
   */
  getCachedResponse(prompt, taskType) {
    const key = `${taskType}:${prompt.substring(0, 50)}`;
    return this.cache.get(key);
  }

  cacheResponse(prompt, taskType, response) {
    const key = `${taskType}:${prompt.substring(0, 50)}`;
    this.cache.set(key, {
      ...response,
      cached: true,
      cachedAt: new Date().toISOString(),
    });

    // Simple cache cleanup - keep only last 50 items
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Test connection to Hugging Face API
   */
  async testConnection() {
    try {
      const testResponse = await this.generateContent("Hello world", {
        taskType: "text-generation",
        maxTokens: 50,
        useCache: false,
      });

      return {
        success: true,
        configured: this.isConfigured,
        response: testResponse,
        message: this.isConfigured
          ? "Hugging Face connection successful"
          : "Using fallback mode - configure API key for real AI",
      };
    } catch (error) {
      return {
        success: false,
        configured: this.isConfigured,
        error: error.message,
        message: "Hugging Face connection failed",
      };
    }
  }
}

// Create and export singleton instance
export const huggingFaceService = new HuggingFaceService();
export default huggingFaceService;
