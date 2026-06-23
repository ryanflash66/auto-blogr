# Changelog

All notable changes to AutoBlogr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ✅ **COMPLETED: Real Clerk Authentication Integration (Task Group 1.1)**

  - Integrated ClerkProvider wrapper in main.jsx with proper configuration
  - Implemented protected routes using SignedIn/SignedOut components
  - Added PublicRoute component for auth pages with signed-in redirect logic
  - Replaced development mode with real authentication flow
  - Updated Layout component with UserButton and real user data display
  - Configured sign-in/sign-up redirects to dashboard
  - Removed development mode banner and placeholder authentication

- ✅ **COMPLETED: Supabase Database Setup & Clerk-Supabase Integration (Task Groups 2.1 & 2.2)**

  - Created complete database schema with 4 tables: users, user_profiles, blog_ideas, blog_posts
  - Implemented Row Level Security (RLS) policies for all tables
  - Configured Clerk JWT template "supabase" with proper signing key
  - Created ClerkSupabaseProvider context for automatic token synchronization
  - Enhanced SupabaseService with comprehensive error handling and null checking
  - Created SupabaseDebug component for troubleshooting database connections

- ✅ **COMPLETED: OpenRouter API Integration (Task Group 1.1)**

  - Configured real OpenRouter API key for production AI content generation
  - Validated OpenRouter service with multiple AI models (GPT-4o Mini, Claude 3 Haiku, etc.)
  - Implemented smart model selection based on task type and cost optimization
  - Created OpenRouterTest page for real-time API validation and testing
  - Enabled real AI generation across all application features
  - Replaced development fallbacks with actual AI service integration

- ✅ **COMPLETED: Supabase Database Setup (Task Group 2.1)**

  - Created complete PostgreSQL schema with blog_ideas, blog_posts, wordpress_sites, published_posts tables
  - Implemented Row Level Security (RLS) policies for user-specific data isolation
  - Added performance indexes and auto-update triggers for timestamp management
  - Configured Supabase client with environment variables and validation functions
  - Created comprehensive SQL setup script (COPY-TO-SUPABASE.sql) for database initialization

- ✅ **COMPLETED: Clerk-Supabase Integration (Task Group 2.2)**
  - Created ClerkSupabaseService for JWT token management and authenticated database operations
  - Implemented ClerkSupabaseProvider context for automatic token synchronization
  - Updated SupabaseService to accept Clerk authentication tokens for RLS compliance
  - Added DatabaseIntegrationTest page for testing BlogIdea entity CRUD operations
  - BlogIdea entity configured for Supabase operations with proper user_id handling
  - Fixed Dashboard.jsx to use Clerk useUser hook instead of deprecated User.me() calls
  - Integrated real user data loading with BlogIdea.findByUserId() for dashboard statistics

### Fixed

- Fixed ES module import paths in entities and components by adding .js extensions
- Resolved "TypeError: query.eq is not a function" errors with enhanced SupabaseService error handling
- Fixed Dashboard.jsx authentication by replacing deprecated User.me() with Clerk useUser hook
- Fixed Profile.jsx authentication by replacing deprecated User.me() with Clerk useUser hook
- Enhanced Profile.jsx with proper loading states and user authentication checks
- Resolved vite.config.js warnings about server.middlewareMode configuration
- Enhanced SupabaseService with comprehensive null checking and client initialization validation
- Cleaned up codebase by removing redundant test components and pages
- Removed duplicate DatabaseTest.jsx and AIServiceTestWorking.jsx components
- Consolidated testing functionality into LLMTest.jsx and OpenRouterTest.jsx pages
- Removed test page navigation items from Layout.jsx (LLM Test, Database Test, AI Test)
- Fixed icon imports in Layout.jsx (kept Zap for UI elements, removed unused Beaker and Database)

### Changed

- **App.jsx**: Complete rewrite implementing protected routing architecture with ProtectedRoute and PublicRoute components
- **Layout.jsx**: Updated to use real Clerk user data (name, email) instead of mock development placeholders
- **Dashboard.jsx**: Migrated from deprecated User.me() to Clerk useUser hook, integrated real BlogIdea data loading from Supabase
- **vite.config.js**: Merged duplicate optimizeDeps configurations to eliminate build warnings
- **main.jsx**: Refactored to follow official Clerk + React (Vite) integration pattern - direct ClerkProvider configuration, proper error handling, and simplified setup

### Fixed

- **React Router v7 Compatibility**: Added future flags (v7_startTransition, v7_relativeSplatPath) to BrowserRouter to eliminate console warnings about upcoming v7 changes
- **Clerk Deprecated Props**: Updated all deprecated authentication redirect props from `afterSignInUrl`/`redirectUrl` to `fallbackRedirectUrl` in SignIn.jsx and SignUp.jsx components
- **Clerk Integration Standards Compliance**: Refactored to follow official Clerk + React (Vite) patterns - moved configuration directly to main.jsx, added proper error handling for missing publishable key, simplified ClerkProvider setup
- **Vite Development Server Issues**: Resolved 504 Gateway Timeout errors during dependency optimization
  - **Root Cause**: Corrupted Vite dependency cache (.vite directory) causing EBUSY file lock errors during pre-bundling
  - **Resolution Method**: Cleared node_modules/.vite cache directory and restarted server on new port (3001)
  - **Configuration Fix**: Added optimizeDeps configuration to vite.config.js to explicitly include @clerk/clerk-react in dependency pre-bundling
  - **Result**: Eliminated blank page display and 504 "Outdated Optimize Dep" errors, restored full application functionality
- **Console Warnings**: Eliminated all authentication and routing-related console warnings for cleaner development experience

### Removed

- Development mode authentication bypass system
- Mock user data and placeholder authentication elements
- Development mode banner stating "Authentication disabled"
- Console warnings about deprecated React Router and Clerk props
- **src/config/clerk.js**: Removed separate config file in favor of official main.jsx pattern

---

## Previous Entries

### [2024-12-19] - Documentation Reality Check

### Fixed

## [1.0.0] - 2025-08-29

### Added

- **Complete Frontend Application**: React/Vite application with production-quality UI/UX
- **Sophisticated Mocking System**: Advanced development environment with localStorage persistence
- **Business Logic Implementation**: Complete user workflows for Ideas → Posts → Publishing
- **Entity Architecture**: Data layer abstraction ready for real backend integration
- **UI Components**: Professional responsive interface using Shadcn/UI component library
- **WordPress Publishing UI**: Complete interface for WordPress site management and publishing
- **AI Generation Interface**: Full UI for AI content generation and model selection
- **Development Environment**: Hot reload, error handling, and comprehensive development tools

### Build/CI

- **Vite Configuration**: Optimized build system with proper JSX handling
- **File Organization**: Clean project structure with proper entity and component separation
- **Environment Setup**: Configuration framework ready for production API keys

---

## Release Notes

### Current Status: Frontend Prototype (v1.0.0)

AutoBlogr is currently a sophisticated frontend prototype with complete UI/UX and business logic implementation. All backend services (AI, WordPress, Database) are mocked for development purposes and require real implementation for production deployment.

### Next Major Release: Backend Integration (v2.0.0)

The next major version will focus on real backend service integration:

- Real AI integration (OpenRouter + Hugging Face)
- Actual database implementation (Supabase)
- WordPress REST API integration
- Production authentication system
