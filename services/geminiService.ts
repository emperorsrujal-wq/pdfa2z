
// @google/genai guidelines: Use GoogleGenAI from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types.ts";

const HARDCODED_API_KEY: string = "AIzaSyALQpm0gSZg9y-OWSSMh7ysJlWdqU9uDPY"; // Key added safely

/**
 * Retrieves the Gemini API key from various sources.
 */
const getApiKey = (): string => {
  // 0. Hardcoded key (highest priority if set)
  if (HARDCODED_API_KEY && HARDCODED_API_KEY.trim() !== "") {
    return HARDCODED_API_KEY.trim();
  }

  // 1. Try Vite env var (standard way)
  if ((import.meta as any).env.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }

  // 2. Try process.env.API_KEY (legacy/build injection)
  const envKey = process.env.API_KEY;
  if (envKey && envKey.trim() !== "") {
    return envKey.trim();
  }

  // 3. Try LocalStorage (user manually entered)
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey && localKey.trim() !== "") {
    return localKey.trim();
  }

  return "";
};

/**
 * Creates a fresh Gemini instance using the runtime key.
 * Per guidelines: Create instance right before use to ensure the latest key is used.
 */
const getFreshAi = () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found. Please select a key.");
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  highQuality: boolean
): Promise<string> => {
  // Use gemini-2.0-pro-exp-02-05 for high quality if available, or 2.0-flash for speed
  const model = highQuality ? 'gemini-2.0-pro-exp-02-05' : 'gemini-2.0-flash';

  const ai = getFreshAi();
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          ...(highQuality ? { imageSize: '2K' } : {}),
        }
      } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to generate image.");
  }

  throw new Error("No image data returned from API.");
};

export const editImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> => {
  const ai = getFreshAi();
  const model = 'gemini-2.0-flash';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to edit image.");
  }

  throw new Error("No edited image data returned.");
};

export const magicTransform = async (
  baseImage: string,
  baseMime: string,
  refImage: string | null,
  refMime: string | null,
  prompt: string,
  mode: 'GENERAL' | 'FACE_SWAP' | 'ID_EDIT' = 'GENERAL'
): Promise<string> => {
  const ai = getFreshAi();
  const model = 'gemini-2.0-flash'; // Use vision-optimized model

  let systemPrompt = "";

  if (mode === 'FACE_SWAP') {
    systemPrompt = `
      TASK: Face Swap.
      INPUT 1 (Base): Target image. 
      INPUT 2 (Ref): Source face provider.
      INSTRUCTIONS:
      1. Swap the face from the Reference image onto the person in the Base image.
      2. PRESERVE the Base image's lighting, skin tone match, shadows, grain, and resolution.
      3. Do NOT change the background, clothing, or other details of the Base image unless explicitly asked.
      4. Blend perfectly.
      USER PROMPT: ${prompt}
    `;
  } else if (mode === 'ID_EDIT') {
    systemPrompt = `
      TASK: ID / Document Editing.
      INPUT 1 (Base): Target Document/ID.
      INPUT 2 (Ref): Person Reference (Optional).
      INSTRUCTIONS:
      1. If a Reference image is provided, swap the ID photo with the Reference person's face. MATCH the ID photo's style (passport style, lighting, background color of the ID photo area).
      2. Edit the TEXT fields on the document as requested in the PROMPT.
      3. CRITICAL: Match the existing font, size, perspective, noise, and blur of the document. The text must look authentic.
      4. Do NOT hallucinate new fields. Only edit what is asked.
      USER PROMPT: ${prompt}
    `;
  } else {
    // General
    systemPrompt = `
      TASK: General Image Editing / Magic Transform.
      INPUT 1 (Base): Image to edit.
      INPUT 2 (Ref): Style/Content Reference (Optional).
      INSTRUCTIONS:
      1. Edit the Base image according to the User Prompt.
      2. If a Reference is provided, use it to guide the style, content, or transformation.
      3. If no Reference is provided, perform a generative edit based on the prompt alone.
      USER PROMPT: ${prompt}
    `;
  }

  const parts: any[] = [
    {
      inlineData: {
        data: baseImage,
        mimeType: baseMime
      }
    }
  ];

  if (refImage && refMime) {
    parts.push({
      inlineData: {
        data: refImage,
        mimeType: refMime
      }
    });
  }

  parts.push({ text: systemPrompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to transform image.");
  }

  throw new Error("No extracted image data returned.");
};

export const upscaleImage = async (
  base64Image: string,
  mimeType: string,
  targetSize: '2K' | '4K' = '2K'
): Promise<string> => {
  const ai = getFreshAi();
  const model = 'gemini-2.0-flash';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: "Upscale this image. Sharpen details while maintaining composition." }
        ]
      },
      config: {
        imageConfig: {
          imageSize: targetSize,
        }
      } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to upscale image.");
  }

  throw new Error("No upscaled image returned.");
};

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const ai = getFreshAi();
  const model = 'gemini-2.0-flash';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    // Per guidelines: access .text property directly, not as a method.
    return response.text || "";
  } catch (err: any) {
    throw new Error(err.message || "Failed to generate text.");
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = getFreshAi();
  const model = 'veo-2.0-flash-preview';

  try {
    let operation = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ name: (operation as any).name } as any);
    }

    if ((operation as any).error) {
      throw new Error((operation as any).error.message);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned.");

    // Fetch the video bytes
    const apiKey = getApiKey();
    const response = await fetch(`${downloadLink}${downloadLink.includes('?') ? '&' : '?'}key=${apiKey}`);
    if (!response.ok) throw new Error("Failed to download generated video.");

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (err: any) {
    throw new Error(err.message || "Failed to generate video.");
  }
};

export class PdfChatService {
  private chat: Chat | null = null;

  async startChat(pdfBase64: string, mimeType: string = 'application/pdf'): Promise<string> {
    const ai = getFreshAi();
    this.chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: "You are a professional PDF analyzer. Provide concise summaries and answer questions based on the document.",
      }
    });

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: [
          {
            inlineData: {
              data: pdfBase64,
              mimeType: mimeType
            }
          },
          { text: "Briefly summarize this document." }
        ]
      });

      return response.text || "Analyzed. What would you like to know?";
    } catch (err: any) {
      throw new Error(err.message || "Failed to start AI chat session.");
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session not initialized.");
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: text
      });
      return response.text || "";
    } catch (err: any) {
      throw new Error(err.message || "Failed to send message to AI.");
    }
  }
}

export class VideoChatService {
  private chat: Chat | null = null;

  async startChat(videoBase64: string, mimeType: string): Promise<string> {
    const ai = getFreshAi();
    // Using gemini-2.0-flash for multimodal tasks as recommended for general text/multimodal tasks
    const model = 'gemini-2.0-flash';

    this.chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are a video analysis expert. Watch the video and answer questions about its content, action, and visual details.",
      }
    });

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: [
          {
            inlineData: {
              data: videoBase64,
              mimeType: mimeType
            }
          },
          { text: "Watch this video and provide a brief summary of what happens." }
        ]
      });

      return response.text || "I've analyzed the video. What would you like to know?";
    } catch (err: any) {
      throw new Error(err.message || "Failed to analyze video.");
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session not initialized.");
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: text
      });
      return response.text || "";
    } catch (err: any) {
      throw new Error(err.message || "Failed to send message to AI.");
    }
  }
}