/**
 * OpenRouter API Integration
 * Provides LLM and image generation capabilities
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Default models - can be overridden
const DEFAULT_TEXT_MODEL = 'anthropic/claude-3.5-sonnet'; // or 'openai/gpt-4o'
const DEFAULT_IMAGE_MODEL = 'openai/dall-e-3';

/**
 * Invoke LLM for text generation
 * @param {Object} options
 * @param {string} options.prompt - The prompt to send to the LLM
 * @param {Object} [options.response_json_schema] - Optional JSON schema for structured output
 * @param {string} [options.model] - Override the default model
 * @param {number} [options.max_tokens] - Max tokens to generate
 * @returns {Promise<string|Object>} - The generated text or parsed JSON
 */
export const InvokeLLM = async ({ 
  prompt, 
  response_json_schema, 
  model = DEFAULT_TEXT_MODEL,
  max_tokens = 4096 
}) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY in your .env file.');
  }

  const messages = [{ role: 'user', content: prompt }];
  
  // If JSON schema is provided, add instruction to return JSON
  if (response_json_schema) {
    messages[0].content = `${prompt}\n\nIMPORTANT: You must respond with valid JSON that matches this schema:\n${JSON.stringify(response_json_schema, null, 2)}\n\nRespond ONLY with the JSON object, no additional text or markdown formatting.`;
  }

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
      throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // If JSON schema was provided, parse the response
    if (response_json_schema) {
      try {
        // Try to extract JSON from the response (in case there's markdown formatting)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.log('Raw content:', content);
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
 * Generate an image using OpenRouter's image generation API
 * @param {Object} options
 * @param {string} options.prompt - The image generation prompt
 * @param {string} [options.model] - Override the default image model
 * @param {string} [options.size] - Image size (e.g., '1024x1024')
 * @returns {Promise<{url: string}>} - Object containing the image URL
 */
export const GenerateImage = async ({ 
  prompt, 
  model = DEFAULT_IMAGE_MODEL,
  size = '1792x1024' 
}) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY in your .env file.');
  }

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
    throw error;
  }
};

/**
 * Generate image using chat completion with vision model (fallback)
 * Some models don't support the images endpoint directly
 */
export const GenerateImageViaChat = async ({ prompt }) => {
  // For models that don't have direct image generation,
  // we can use a placeholder or external service
  // This is a fallback that returns a placeholder
  console.warn('Using placeholder image. Configure a proper image generation model.');
  
  return {
    url: `https://placehold.co/1792x1024/1a1a2e/eaeaea?text=${encodeURIComponent(prompt.substring(0, 30))}...`
  };
};

export default {
  InvokeLLM,
  GenerateImage,
};
