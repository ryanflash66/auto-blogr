// Navigation helper utility
export const createPageUrl = (pageName) => {
  // Convert page name to URL path
  const pageMap = {
    Dashboard: "/dashboard",
    Ideas: "/ideas",
    Posts: "/posts",
    WordPress: "/wordpress",
    Profile: "/profile",
    LLMTest: "/llm-test",
  };

  return pageMap[pageName] || `/${pageName.toLowerCase()}`;
};

// Utility function for merging classNames - used by UI components
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// ID generation helper
export function createId() {
  return Math.random().toString(36).substr(2, 9);
}

export default createPageUrl;
