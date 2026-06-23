-- Temporary RLS Bypass for Testing
-- Run this in Supabase SQL Editor to temporarily disable RLS for testing

-- Disable RLS temporarily
ALTER TABLE blog_ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable with:
-- ALTER TABLE blog_ideas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
