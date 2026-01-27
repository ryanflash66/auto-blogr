# Welcome Back! 👋

> **Last Updated**: January 2026  
> **Status**: Refactored - needs configuration before running

This codebase was refactored to remove Base44 and use **Supabase, Clerk, and OpenRouter** instead.

---

## Quick Start Checklist

- [ ] Create `.env` file from template
- [ ] Set up Clerk account & get publishable key
- [ ] Set up Supabase project & get credentials
- [ ] Get OpenRouter API key
- [ ] Run database schema in Supabase
- [ ] Install dependencies & run

---

## Step-by-Step Setup

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Get Your API Keys

| Service | What to Get | Where to Get It |
|---------|-------------|-----------------|
| **Clerk** | Publishable Key | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Supabase** | Project URL + Anon Key | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **OpenRouter** | API Key | [openrouter.ai/keys](https://openrouter.ai/keys) |

### 3. Set Up Supabase Database

1. Create a new Supabase project (or use existing)
2. Go to **SQL Editor** in dashboard
3. Copy & paste contents of `supabase/schema.sql`
4. Run the query

This creates all tables with Row Level Security policies.

### 4. Install & Run

```bash
npm install
npm run dev
```

App will be at `http://localhost:5173`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Supabase client config |
| `src/lib/openrouter.js` | AI integration (LLM + image gen) |
| `src/lib/AuthContext.jsx` | Clerk authentication |
| `src/services/` | All database CRUD operations |
| `supabase/schema.sql` | Database schema |
| `.env.example` | Environment variable template |

---

## Tech Stack Summary

- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter (access to Claude, GPT-4, DALL-E, etc.)
- **Rich Text**: ReactQuill

---

## What This App Does

**AutoBlogr** is an AI-powered blog content generator that:

1. Takes blog ideas with tone/audience settings
2. Generates full blog posts using AI
3. Creates hero images automatically
4. Provides SEO analysis and improvements
5. Publishes directly to WordPress sites

---

*Delete this file once you're set up and running!*
