import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InvokeLLM, GenerateImage } from './openrouter';

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

describe('InvokeLLM', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed a key so getApiKey() never falls through to window.prompt().
    localStorage.setItem('openrouter_api_key', 'test-key');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('throws and clears the stored key on HTTP 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(401));

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow(
      'Invalid API key. Please refresh and try again.'
    );
    expect(localStorage.getItem('openrouter_api_key')).toBeNull();
  });

  it('throws with the API-provided message on a non-401 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      errorResponse(500, { error: { message: 'boom' } })
    );

    await expect(InvokeLLM({ prompt: 'x' })).rejects.toThrow('boom');
    // Non-401 errors must not clear the key.
    expect(localStorage.getItem('openrouter_api_key')).toBe('test-key');
  });
});

describe('GenerateImage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('openrouter_api_key', 'test-key');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the image url on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ url: 'https://img.example/pic.png' }] }),
    });

    const result = await GenerateImage({ prompt: 'a cat' });
    expect(result).toEqual({ url: 'https://img.example/pic.png' });
  });

  it('returns the placeholder url when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const result = await GenerateImage({ prompt: 'a cat' });
    expect(result.url).toContain('placehold.co');
  });
});
