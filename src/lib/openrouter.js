/**
 * OpenRouter API Integration
 * Provides LLM and image generation capabilities
 */

import { userStorage } from '@/lib/supabaseStorage';
import { uploadHeroImage } from '@/lib/heroImages';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export const MISSING_KEY_MESSAGE =
  'Add your OpenRouter API key on the Profile page to generate content.';
const INVALID_KEY_MESSAGE = 'Invalid API key. Update it on the Profile page.';

// Bring-your-own-key: the signed-in user's key lives in their RLS-scoped
// profile row. There is deliberately no env fallback: Vite inlines VITE_*
// values into the public bundle, which would share one key with every visitor.
const getApiKey = async () => {
  const profile = await userStorage.get();
  return profile?.openrouter_api_key?.trim() || null;
};

// Default models. OpenRouter slugs use dot notation ('claude-opus-4.8'), which
// differs from Anthropic's own API ids ('claude-opus-4-8') — verify any change
// against https://openrouter.ai/api/v1/models before shipping it.
const DEFAULT_TEXT_MODEL = 'anthropic/claude-opus-4.8';
// Seedream 4.5 documents 16:9 output on OpenRouter's Image API, at about
// $0.04-0.05 per image (Sept 2026). Re-check GET /api/v1/images/models before
// swapping it: models accept different aspect ratios.
const DEFAULT_IMAGE_MODEL = 'bytedance-seed/seedream-4.5';

/**
 * Invoke LLM for text generation
 */
export const InvokeLLM = async ({ 
  prompt, 
  response_json_schema, 
  model = DEFAULT_TEXT_MODEL,
  max_tokens = 4096
}) => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error(MISSING_KEY_MESSAGE);
  }

  const messages = [{ role: 'user', content: prompt }];
  
  if (response_json_schema) {
    messages[0].content = `${prompt}\n\nIMPORTANT: You must respond with valid JSON that matches this schema:\n${JSON.stringify(response_json_schema, null, 2)}\n\nRespond ONLY with the JSON object, no additional text or markdown formatting.`;
  }

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AutoBlogr',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(INVALID_KEY_MESSAGE);
      }
      throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (response_json_schema) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    }

    return content;
  } catch (error) {
    console.error('InvokeLLM error:', error);
    throw error;
  }
};

/**
 * Generate an image with OpenRouter's Image API and store it, returning a
 * durable URL. Throws on any failure (callers decide whether to carry on
 * without an image); it never hands back a placeholder.
 */
export const GenerateImage = async ({
  prompt,
  model = DEFAULT_IMAGE_MODEL,
  aspect_ratio = '16:9'
}) => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error(MISSING_KEY_MESSAGE);
  }

  const response = await fetch(`${OPENROUTER_API_URL}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AutoBlogr',
    },
    body: JSON.stringify({ model, prompt, aspect_ratio }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(INVALID_KEY_MESSAGE);
    }
    throw new Error(error.error?.message || `Image generation error: ${response.status}`);
  }

  const data = await response.json();
  const image = data.data?.[0];

  if (!image?.b64_json) {
    throw new Error('The image model returned no image.');
  }

  const url = await uploadHeroImage({ base64: image.b64_json, mediaType: image.media_type });
  return { url };
};

export default {
  InvokeLLM,
  GenerateImage,
};
