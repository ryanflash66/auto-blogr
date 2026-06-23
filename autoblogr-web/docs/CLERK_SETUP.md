# Clerk Authentication Setup Guide

## Overview

This guide walks you through setting up Clerk authentication for AutoBlogr.

## Prerequisites

- A Clerk account (sign up at https://clerk.dev)
- Node.js and npm installed
- AutoBlogr project running locally

## Step 1: Create Clerk Application

1. Go to https://clerk.dev and sign up/sign in
2. Create a new application
3. Choose the authentication methods you want (email, Google, GitHub, etc.)
4. Note down your API keys

## Step 2: Configure Environment Variables

Update your `.env.local` file with your Clerk keys:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## Step 3: Test Authentication

1. Restart your development server: `npm run dev`
2. Navigate to http://localhost:3000
3. You should see the AutoBlogr dashboard
4. Try navigating to `/sign-in` and `/sign-up` to test auth pages

## Step 4: Customize Authentication (Optional)

The Clerk configuration can be customized in `src/config/clerk.js`:

- Change theme colors to match your brand
- Modify redirect URLs
- Customize appearance elements

## Features Implemented

✅ **ClerkProvider Integration**: App wrapped with Clerk authentication
✅ **Sign-In Page**: Custom branded sign-in page at `/sign-in`
✅ **Sign-Up Page**: Custom branded sign-up page at `/sign-up`
✅ **Protected Routes**: Components protected with authentication checks
✅ **User Profile**: UserButton integrated in Layout for user management
✅ **Loading States**: Proper loading indicators while auth state loads
✅ **Development Mode**: Graceful fallback when Clerk keys not configured

## Next Steps

After Clerk is configured:

1. All pages will require authentication
2. User profile information will be available throughout the app
3. You can proceed to Phase 1, Task Group 1.2: Supabase setup

## Troubleshooting

**Issue**: "Clerk publishable key not found" warning
**Solution**: Make sure `.env.local` has the correct `VITE_CLERK_PUBLISHABLE_KEY`

**Issue**: Auth pages not styling correctly
**Solution**: Check that TailwindCSS is properly configured and classes are available

**Issue**: Redirect loops
**Solution**: Verify that `afterSignInUrl` and `afterSignUpUrl` are set correctly in clerk config
