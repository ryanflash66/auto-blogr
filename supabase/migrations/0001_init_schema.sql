-- AutoBlogr initial schema (multi-user, Supabase Auth + RLS)
-- Field names match the current app's data shapes so the storage adapter is a drop-in.
-- Apply via: Supabase SQL Editor, `supabase db push`, or the Supabase MCP.

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users) — business profile + BYOK keys
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  business_name text,
  business_description text,
  industry text,
  target_audience text,
  brand_voice text default 'professional',
  content_preferences jsonb not null default
    '{"preferred_length":"medium","include_images":true,"seo_focused":true}'::jsonb,
  timezone text default 'UTC',
  openrouter_api_key text,   -- BYOK: user's own OpenRouter key (RLS-protected)
  image_api_key text,        -- BYOK: user's own image-provider key
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_ideas
-- ---------------------------------------------------------------------------
create table if not exists public.blog_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_audience text,
  tone text default 'professional',
  keywords text[] not null default '{}',
  variations_requested integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft','generating','ready','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- wordpress_sites
-- ---------------------------------------------------------------------------
create table if not exists public.wordpress_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  username text,
  api_key text,   -- WordPress Application Password (move to Vault in a later pass)
  default_category text,
  default_author text,
  connection_status text default 'disconnected'
    check (connection_status in ('connected','disconnected')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_posts (publish state lives on the post, matching the current app)
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blog_idea_id uuid references public.blog_ideas(id) on delete set null,
  title text not null,
  content text,
  excerpt text,
  hero_image_url text,
  hero_image_alt text,
  variation_number integer,
  status text not null default 'ready'
    check (status in ('draft','generating','ready','published','scheduled')),
  seo_title text,
  meta_description text,
  tags text[] not null default '{}',
  word_count integer not null default 0,
  wordpress_site_id uuid references public.wordpress_sites(id) on delete set null,
  wordpress_post_id text,
  published_at timestamptz,
  scheduled_publish_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_post_versions (append-only history)
-- ---------------------------------------------------------------------------
create table if not exists public.blog_post_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  title text,
  content text,
  excerpt text,
  version_number integer,
  change_type text default 'manual_save',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_blog_ideas_user_id on public.blog_ideas(user_id);
create index if not exists idx_blog_posts_user_id on public.blog_posts(user_id);
create index if not exists idx_blog_posts_idea_id on public.blog_posts(blog_idea_id);
create index if not exists idx_wordpress_sites_user_id on public.wordpress_sites(user_id);
create index if not exists idx_versions_user_id on public.blog_post_versions(user_id);
create index if not exists idx_versions_post_id on public.blog_post_versions(blog_post_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_blog_ideas_updated_at before update on public.blog_ideas
  for each row execute function public.set_updated_at();
create trigger trg_wordpress_sites_updated_at before update on public.wordpress_sites
  for each row execute function public.set_updated_at();
create trigger trg_blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security: each user sees only their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.blog_ideas          enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.blog_post_versions  enable row level security;
alter table public.wordpress_sites     enable row level security;

-- profiles (keyed on id = auth user)
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- generic owner policies for the user-scoped tables
create policy "blog_ideas_all_own" on public.blog_ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "blog_posts_all_own" on public.blog_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "blog_post_versions_all_own" on public.blog_post_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wordpress_sites_all_own" on public.wordpress_sites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
