/**
 * Core AI Integration Module
 *
 * Provides simplified interface for AI operations across the application.
 * This is the main integration point mentioned in the project structure.
 */

import { openRouterService } from "../services/openRouterService.js";
import { huggingFaceService } from "../services/huggingFaceService.js";

/**
 * Main function for invoking Language Learning Models
 * This is the primary interface used throughout the application
 *
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Generated content
 */
export async function InvokeLLM(prompt, options = {}) {
  const {
    model = null,
    maxTokens = 2000,
    temperature = 0.7,
    taskType = "blog-content-generation",
  } = options;

  try {
    const response = await openRouterService.generateContent(prompt, {
      model,
      maxTokens,
      temperature,
      taskType,
      useCache: true,
    });

    // Return the content in the expected format
    if (
      response.type === "structured" &&
      typeof response.content === "object"
    ) {
      return JSON.stringify(response.content, null, 2);
    } else if (response.content?.text) {
      return response.content.text;
    } else if (response.content?.content) {
      return response.content.content;
    } else if (typeof response.content === "string") {
      return response.content;
    } else {
      return JSON.stringify(response.content, null, 2);
    }
  } catch (error) {
    console.error("❌ InvokeLLM failed:", error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Generate blog ideas using AI
 *
 * @param {string} topic - The topic or niche for blog ideas
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Array of blog idea strings
 */
export async function generateBlogIdeas(topic, options = {}) {
  const {
    count = 5,
    audience = "general",
    difficulty = "intermediate",
  } = options;

  const prompt = `Generate ${count} engaging blog post ideas about "${topic}" for a ${audience} audience at ${difficulty} level. 

Requirements:
- Make them specific and actionable
- Include trending angles when relevant
- Consider SEO potential
- Vary the content types (how-to, lists, case studies, etc.)

Return just the blog post titles, one per line, without numbering.`;

  try {
    const response = await openRouterService.generateContent(prompt, {
      taskType: "blog-idea-generation",
      maxTokens: 800,
      temperature: 0.8,
    });

    if (response.content?.ideas) {
      return response.content.ideas;
    } else {
      // Parse from text response
      const content = response.content?.text || response.content || "";
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && line.length > 10)
        .slice(0, count);
    }
  } catch (error) {
    console.error("❌ Blog idea generation failed:", error);
    // Return fallback ideas
    return [
      `How to Master ${topic}: A Beginner's Guide`,
      `The Ultimate ${topic} Strategy for 2024`,
      `5 Common ${topic} Mistakes (And How to Avoid Them)`,
      `${topic} Case Study: Real Results and Lessons Learned`,
      `The Future of ${topic}: Trends and Predictions`,
    ].slice(0, count);
  }
}

/**
 * Generate blog post content from an idea
 *
 * @param {Object} idea - Blog idea object with title, description, etc.
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated blog post content
 */
export async function generateBlogContent(idea, options = {}) {
  const {
    wordCount = 1000,
    tone = "professional",
    includeIntro = true,
    includeConclusion = true,
    seoFocused = true,
  } = options;

  const prompt = `Write a comprehensive blog post based on this idea:

Title: ${idea.title}
Description: ${idea.description || "No description provided"}
Target Keywords: ${idea.keywords?.join(", ") || "Not specified"}

Requirements:
- Approximately ${wordCount} words
- ${tone} tone
- ${
    includeIntro
      ? "Include engaging introduction"
      : "Start directly with main content"
  }
- ${
    includeConclusion
      ? "Include strong conclusion with call-to-action"
      : "End with main content"
  }
- ${
    seoFocused
      ? "SEO-optimized with natural keyword usage"
      : "Focus on readability over SEO"
  }
- Use markdown formatting (headers, lists, emphasis)
- Make it engaging and valuable for readers

Structure the content with:
- Compelling introduction that hooks the reader
- Clear section headers (##)
- Actionable insights and examples
- Bullet points or numbered lists where appropriate
- Strong conclusion that provides value

Write the complete blog post now:`;

  try {
    const response = await openRouterService.generateContent(prompt, {
      taskType: "blog-content-generation",
      maxTokens: Math.min(4000, wordCount * 2), // Rough token estimation
      temperature: 0.7,
    });

    if (response.content?.title) {
      return response.content;
    } else {
      // Parse from text response
      const content = response.content?.text || response.content || "";
      return parseBlogContentResponse(content);
    }
  } catch (error) {
    console.error("❌ Blog content generation failed:", error);
    // Return fallback content
    return {
      title: idea.title,
      content: generateFallbackContent(idea),
      excerpt: `Learn about ${idea.title} in this comprehensive guide.`,
      wordCount: 500,
    };
  }
}

/**
 * Optimize existing content for SEO and readability
 *
 * @param {string} content - Original content to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} Optimized content with suggestions
 */
export async function optimizeContent(content, options = {}) {
  const {
    targetKeywords = [],
    optimizeFor = "seo", // 'seo', 'readability', 'engagement'
  } = options;

  const prompt = `Optimize this content for ${optimizeFor}:

Original Content:
${content}

${
  targetKeywords.length > 0
    ? `Target Keywords: ${targetKeywords.join(", ")}`
    : ""
}

Please provide:
1. Optimized version of the content
2. Key improvements made
3. SEO score (1-10)
4. Readability suggestions

Return the response in JSON format with fields: optimizedContent, improvements, seoScore, suggestions`;

  try {
    const response = await openRouterService.generateContent(prompt, {
      taskType: "content-optimization",
      maxTokens: 3000,
      temperature: 0.3,
    });

    return response.content;
  } catch (error) {
    console.error("❌ Content optimization failed:", error);
    return {
      optimizedContent: content,
      improvements: ["AI optimization temporarily unavailable"],
      seoScore: 7,
      suggestions: [
        "Consider manual review of content structure and keyword usage",
      ],
    };
  }
}

/**
 * Generate SEO metadata for content
 *
 * @param {string} title - Blog post title
 * @param {string} content - Blog post content
 * @returns {Promise<Object>} SEO metadata
 */
export async function generateSEOMetadata(title, content) {
  const prompt = `Generate SEO metadata for this blog post:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Provide:
1. SEO-optimized title (under 60 characters)
2. Meta description (150-160 characters)
3. 5-8 relevant keywords
4. URL slug
5. Focus keyword

Return as JSON with fields: seoTitle, metaDescription, keywords, slug, focusKeyword`;

  try {
    const response = await openRouterService.generateContent(prompt, {
      taskType: "seo-enhancement",
      maxTokens: 500,
      temperature: 0.3,
    });

    return response.content;
  } catch (error) {
    console.error("❌ SEO metadata generation failed:", error);
    return {
      seoTitle: title.substring(0, 60),
      metaDescription: `Learn about ${title}. Comprehensive guide with practical insights and actionable tips.`,
      keywords: extractKeywordsFromText(title + " " + content),
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      focusKeyword: title.split(" ")[0].toLowerCase(),
    };
  }
}

/**
 * Test AI service connectivity
 *
 * @returns {Promise<Object>} Service status
 */
export async function testAIService() {
  try {
    return await openRouterService.testConnection();
  } catch (error) {
    return {
      success: false,
      configured: false,
      error: error.message,
    };
  }
}

// Helper functions

function parseBlogContentResponse(content) {
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

function generateFallbackContent(idea) {
  return `# ${idea.title}

## Introduction

This is a comprehensive guide about ${
    idea.title
  }. In this post, we'll explore the key concepts, strategies, and practical applications that will help you understand and implement effective solutions.

## Key Points

- Understanding the fundamentals
- Practical implementation strategies
- Common challenges and solutions
- Best practices and recommendations

## Main Content

${
  idea.description ||
  "This topic covers essential information that will be valuable for readers interested in this subject matter."
}

## Conclusion

In summary, ${
    idea.title
  } is an important topic that requires careful consideration and proper implementation. By following the guidelines and strategies outlined in this post, you'll be well-equipped to achieve your goals.

---

*This content was generated for development purposes. In production, this would be replaced with AI-generated content.*`;
}

function extractKeywordsFromText(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          "this",
          "that",
          "with",
          "from",
          "they",
          "were",
          "have",
          "been",
        ].includes(word)
    );

  const frequency = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
}

/**
 * Test Hugging Face service directly
 * Useful for testing fallback functionality
 */
export async function testHuggingFace(prompt = "Hello world", options = {}) {
  const {
    maxTokens = 100,
    temperature = 0.7,
    taskType = "text-generation",
  } = options;

  try {
    const response = await huggingFaceService.generateContent(prompt, {
      maxTokens,
      temperature,
      taskType,
      useCache: false, // Always get fresh response for testing
    });

    return {
      success: true,
      provider: "Hugging Face",
      response: response.content,
      type: response.type,
      model: response.model,
      timestamp: response.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      provider: "Hugging Face",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get AI service status for both OpenRouter and Hugging Face
 */
export async function getAIServiceStatus() {
  const status = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Test OpenRouter
  try {
    const orStatus = await openRouterService.config;
    status.services.openRouter = {
      configured: orStatus.isConfigured,
      available: orStatus.hasApiKey,
      provider: "OpenRouter",
      status: orStatus.isConfigured ? "ready" : "fallback-mode",
    };
  } catch (error) {
    status.services.openRouter = {
      configured: false,
      available: false,
      provider: "OpenRouter",
      status: "error",
      error: error.message,
    };
  }

  // Test Hugging Face
  try {
    const hfTest = await huggingFaceService.testConnection();
    status.services.huggingFace = {
      configured: hfTest.configured,
      available: hfTest.success,
      provider: "Hugging Face",
      status: hfTest.configured ? "ready" : "fallback-mode",
      message: hfTest.message,
    };
  } catch (error) {
    status.services.huggingFace = {
      configured: false,
      available: false,
      provider: "Hugging Face",
      status: "error",
      error: error.message,
    };
  }

  return status;
}

/**
 * Placeholder for image generation functionality
 * TODO: Implement when image generation is added
 */
export async function GenerateImage(prompt, options = {}) {
  throw new Error("Image generation not yet implemented");
}

// Export all functions for use throughout the application
export { openRouterService, huggingFaceService };
