# Clerk JWT Template Configuration for Supabase

## Steps to Configure Clerk for Supabase Integration:

### 1. Go to Clerk Dashboard

- Visit: https://dashboard.clerk.com/
- Select your AutoBlogr project

### 2. Configure JWT Template

- Navigate to **JWT Templates** in the sidebar
- Click **New Template**
- Choose **Supabase** from the list of integrations

### 3. Template Configuration

```json
{
  "sub": "{{user.id}}",
  "role": "authenticated",
  "aud": "authenticated",
  "iss": "https://{{domain}}",
  "iat": {{date.now}},
  "exp": {{date.now + 3600}}
}
```

### 4. Template Name

Set the template name to: `supabase`

### 5. Update Supabase RLS Policies (if needed)

The RLS policies use `auth.jwt() ->> 'sub'` which will now contain the Clerk user ID.

### 6. Test Integration

After configuring, the application will automatically:

- Sync Clerk authentication with Supabase
- Enable Row Level Security with user-specific data access
- Allow BlogIdea entities to save/load from the database

## Environment Variables Required

Make sure these are set in `.env.local`:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Verification

Once configured, test by:

1. Starting the app: `npm run dev`
2. Sign in with Clerk
3. Navigate to Ideas page
4. Create a new blog idea
5. Check Supabase dashboard to see the data

The BlogIdea entities should now save to the `blog_ideas` table with proper user isolation.
