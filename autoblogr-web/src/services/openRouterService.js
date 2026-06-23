/**
 * OpenRouter Service
 *
 * Provides AI content generation capabilities using OpenRouter API.
 * Includes error handling, retry logic, and Hugging Face fallback.
 */

import OpenAI from "openai";
import {
  OPENROUTER_CONFIG,
  AVAILABLE_MODELS,
  MODEL_SELECTION,
  DEVELOPMENT_FALLBACKS,
  validateOpenRouterConfig,
} from "../config/openrouter.js";
import { huggingFaceService } from "./huggingFaceService.js";

class OpenRouterService {
  constructor() {
    this.client = null;
    this.config = validateOpenRouterConfig();
    this.initializeClient();
  }

  initializeClient() {
    if (this.config.isConfigured) {
      this.client = new OpenAI({
        apiKey: OPENROUTER_CONFIG.apiKey,
        baseURL: OPENROUTER_CONFIG.baseURL,
        defaultHeaders: OPENROUTER_CONFIG.headers,
        dangerouslyAllowBrowser: true, // Required for client-side usage
      });
    }
  }

  /**
   * Generate AI content using OpenRouter
   * @param {string} prompt - The prompt for content generation
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated content response
   */
  async generateContent(prompt, options = {}) {
    const {
      taskType = "blog-content-generation",
      model = null,
      maxTokens = 2000,
      temperature = 0.7,
      useCache = true,
    } = options;

    // Check cache first
    if (useCache) {
      const cached = this.getCachedResponse(prompt, taskType);
      if (cached) {
        console.log("🎯 Using cached AI response");
        return cached;
      }
    }

    // Use development fallback if not configured
    if (!this.config.isConfigured) {
      console.log("⚠️ OpenRouter not configured, using development fallback");
      return this.getDevelopmentFallback(taskType, prompt);
    }

    // Select appropriate model
    const selectedModel = model || this.selectModel(taskType);

    try {
      const response = await this.makeRequest(prompt, {
        model: selectedModel,
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
      console.error("❌ OpenRouter request failed:", error);

      // Try fallback model
      const fallbackModel = this.getFallbackModel(taskType, selectedModel);
      if (fallbackModel && fallbackModel !== selectedModel) {
        console.log(`🔄 Trying fallback model: ${fallbackModel}`);
        try {
          return await this.makeRequest(prompt, {
            model: fallbackModel,
            maxTokens,
            temperature,
            taskType,
          });
        } catch (fallbackError) {
          console.error("❌ Fallback model also failed:", fallbackError);
        }
      }

      // Try Hugging Face as external fallback
      console.log("🔄 Trying Hugging Face as external fallback");
      try {
        const hfResponse = await huggingFaceService.generateContent(prompt, {
          taskType,
          maxTokens,
          temperature,
          useCache: true,
        });

        // Mark as external fallback
        return {
          ...hfResponse,
          type: "external-fallback",
          originalProvider: "OpenRouter",
          fallbackProvider: "Hugging Face",
        };
      } catch (hfError) {
        console.error("❌ Hugging Face fallback also failed:", hfError);
      }

      // Final fallback to development mode
      console.log("🆘 All AI services failed, using development fallback");
      return this.getDevelopmentFallback(taskType, prompt);
    }
  }

  /**
   * Make actual API request to OpenRouter
   */
  async makeRequest(prompt, options) {
    const { model, maxTokens, temperature, taskType } = options;

    const messages = this.buildMessages(prompt, taskType);

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI model");
    }

    return this.parseResponse(content, taskType);
  }

  /**
   * Build appropriate message structure based on task type
   */
  buildMessages(prompt, taskType) {
    const systemPrompts = {
      "blog-idea-generation": `You are an expert content strategist helping generate engaging blog post ideas. 
        Provide creative, SEO-friendly, and audience-appropriate suggestions that would perform well on modern blogs.
        Focus on topics that are timely, valuable, and likely to engage readers.`,

      "blog-content-generation": `You are a professional blog writer creating high-quality, engaging content. 
        Write in a conversational yet authoritative tone. Include proper headings, structure the content well, 
        and make it SEO-friendly while remaining natural and valuable to readers.`,

      "content-optimization": `You are a content optimization expert. Help improve existing content for better 
        readability, engagement, and SEO performance while maintaining the original voice and intent.`,

      "seo-enhancement": `You are an SEO specialist helping optimize content for search engines. 
        Suggest improvements for keywords, meta descriptions, headings, and overall SEO performance.`,
    };

    return [
      {
        role: "system",
        content:
          systemPrompts[taskType] || systemPrompts["blog-content-generation"],
      },
      {
        role: "user",
        content: prompt,
      },
    ];
  }

  /**
   * Parse AI response based on task type
   */
  parseResponse(content, taskType) {
    try {
      // Try to parse as JSON first (for structured responses)
      const parsed = JSON.parse(content);
      return {
        content: parsed,
        type: "structured",
        taskType,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Handle as plain text
      return {
        content: this.processTextResponse(content, taskType),
        type: "text",
        taskType,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Process text response based on task type
   */
  processTextResponse(content, taskType) {
    switch (taskType) {
      case "blog-idea-generation":
        return this.extractBlogIdeas(content);
      case "blog-content-generation":
        return this.parseBlogContent(content);
      default:
        return { text: content };
    }
  }

  /**
   * Extract blog ideas from AI response
   */
  extractBlogIdeas(content) {
    const lines = content.split("\n").filter((line) => line.trim());
    const ideas = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^\d+\.\s*/, "")
        .replace(/^[-*]\s*/, "")
        .trim();
      if (cleaned && cleaned.length > 10) {
        ideas.push(cleaned);
      }
    }

    return { ideas: ideas.slice(0, 10) }; // Limit to 10 ideas
  }

  /**
   * Parse blog content into structured format
   */
  parseBlogContent(content) {
    const lines = content.split("\n");
    let title = "";
    let excerpt = "";

    // Extract title (first heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Generate excerpt from first paragraph
    const paragraphs = content
      .split("\n\n")
      .filter((p) => p.trim() && !p.startsWith("#") && p.length > 50);

    if (paragraphs.length > 0) {
      excerpt = paragraphs[0].trim().substring(0, 200) + "...";
    }

    return {
      title: title || "Generated Blog Post",
      content,
      excerpt: excerpt || "AI-generated blog post content.",
      wordCount: content.split(/\s+/).length,
    };
  }

  /**
   * Select appropriate model for task type
   */
  selectModel(taskType) {
    const selection =
      MODEL_SELECTION[taskType] || MODEL_SELECTION["blog-content-generation"];
    return selection.primary;
  }

  /**
   * Get fallback model for task type
   */
  getFallbackModel(taskType, currentModel) {
    const selection =
      MODEL_SELECTION[taskType] || MODEL_SELECTION["blog-content-generation"];

    if (currentModel === selection.primary) {
      return selection.fallback;
    } else if (currentModel === selection.fallback) {
      return selection.free;
    }

    return null;
  }

  /**
   * Development fallback responses
   */
  getDevelopmentFallback(taskType, prompt) {
    const fallbacks = DEVELOPMENT_FALLBACKS.mockResponses;

    return {
      content: fallbacks[taskType] || fallbacks["blog-content-generation"],
      type: "fallback",
      taskType,
      timestamp: new Date().toISOString(),
      note: "This is a development fallback response. Configure OpenRouter API key for actual AI generation.",
    };
  }

  /**
   * Simple in-memory cache for development
   */
  cacheResponse(prompt, taskType, response) {
    if (!this.cache) this.cache = new Map();
    const key = `${taskType}:${prompt.substring(0, 100)}`;
    this.cache.set(key, {
      ...response,
      cachedAt: Date.now(),
    });

    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  getCachedResponse(prompt, taskType) {
    if (!this.cache) return null;

    const key = `${taskType}:${prompt.substring(0, 100)}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.cachedAt < 300000) {
      // 5 minutes
      return cached;
    }

    return null;
  }

  /**
   * Get service status and configuration
   */
  getStatus() {
    return {
      configured: this.config.isConfigured,
      baseURL: this.config.baseURL,
      defaultModel: this.config.defaultModel,
      availableModels: Object.keys(AVAILABLE_MODELS),
      developmentMode: DEVELOPMENT_FALLBACKS.enabled,
    };
  }

  /**
   * Test the service with a simple request
   */
  async testConnection() {
    try {
      const response = await this.generateContent(
        "Generate a simple test response to verify the AI service is working.",
        {
          taskType: "content-optimization",
          maxTokens: 100,
          useCache: false,
        }
      );

      return {
        success: true,
        configured: this.config.isConfigured,
        response: response.content,
        type: response.type,
      };
    } catch (error) {
      return {
        success: false,
        configured: this.config.isConfigured,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();

// Export class for testing
export default OpenRouterService;
