import { vi, describe, it, expect, beforeEach } from 'vitest';

const { state, supabase, bucket } = vi.hoisted(() => {
  const state = { sessionUserId: 'user-123', uploadError: null };
  const bucket = {
    upload: vi.fn(() => Promise.resolve({ data: {}, error: state.uploadError })),
    getPublicUrl: vi.fn((path) => ({
      data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/hero-images/${path}` },
    })),
  };
  const supabase = {
    storage: { from: vi.fn(() => bucket) },
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: state.sessionUserId ? { user: { id: state.sessionUserId } } : null,
          },
        })
      ),
    },
  };
  return { state, supabase, bucket };
});

vi.mock('@/lib/supabaseClient', () => ({ supabase, default: supabase }));

const { uploadHeroImage } = await import('@/lib/heroImages');

beforeEach(() => {
  vi.clearAllMocks();
  state.sessionUserId = 'user-123';
  state.uploadError = null;
});

describe('uploadHeroImage', () => {
  it("uploads the decoded bytes into the user's own folder and returns the public url", async () => {
    const url = await uploadHeroImage({ base64: 'aGVybw==', mediaType: 'image/jpeg' });

    expect(supabase.storage.from).toHaveBeenCalledWith('hero-images');
    const [path, body, options] = bucket.upload.mock.calls[0];
    expect(path).toMatch(/^user-123\/[0-9a-f-]{36}\.jpg$/);
    expect(new TextDecoder().decode(body)).toBe('hero');
    expect(options).toEqual({ contentType: 'image/jpeg', upsert: false });
    expect(url).toBe(
      `https://project.supabase.co/storage/v1/object/public/hero-images/${path}`
    );
  });

  it('defaults to png when the media type is missing', async () => {
    await uploadHeroImage({ base64: 'aGVybw==' });

    const [path, , options] = bucket.upload.mock.calls[0];
    expect(path).toMatch(/\.png$/);
    expect(options.contentType).toBe('image/png');
  });

  it('throws without a session and uploads nothing', async () => {
    state.sessionUserId = null;

    await expect(uploadHeroImage({ base64: 'aGVybw==' })).rejects.toThrow(
      'Sign in to save generated images.'
    );
    expect(bucket.upload).not.toHaveBeenCalled();
  });

  it('throws the storage error', async () => {
    state.uploadError = new Error('new row violates row-level security policy');

    await expect(uploadHeroImage({ base64: 'aGVybw==' })).rejects.toThrow(
      'new row violates row-level security policy'
    );
    expect(bucket.getPublicUrl).not.toHaveBeenCalled();
  });
});
