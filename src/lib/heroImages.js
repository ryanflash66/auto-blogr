/**
 * Hero image storage.
 *
 * Generated images arrive as base64 and have to outlive the generation call:
 * posts keep the URL and WordPress publishing downloads it later. They go to
 * the public `hero-images` bucket under the owner's folder (its insert policy
 * only allows `<auth.uid()>/...`), named with random UUIDs.
 */
import { supabase } from '@/lib/supabaseClient';

const HERO_IMAGES_BUCKET = 'hero-images';

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const base64ToBytes = (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

// Upload a base64 image and return its public URL. Throws on any failure.
export const uploadHeroImage = async ({ base64, mediaType = 'image/png' }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Sign in to save generated images.');

  const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[mediaType] ?? 'png'}`;
  const bucket = supabase.storage.from(HERO_IMAGES_BUCKET);

  const { error } = await bucket.upload(path, base64ToBytes(base64), {
    contentType: mediaType,
    upsert: false,
  });
  if (error) throw error;

  return bucket.getPublicUrl(path).data.publicUrl;
};
