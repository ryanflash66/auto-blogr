-- AutoBlogr Database Setup Script
-- Copy this entire script and paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/fctffvqmfasijspzmjrw/sql

-- Step 1: Create blog_ideas table
CREATE TABLE blog_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'generating', 'generated', 'published')),
  keywords TEXT[],
  target_audience TEXT,
  tone TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create blog_posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  blog_idea_id UUID REFERENCES blog_ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
  seo_meta_title TEXT,
  seo_meta_description TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  word_count INTEGER DEFAULT 0,
  ai_model_used TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create wordpress_sites table
CREATE TABLE wordpress_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT NOT NULL,
  app_password TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  last_test_at TIMESTAMP WITH TIME ZONE,
  test_status TEXT CHECK (test_status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create published_posts table
CREATE TABLE published_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  wordpress_site_id UUID REFERENCES wordpress_sites(id) ON DELETE CASCADE,
  wordpress_post_id INTEGER NOT NULL,
  published_url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable Row Level Security
ALTER TABLE blog_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies for blog_ideas
CREATE POLICY "Users can view their own blog ideas" ON blog_ideas
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own blog ideas" ON blog_ideas
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own blog ideas" ON blog_ideas
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own blog ideas" ON blog_ideas
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Step 7: Create RLS Policies for blog_posts
CREATE POLICY "Users can view their own blog posts" ON blog_posts
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own blog posts" ON blog_posts
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own blog posts" ON blog_posts
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own blog posts" ON blog_posts
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Step 8: Create RLS Policies for wordpress_sites
CREATE POLICY "Users can view their own WordPress sites" ON wordpress_sites
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own WordPress sites" ON wordpress_sites
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own WordPress sites" ON wordpress_sites
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own WordPress sites" ON wordpress_sites
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Step 9: Create RLS Policies for published_posts
CREATE POLICY "Users can view their own published posts" ON published_posts
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own published posts" ON published_posts
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own published posts" ON published_posts
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own published posts" ON published_posts
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Step 10: Create indexes for performance
CREATE INDEX idx_blog_ideas_user_id ON blog_ideas(user_id);
CREATE INDEX idx_blog_ideas_status ON blog_ideas(status);
CREATE INDEX idx_blog_ideas_created_at ON blog_ideas(created_at DESC);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_blog_idea_id ON blog_posts(blog_idea_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

CREATE INDEX idx_wordpress_sites_user_id ON wordpress_sites(user_id);
CREATE INDEX idx_wordpress_sites_is_connected ON wordpress_sites(is_connected);

CREATE INDEX idx_published_posts_user_id ON published_posts(user_id);
CREATE INDEX idx_published_posts_blog_post_id ON published_posts(blog_post_id);
CREATE INDEX idx_published_posts_wordpress_site_id ON published_posts(wordpress_site_id);
CREATE INDEX idx_published_posts_published_at ON published_posts(published_at DESC);

-- Step 11: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 12: Create triggers for updated_at
CREATE TRIGGER update_blog_ideas_updated_at BEFORE UPDATE ON blog_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordpress_sites_updated_at BEFORE UPDATE ON wordpress_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
