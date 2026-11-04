import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { userStorageMock, uploadHeroImageMock } = vi.hoisted(() => ({
  userStorageMock: { get: vi.fn() },
  uploadHeroImageMock: vi.fn(),
}));

vi.mock('@/lib/supabaseStorage', () => ({ userStorage: userStorageMock }));
vi.mock('@/lib/heroImages', () => ({ uploadHeroImage: uploadHeroImageMock }));

import { InvokeLLM, GenerateImage, MISSING_KEY_MESSAGE } from './openrouter';

// A minimal stand-in for a successful chat/completions response whose assistant
// message content is `content`.
const chatResponse = (content) => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content } }] }),
});

const errorResponse = (status, body = {}) => ({
  ok: false,
  status,
  json: async () => body,
});

const withProfileKey = (key) =>
  userStorageMock.get.mockResolvedValue({ id: 'user-1', openrouter_api_key: key });

describe('InvokeLLM', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    userStorageMock.get.mockReset();
    withProfileKey('test-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('sends the key from the user profile as a bearer token', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(chatResponse('hello'));

    await InvokeLLM({ prompt: 'hi' });

    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });

  it('trims whitespace around the stored key', async () => {
    withProfileKey('  test-key  ');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(chatResponse('hello'));

    await InvokeLLM({ prompt: 'hi' });

    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key');
  });

  it('throws the Profile-page message and never calls fetch when no key is saved', async () => {
    withProfileKey(null);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow(MISSING_KEY_MESSAGE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('treats a whitespace-only key as missing', async () => {
    withProfileKey('   ');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow(MISSING_KEY_MESSAGE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('ignores VITE_OPENROUTER_API_KEY, localStorage and window.prompt', async () => {
    withProfileKey(undefined);
    vi.stubEnv('VITE_OPENROUTER_API_KEY', 'env-key');
    localStorage.setItem('openrouter_api_key', 'stale-local-key');
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('typed-key');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow(MISSING_KEY_MESSAGE);
    expect(promptSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    localStorage.clear();
  });

  it('parses a clean JSON response when a schema is requested', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      chatResponse('{"title":"Hi","ok":true}')
    );

    const result = await InvokeLLM({
      prompt: 'make json',
      response_json_schema: { type: 'object' },
    });

    expect(result).toEqual({ title: 'Hi', ok: true });
  });

  it('extracts JSON embedded in surrounding prose', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      chatResponse('Sure! Here you go:\n{"a":1,"b":[2,3]}\nHope that helps.')
    );

    const result = await InvokeLLM({
      prompt: 'make json',
      response_json_schema: { type: 'object' },
    });

    expect(result).toEqual({ a: 1, b: [2, 3] });
  });

  it('throws when the response cannot be parsed as JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      chatResponse('absolutely no json here')
    );

    await expect(
      InvokeLLM({ prompt: 'x', response_json_schema: { type: 'object' } })
    ).rejects.toThrow('Failed to parse LLM response as JSON');
  });

  it('returns plain text when no response_json_schema is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      chatResponse('just some prose, not parsed')
    );

    const result = await InvokeLLM({ prompt: 'write something' });
    expect(result).toBe('just some prose, not parsed');
  });

  it('throws on HTTP 401 without touching localStorage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(401));
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow(
      'Invalid API key. Update it on the Profile page.'
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('throws with the API-provided message on a non-401 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      errorResponse(500, { error: { message: 'boom' } })
    );

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow('boom');
  });
});

describe('GenerateImage', () => {
  const imageResponse = (data) => ({
    ok: true,
    status: 200,
    json: async () => ({ data }),
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    userStorageMock.get.mockReset();
    uploadHeroImageMock.mockReset().mockResolvedValue('https://store.example/hero.jpg');
    withProfileKey('test-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the Image API with the profile key and a 16:9 request', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(imageResponse([{ b64_json: 'aGVybw==', media_type: 'image/jpeg' }]));

    await GenerateImage({ prompt: 'a cat' });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/images');
    expect(init.headers.Authorization).toBe('Bearer test-key');
    expect(JSON.parse(init.body)).toEqual({
      model: 'bytedance-seed/seedream-4.5',
      prompt: 'a cat',
      aspect_ratio: '16:9',
    });
  });

  it('stores the returned image and hands back its durable url', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      imageResponse([{ b64_json: 'aGVybw==', media_type: 'image/jpeg' }])
    );

    const result = await GenerateImage({ prompt: 'a cat' });

    expect(uploadHeroImageMock).toHaveBeenCalledWith({
      base64: 'aGVybw==',
      mediaType: 'image/jpeg',
    });
    expect(result).toEqual({ url: 'https://store.example/hero.jpg' });
  });

  it('throws the Profile-page message when no key is saved', async () => {
    withProfileKey('');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow(MISSING_KEY_MESSAGE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws the invalid-key message on HTTP 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(401));

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow(
      'Invalid API key. Update it on the Profile page.'
    );
    expect(uploadHeroImageMock).not.toHaveBeenCalled();
  });

  it('throws the API message on other errors instead of returning a placeholder', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      errorResponse(400, { error: { message: 'unsupported aspect_ratio' } })
    );

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow('unsupported aspect_ratio');
    expect(uploadHeroImageMock).not.toHaveBeenCalled();
  });

  it('throws when the network call fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow('network down');
  });

  it('throws when the response carries no image data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(imageResponse([]));

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow(
      'The image model returned no image.'
    );
    expect(uploadHeroImageMock).not.toHaveBeenCalled();
  });

  it('propagates a storage failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      imageResponse([{ b64_json: 'aGVybw==', media_type: 'image/jpeg' }])
    );
    uploadHeroImageMock.mockRejectedValue(new Error('Bucket not found'));

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow('Bucket not found');
  });
});
