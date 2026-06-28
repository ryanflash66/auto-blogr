/**
 * Supabase Storage Service
 *
 * Drop-in replacement for `src/lib/storage.js` (the localStorage adapter):
 * same async `createStorage(table)` CRUD surface and same `userStorage`, but
 * backed by Supabase Postgres. Pages/components and the service wrappers keep
 * working unchanged.
 *
 * Scoping is handled by Row Level Security (RLS): every user-scoped table
 * enforces `user_id = auth.uid()`, and `profiles` enforces `id = auth.uid()`.
 * `create` injects the current session user's id so the RLS WITH CHECK passes;
 * reads/updates/deletes are filtered to the caller's own rows by RLS, so the
 * `userId` the service wrappers still pass through is intentionally unused here.
 *
 * Every supabase error is thrown so the app's toast layer can surface it.
 */
import { supabase } from '@/lib/supabaseClient';

const PROFILES_TABLE = 'profiles';

// Default profile shape returned when there is no authenticated session yet or
// the user's profile row has not been created. Mirrors the localStorage
// adapter's default user and the DB column defaults for `content_preferences`.
const DEFAULT_USER = {
  full_name: '',
  email: '',
  business_name: '',
  business_description: '',
  industry: '',
  target_audience: '',
  brand_voice: 'professional',
  content_preferences: {
    preferred_length: 'medium',
    include_images: true,
    seo_focused: true,
  },
  timezone: 'UTC',
};

// Throw on any supabase error so the toast layer surfaces it.
const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// Components read `created_date`; keep it in sync with the canonical
// `created_at` column on every row we hand back.
const withCreatedDate = (row) =>
  row ? { ...row, created_date: row.created_at } : row;

const mapRows = (rows) => (rows || []).map(withCreatedDate);

// Resolve the current session user's id (or null when unauthenticated).
const getUserId = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

/**
 * Generic CRUD operations for a Supabase table, matching the localStorage
 * adapter's `createStorage` interface.
 */
export const createStorage = (tableName) => ({
  list: async (orderBy = '-created_at', limit) => {
    // A leading `-` means descending; otherwise ascending.
    const ascending = !orderBy.startsWith('-');
    const field = orderBy.replace(/^-/, '');

    let query = supabase
      .from(tableName)
      .select('*')
      .order(field, { ascending });
    if (limit) query = query.limit(limit);

    return mapRows(unwrap(await query));
  },

  filter: async (filters) => {
    const query = supabase.from(tableName).select('*').match(filters);
    return mapRows(unwrap(await query));
  },

  get: async (id) => {
    const query = supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return withCreatedDate(unwrap(await query));
  },

  create: async (data) => {
    // RLS WITH CHECK requires user_id = auth.uid(); inject it from the session.
    const user_id = await getUserId();
    const query = supabase
      .from(tableName)
      .insert({ ...data, user_id })
      .select()
      .single();
    return withCreatedDate(unwrap(await query));
  },

  update: async (id, updates) => {
    const query = supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return withCreatedDate(unwrap(await query));
  },

  delete: async (id) => {
    const query = supabase.from(tableName).delete().eq('id', id);
    unwrap(await query);
  },
});

/**
 * User storage backed by the `profiles` table (1:1 with the auth user, keyed
 * on `id = auth.uid()`). Same async interface as the localStorage adapter's
 * `userStorage`.
 */
export const userStorage = {
  get: async () => {
    const userId = await getUserId();
    // No session yet — hand back a sensible default rather than throwing so
    // callers that read the profile before auth settles don't blow up.
    if (!userId) return { ...DEFAULT_USER };

    const profile = withCreatedDate(
      unwrap(
        await supabase
          .from(PROFILES_TABLE)
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      )
    );

    // Profile row not created yet (e.g. trigger lag) — fall back to a default
    // carrying the real id so a subsequent update upserts the right row.
    return profile ?? { ...DEFAULT_USER, id: userId };
  },

  update: async (updates) => {
    const userId = await getUserId();
    // Upsert keyed on id = auth.uid() so the first save creates the row and
    // later saves patch it.
    const query = supabase
      .from(PROFILES_TABLE)
      .upsert({ ...updates, id: userId }, { onConflict: 'id' })
      .select()
      .single();
    return withCreatedDate(unwrap(await query));
  },
};

export default { createStorage, userStorage };
