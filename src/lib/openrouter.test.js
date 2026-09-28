import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { userStorageMock } = vi.hoisted(() => ({
  userStorageMock: { get: vi.fn() },
}));

vi.mock('@/lib/supabaseStorage', () => ({ userStorage: userStorageMock }));

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
  beforeEach(() => {
    vi.restoreAllMocks();
    userStorageMock.get.mockReset();
    withProfileKey('test-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the image url on success, using the profile key', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ url: 'https://img.example/pic.png' }] }),
    });

    const result = await GenerateImage({ prompt: 'a cat' });
    expect(result).toEqual({ url: 'https://img.example/pic.png' });
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key');
  });

  it('throws the Profile-page message when no key is saved', async () => {
    withProfileKey('');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(GenerateImage({ prompt: 'a cat' })).rejects.toThrow(MISSING_KEY_MESSAGE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns the placeholder url when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const result = await GenerateImage({ prompt: 'a cat' });
    expect(result.url).toContain('placehold.co');
  });
});
