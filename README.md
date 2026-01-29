# AutoBlogr

An AI-powered blog content creation and WordPress publishing platform built with React, Supabase, Clerk, and OpenRouter.

## Features

- **AI Content Generation**: Generate blog posts from simple ideas using LLMs via OpenRouter
- **Multiple Variations**: Create multiple versions of the same blog post
- **AI Image Generation**: Automatically generate hero images for posts
- **Rich Text Editing**: Edit content with a full WYSIWYG editor
- **SEO Analysis**: Get AI-powered SEO scores and improvement suggestions
- **Content Analysis**: Analyze clarity, engagement, and flow
- **Tone Rephrasing**: Transform content into different writing styles
- **Version History**: Track and restore previous versions of posts
- **WordPress Integration**: Publish directly to WordPress sites
- **Scheduled Publishing**: Schedule posts for future publishing

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter (access to Claude, GPT-4, etc.)
- **Storage**: Supabase Storage (for images)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- OpenRouter account

### 1. Clone and Install

```bash
git clone <repo-url>
cd autoblogr
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key | [Clerk Dashboard](https://dashboard.clerk.com) |
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | [Supabase Dashboard](https://supabase.com/dashboard) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key | [OpenRouter Keys](https://openrouter.ai/keys) |

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor in your Supabase dashboard
3. Run the schema in `supabase/schema.sql` to create all tables and policies
4. Create a storage bucket named `blog-images` (optional, for image uploads)

### 4. Configure Clerk

1. Create a Clerk application
2. Enable Email/Password and any social sign-in methods you want
3. (Optional) Set up a Supabase JWT template for RLS if you want row-level security

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── ideas/          # Blog idea components
│   ├── posts/          # Blog post components
│   ├── ui/             # shadcn/ui components
│   └── wordpress/      # WordPress integration components
├── lib/                # Utilities and providers
│   ├── AuthContext.jsx # Clerk auth context
│   ├── openrouter.js   # OpenRouter AI integration
│   ├── supabase.js     # Supabase client
│   └── utils.js        # Utility functions
├── pages/              # Page components
├── services/           # Data services (CRUD operations)
│   ├── blogIdeas.js
│   ├── blogPosts.js
│   ├── blogPostVersions.js
│   ├── users.js
│   └── wordpressSites.js
└── App.jsx             # Main app component
```

## Usage

### Creating Blog Posts

1. **Create an Idea**: Go to Ideas and create a new blog idea with title, description, tone, and keywords
2. **Generate Content**: Click "Generate Content" to create AI-generated blog posts
3. **Edit & Refine**: Use the editor to refine content, apply tone changes, and optimize SEO
4. **Publish**: Connect a WordPress site and publish directly

### WordPress Integration

1. Go to WordPress settings
2. Add your WordPress site URL
3. Create an Application Password in WordPress (Users → Profile → Application Passwords)
4. Test the connection
5. Publish posts directly from the editor

## AI Models

The app uses OpenRouter to access various AI models. Default models:

- **Text Generation**: `anthropic/claude-3.5-sonnet`
- **Image Generation**: `openai/dall-e-3`

You can customize these in `src/lib/openrouter.js`.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run lint:fix  # Fix ESLint errors
```

## License

MIT
