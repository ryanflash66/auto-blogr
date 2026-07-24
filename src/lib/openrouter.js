/**
 * OpenRouter API Integration
 * Provides LLM and image generation capabilities
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

// Get API key from env or prompt user
const getApiKey = () => {
  let key = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!key) {
    key = localStorage.getItem('openrouter_api_key');
  }
  
  if (!key) {
    key = prompt('Enter your OpenRouter API key (get one free at openrouter.ai/keys):');
    if (key) {
      localStorage.setItem('openrouter_api_key', key);
    }
  }
  
  return key;
};

// Default models. OpenRouter slugs use dot notation ('claude-opus-4.8'), which
// differs from Anthropic's own API ids ('claude-opus-4-8') — verify any change
// against https://openrouter.ai/api/v1/models before shipping it.
const DEFAULT_TEXT_MODEL = 'anthropic/claude-opus-4.8';
const DEFAULT_IMAGE_MODEL = 'openai/dall-e-3';

/**
 * Invoke LLM for text generation
 */
export const InvokeLLM = async ({ 
  prompt, 
  response_json_schema, 
  model = DEFAULT_TEXT_MODEL,
  max_tokens = 4096 
}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key required. Get one at openrouter.ai/keys');
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
        localStorage.removeItem('openrouter_api_key');
        throw new Error('Invalid API key. Please refresh and try again.');
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
 * Generate an image using OpenRouter
 */
export const GenerateImage = async ({ 
  prompt, 
  model = DEFAULT_IMAGE_MODEL,
  size = '1792x1024' 
}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key required. Get one at openrouter.ai/keys');
  }

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AutoBlogr',
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Image generation error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return { url: imageUrl };
  } catch (error) {
    console.error('GenerateImage error:', error);
    // Return placeholder on error
    return {
      url: `https://placehold.co/1792x1024/1a1a2e/eaeaea?text=${encodeURIComponent('Image Generation Failed')}`
    };
  }
};

export default {
  InvokeLLM,
  GenerateImage,
};
