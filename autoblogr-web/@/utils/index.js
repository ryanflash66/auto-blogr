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

export default createPageUrl;
