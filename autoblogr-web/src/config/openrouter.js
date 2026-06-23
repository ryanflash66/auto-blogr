/**
 * OpenRouter Configuration
 *
 * Handles OpenRouter API configuration for AI model integration.
 * Supports multiple models with fallback strategies.
 */

// OpenRouter API Configuration
export const OPENROUTER_CONFIG = {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini", // Cost-effective default model
  headers: {
    "HTTP-Referer": "https://autoblogr.app",
    "X-Title": "AutoBlogr - AI Blog Content Generator",
  },
};

// Available models with pricing and capabilities
export const AVAILABLE_MODELS = {
  // Free/Low-cost models for development
  "openai/gpt-4o-mini": {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    costPer1kTokens: 0.00015, // $0.15 per 1M tokens
    maxTokens: 128000,
    capabilities: ["text-generation", "conversation", "content-creation"],
    description: "Fast, cost-effective model for most content generation tasks",
  },
  "anthropic/claude-3-haiku": {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    costPer1kTokens: 0.00025,
    maxTokens: 200000,
    capabilities: ["text-generation", "analysis", "creative-writing"],
    description: "Fast, intelligent model for content creation and analysis",
  },
  // Premium models for high-quality content
  "openai/gpt-4o": {
    name: "GPT-4o",
    provider: "OpenAI",
    costPer1kTokens: 0.005,
    maxTokens: 128000,
    capabilities: ["text-generation", "conversation", "complex-reasoning"],
    description: "High-quality model for premium content generation",
  },
  "anthropic/claude-3-sonnet": {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    costPer1kTokens: 0.003,
    maxTokens: 200000,
    capabilities: [
      "text-generation",
      "analysis",
      "creative-writing",
      "research",
    ],
    description: "Balanced model for high-quality content and analysis",
  },
  // Free models for testing
  "google/gemini-flash-1.5": {
    name: "Gemini Flash 1.5",
    provider: "Google",
    costPer1kTokens: 0.00007,
    maxTokens: 1000000,
    capabilities: ["text-generation", "conversation"],
    description: "Free model for testing and development",
  },
};

// Model selection strategy based on task type
export const MODEL_SELECTION = {
  "blog-idea-generation": {
    primary: "openai/gpt-4o-mini",
    fallback: "anthropic/claude-3-haiku",
    free: "google/gemini-flash-1.5",
  },
  "blog-content-generation": {
    primary: "anthropic/claude-3-sonnet",
    fallback: "openai/gpt-4o",
    free: "openai/gpt-4o-mini",
  },
  "content-optimization": {
    primary: "openai/gpt-4o-mini",
    fallback: "anthropic/claude-3-haiku",
    free: "google/gemini-flash-1.5",
  },
  "seo-enhancement": {
    primary: "openai/gpt-4o-mini",
    fallback: "anthropic/claude-3-haiku",
    free: "google/gemini-flash-1.5",
  },
};

// Configuration validation
export const validateOpenRouterConfig = () => {
  const config = {
    hasApiKey:
      !!OPENROUTER_CONFIG.apiKey &&
      OPENROUTER_CONFIG.apiKey !== "your_openrouter_api_key_here",
    baseURL: OPENROUTER_CONFIG.baseURL,
    defaultModel: OPENROUTER_CONFIG.defaultModel,
    isConfigured: false,
  };

  config.isConfigured = config.hasApiKey;

  return config;
};

// Development mode fallbacks
export const DEVELOPMENT_FALLBACKS = {
  enabled: !import.meta.env.PROD || !OPENROUTER_CONFIG.apiKey,
  mockResponses: {
    "blog-idea-generation": {
      ideas: [
        "How to Build a Successful SaaS Product in 2024",
        "The Future of Remote Work: Trends and Predictions",
        "10 Essential Marketing Strategies for Small Businesses",
      ],
    },
    "blog-content-generation": {
      title: "Sample Generated Blog Post",
      content: `# Sample Generated Content

This is a sample blog post generated for development purposes. In production, this would be replaced with actual AI-generated content from OpenRouter.

## Key Features

- Professional content generation
- SEO optimization
- Engaging writing style
- Structured formatting

## Conclusion

This sample demonstrates the expected output format for AI-generated blog content.`,
      excerpt:
        "This is a sample blog post excerpt for development and testing purposes.",
      keywords: ["sample", "development", "testing", "blog", "content"],
    },
  },
};

export default OPENROUTER_CONFIG;
