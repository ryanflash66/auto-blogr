-- AutoBlogr Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  business_name TEXT,
  business_description TEXT,
  industry TEXT,
  target_audience TEXT,
  brand_voice TEXT DEFAULT 'professional',
  content_preferences JSONB DEFAULT '{"preferred_length": "medium", "include_images": true, "seo_focused": true}'::jsonb,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Ideas table
CREATE TABLE IF NOT EXISTS blog_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  tone TEXT DEFAULT 'professional',
  keywords TEXT[] DEFAULT '{}',
  variations_requested INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blog_idea_id UUID REFERENCES blog_ideas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  hero_image_url TEXT,
  hero_image_alt TEXT,
  variation_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published')),
  seo_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  wordpress_site_id UUID,
  wordpress_post_id TEXT,
  scheduled_publish_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Post Versions table (for version history)
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  version_number INTEGER NOT NULL,
  change_type TEXT DEFAULT 'manual_save',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WordPress Sites table
CREATE TABLE IF NOT EXISTS wordpress_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT NOT NULL,
  api_key TEXT NOT NULL,
  default_category TEXT,
  default_author TEXT,
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_ideas_user_id ON blog_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_ideas_status ON blog_ideas(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_blog_idea_id ON blog_posts(blog_idea_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_blog_post_id ON blog_post_versions(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id ON wordpress_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user's ID from the JWT
CREATE OR REPLACE FUNCTION auth.clerk_user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )
$$ LANGUAGE SQL STABLE;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (clerk_id = auth.clerk_user_id());

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (clerk_id = auth.clerk_user_id());

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (clerk_id = auth.clerk_user_id());

-- Blog Ideas policies
CREATE POLICY "Users can view their own ideas" ON blog_ideas
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can create their own ideas" ON blog_ideas
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can update their own ideas" ON blog_ideas
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can delete their own ideas" ON blog_ideas
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

-- Blog Posts policies
CREATE POLICY "Users can view their own posts" ON blog_posts
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can create their own posts" ON blog_posts
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can update their own posts" ON blog_posts
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can delete their own posts" ON blog_posts
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

-- Blog Post Versions policies
CREATE POLICY "Users can view their own post versions" ON blog_post_versions
  FOR SELECT USING (blog_post_id IN (
    SELECT id FROM blog_posts WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()
    )
  ));

CREATE POLICY "Users can create their own post versions" ON blog_post_versions
  FOR INSERT WITH CHECK (blog_post_id IN (
    SELECT id FROM blog_posts WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()
    )
  ));

-- WordPress Sites policies
CREATE POLICY "Users can view their own sites" ON wordpress_sites
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can create their own sites" ON wordpress_sites
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can update their own sites" ON wordpress_sites
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

CREATE POLICY "Users can delete their own sites" ON wordpress_sites
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.clerk_user_id()));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_ideas_updated_at BEFORE UPDATE ON blog_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordpress_sites_updated_at BEFORE UPDATE ON wordpress_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for images (run this separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);
