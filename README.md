# AutoBlogr

AI-powered blog content generator with WordPress publishing.

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

That's it! The app runs locally with all data stored in your browser.

## AI Features (Optional)

To enable AI content generation, you need an **OpenRouter API key**:

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create a free account and get an API key
3. When you first try to generate content, you'll be prompted to enter it

Or set it in a `.env` file:
```
VITE_OPENROUTER_API_KEY=your_key_here
```

## Features

- **Blog Ideas** - Create and organize content ideas
- **AI Generation** - Generate full blog posts with AI (requires API key)
- **Hero Images** - AI-generated images for your posts
- **WordPress Publishing** - Publish directly to WordPress sites
- **SEO Tools** - Built-in SEO analysis and optimization
- **Version History** - Track changes to your posts

## Tech Stack

- React 18 + Vite
- TailwindCSS + shadcn/ui
- OpenRouter (AI)
- Local Storage (data persistence)
