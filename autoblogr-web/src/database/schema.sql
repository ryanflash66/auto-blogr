-- AutoBlogr Database Schema
-- This file documents the database structure for AutoBlogr
-- Run these commands in your Supabase SQL editor after creating a project

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  wordpress_sites JSONB DEFAULT '[]'::jsonb,
  ai_usage_count INTEGER DEFAULT 0,
  ai_usage_limit INTEGER DEFAULT 10, -- Free tier limit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Blog Ideas Table
CREATE TABLE IF NOT EXISTS blog_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_keywords TEXT[],
  target_audience TEXT,
  content_type TEXT DEFAULT 'blog_post' CHECK (content_type IN ('blog_post', 'article', 'tutorial', 'review')),
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'casual', 'friendly', 'authoritative', 'conversational')),
  word_count_target INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'generating', 'generated', 'published')),
  seo_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  ai_enhanced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES blog_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- in minutes
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  wordpress_post_id INTEGER, -- For WordPress integration
  wordpress_site_id TEXT,
  published_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT TRUE,
  ai_model TEXT,
  generation_cost DECIMAL(10,4) DEFAULT 0.00,
  seo_analysis JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WordPress Sites Table
CREATE TABLE IF NOT EXISTS wordpress_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  site_username TEXT,
  site_password TEXT, -- Encrypted
  auth_type TEXT DEFAULT 'basic' CHECK (auth_type IN ('basic', 'oauth', 'application_password')),
  auth_token TEXT, -- For OAuth or Application Passwords
  site_status TEXT DEFAULT 'active' CHECK (site_status IN ('active', 'inactive', 'error')),
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  capabilities JSONB DEFAULT '{}'::jsonb, -- What the site supports
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('generate_idea', 'enhance_idea', 'generate_post', 'improve_content', 'seo_analysis')),
  ai_model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0.00,
  response_time INTEGER, -- in milliseconds
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT DEFAULT 'post' CHECK (template_type IN ('post', 'idea', 'outline')),
  content_structure JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Blog Ideas: Users can only access their own ideas
CREATE POLICY "Users can manage own blog ideas" ON blog_ideas 
  FOR ALL USING (auth.uid() = user_id);

-- Blog Posts: Users can only access their own posts
CREATE POLICY "Users can manage own blog posts" ON blog_posts 
  FOR ALL USING (auth.uid() = user_id);

-- WordPress Sites: Users can only access their own sites
CREATE POLICY "Users can manage own wordpress sites" ON wordpress_sites 
  FOR ALL USING (auth.uid() = user_id);

-- AI Usage Logs: Users can only view their own logs
CREATE POLICY "Users can view own ai usage logs" ON ai_usage_logs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert ai usage logs" ON ai_usage_logs 
  FOR INSERT WITH CHECK (true);

-- Content Templates: Users can manage own templates + view public ones
CREATE POLICY "Users can manage own templates" ON content_templates 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON content_templates 
  FOR SELECT USING (is_public = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_ideas_user_id ON blog_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_ideas_status ON blog_ideas(status);
CREATE INDEX IF NOT EXISTS idx_blog_ideas_created_at ON blog_ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_idea_id ON blog_posts(idea_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

-- Functions for automatic updates

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_blog_ideas_updated_at BEFORE UPDATE ON blog_ideas 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_wordpress_sites_updated_at BEFORE UPDATE ON wordpress_sites 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN CEIL(array_length(string_to_array(content_text, ' '), 1) / 200.0);
END;
$$ LANGUAGE plpgsql;

-- Function to count words
CREATE OR REPLACE FUNCTION count_words(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(string_to_array(trim(content_text), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate word count and reading time for blog posts
CREATE OR REPLACE FUNCTION update_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = count_words(NEW.content);
  NEW.reading_time = calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_metrics BEFORE INSERT OR UPDATE ON blog_posts 
  FOR EACH ROW EXECUTE PROCEDURE update_post_metrics();
