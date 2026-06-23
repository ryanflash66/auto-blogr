// Core.js - Platform integrations (Mock implementations for local development)

// Mock AI text generation function
export const InvokeLLM = async (prompt, options = {}) => {
  console.warn(
    "InvokeLLM: Mock implementation - replace with actual OpenAI integration"
  );

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  return {
    content: `Mock AI response for prompt: "${prompt.substring(
      0,
      50
    )}..."\n\nThis is a generated response that would normally come from OpenAI's GPT models. The response would be much more detailed and contextually relevant in a real implementation.`,
    usage: {
      tokens: Math.floor(100 + Math.random() * 200),
      cost: 0.002,
    },
    model: "gpt-4-mock",
  };
};

// Mock AI image generation function
export const GenerateImage = async (prompt, options = {}) => {
  console.warn(
    "GenerateImage: Mock implementation - replace with actual DALL·E integration"
  );

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  const imagePrompt = encodeURIComponent(prompt.substring(0, 20));
  return {
    url: `https://via.placeholder.com/800x400/059669/ffffff?text=${imagePrompt}`,
    filename: `generated-${Date.now()}.png`,
    width: 800,
    height: 400,
    prompt: prompt,
  };
};

// Mock file upload function
export const UploadFile = async (file) => {
  console.warn(
    "UploadFile: Mock implementation - replace with actual file storage"
  );

  // Simulate upload delay
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1000)
  );

  return {
    url: URL.createObjectURL(file),
    filename: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
};

// Mock email sending function
export const SendEmail = async (to, subject, content, options = {}) => {
  console.warn(
    "SendEmail: Mock implementation - replace with actual email service"
  );
  console.log(`Email would be sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content preview: ${content.substring(0, 100)}...`);

  // Simulate sending delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
};

// Mock file data extraction
export const ExtractDataFromUploadedFile = async (file) => {
  console.warn("ExtractDataFromUploadedFile: Mock implementation");

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const text = file.type.includes("text")
    ? `Extracted text content from ${file.name}...`
    : `Binary file content from ${file.name}`;

  return {
    text,
    metadata: {
      filename: file.name,
      size: file.size,
      type: file.type,
      extractedAt: new Date().toISOString(),
    },
  };
};
