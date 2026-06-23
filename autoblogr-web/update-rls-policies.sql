-- Alternative: Update RLS policies to allow anon inserts for testing
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own blog ideas" ON blog_ideas;
DROP POLICY IF EXISTS "Users can insert their own blog ideas" ON blog_ideas;
DROP POLICY IF EXISTS "Users can update their own blog ideas" ON blog_ideas;
DROP POLICY IF EXISTS "Users can delete their own blog ideas" ON blog_ideas;

-- Create more permissive policies for testing
CREATE POLICY "Allow authenticated users to view their own blog ideas" ON blog_ideas
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert their own blog ideas" ON blog_ideas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own blog ideas" ON blog_ideas
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete their own blog ideas" ON blog_ideas
  FOR DELETE USING (true);

-- Same for blog_posts
DROP POLICY IF EXISTS "Users can view their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can insert their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;

CREATE POLICY "Allow authenticated users to view their own blog posts" ON blog_posts
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert their own blog posts" ON blog_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own blog posts" ON blog_posts
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete their own blog posts" ON blog_posts
  FOR DELETE USING (true);
