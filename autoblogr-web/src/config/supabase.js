// Supabase configuration for AutoBlogr
import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_url_here" &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "x-my-custom-header": "autoblogr-web",
        },
      },
    })
  : null;

// Export configuration status
export { isSupabaseConfigured };

// Development mode helpers
export const getSupabaseStatus = () => ({
  configured: isSupabaseConfigured,
  url: isSupabaseConfigured ? supabaseUrl : "Not configured",
  hasAnonKey: !!supabaseAnonKey,
  client: !!supabase,
});

// Mock data for development mode
export const mockData = {
  user: {
    id: "dev-user-123",
    email: "dev@autoblogr.com",
    name: "Development User",
    created_at: new Date().toISOString(),
  },
  blogIdeas: [
    {
      id: "idea-1",
      title: "Getting Started with AI Blog Writing",
      description: "A comprehensive guide to using AI for content creation",
      status: "draft",
      created_at: new Date().toISOString(),
    },
    {
      id: "idea-2",
      title: "WordPress Integration Best Practices",
      description: "How to seamlessly publish content to WordPress",
      status: "ready",
      created_at: new Date().toISOString(),
    },
  ],
};
