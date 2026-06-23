/**
 * WordPress Integration Configuration
 * Handles WordPress API connections with proper security and fallbacks
 */

const WORDPRESS_CONFIG = {
  // Default connection settings
  defaultSettings: {
    timeout: 30000,
    retries: 3,
    apiVersion: "wp/v2",
  },

  // Supported authentication methods
  authMethods: {
    APPLICATION_PASSWORD: "application_password",
    OAUTH: "oauth",
    JWT: "jwt",
  },

  // Development mode fallbacks
  mockResponses: {
    sites: [
      {
        id: "dev-site-1",
        name: "Development Blog",
        url: "https://example.dev",
        status: "connected",
        authMethod: "application_password",
      },
    ],
    posts: [
      {
        id: 1,
        title: { rendered: "Sample WordPress Post" },
        content: {
          rendered: "<p>This is a sample post from development mode.</p>",
        },
        status: "draft",
        link: "https://example.dev/sample-post",
        date: new Date().toISOString(),
      },
    ],
    categories: [
      { id: 1, name: "Uncategorized", slug: "uncategorized" },
      { id: 2, name: "Blog", slug: "blog" },
      { id: 3, name: "Technology", slug: "technology" },
      { id: 4, name: "Business", slug: "business" },
    ],
    tags: [
      { id: 1, name: "AI", slug: "ai" },
      { id: 2, name: "Content", slug: "content" },
      { id: 3, name: "Automation", slug: "automation" },
    ],
  },
};

/**
 * Check if WordPress integration is properly configured
 * @returns {boolean} Configuration status
 */
export const isWordPressConfigured = () => {
  // In development mode, always return true with mock data
  if (import.meta.env.DEV) {
    console.log("🔧 WordPress running in development mode with mock data");
    return true;
  }

  // In production, check for actual configuration
  return !!(
    import.meta.env.VITE_WORDPRESS_API_URL &&
    import.meta.env.VITE_WORDPRESS_USERNAME &&
    import.meta.env.VITE_WORDPRESS_PASSWORD
  );
};

/**
 * Get WordPress configuration based on environment
 * @returns {Object} WordPress configuration
 */
export const getWordPressConfig = () => {
  if (!isWordPressConfigured() && !import.meta.env.DEV) {
    throw new Error(
      "WordPress not configured. Please check environment variables."
    );
  }

  return {
    apiUrl:
      import.meta.env.VITE_WORDPRESS_API_URL || "https://example.dev/wp-json",
    username: import.meta.env.VITE_WORDPRESS_USERNAME || "dev_user",
    password: import.meta.env.VITE_WORDPRESS_PASSWORD || "dev_password",
    ...WORDPRESS_CONFIG.defaultSettings,
    mockMode: import.meta.env.DEV,
    mockData: WORDPRESS_CONFIG.mockResponses,
  };
};

export default WORDPRESS_CONFIG;
