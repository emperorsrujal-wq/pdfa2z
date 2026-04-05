
// @google/genai guidelines: Use GoogleGenAI from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types.ts";

const HARDCODED_API_KEY: string = "AIzaSyALQpm0gSZg9y-OWSSMh7ysJlWdqU9uDPY";

/**
 * Retrieves the Gemini API key from various sources.
 */
const getApiKey = (): string => {
  if (HARDCODED_API_KEY && HARDCODED_API_KEY.trim() !== "") {
    return HARDCODED_API_KEY.trim();
  }
  if ((import.meta as any).env.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  try {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim() !== "") return localKey.trim();
  } catch {}
  return "";
};

const getFreshAi = () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found. Please configure a Gemini API key.");
  return new GoogleGenAI({ apiKey });
};

// ─── Current stable model names (April 2026) ────────────────────────────────
// gemini-2.5-flash  → fast, multimodal, vision, text generation
// gemini-2.5-pro    → highest quality, complex tasks

const FLASH_MODEL = 'gemini-2.5-flash';
const PRO_MODEL   = 'gemini-2.5-pro';

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  highQuality: boolean
): Promise<string> => {
  const model = highQuality ? PRO_MODEL : FLASH_MODEL;
  const ai = getFreshAi();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `Generate an image: ${prompt}` }]
      },
      config: {
        responseModalities: ['image', 'text'],
      } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          return `data:image/png;base64,${(part as any).inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to generate image.");
  }

  throw new Error("No image data returned from API. The model may not support image generation for this prompt.");
};

// ─── IMAGE EDITING ───────────────────────────────────────────────────────────
export const editImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> => {
  const ai = getFreshAi();

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseModalities: ['image', 'text'],
      } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          return `data:image/png;base64,${(part as any).inlineData.data}`;
        }
      }
    }
    // If no image returned, return original
    return `data:${mimeType};base64,${base64Image}`;
  } catch (err: any) {
    throw new Error(err.message || "Failed to edit image.");
  }
};

// ─── MAGIC TRANSFORM ─────────────────────────────────────────────────────────
export const magicTransform = async (
  baseImage: string,
  baseMime: string,
  refImage: string | null,
  refMime: string | null,
  prompt: string,
  mode: 'GENERAL' | 'FACE_SWAP' | 'ID_EDIT' = 'GENERAL'
): Promise<string> => {
  const ai = getFreshAi();

  let systemPrompt = `You are an expert image editor. Edit the provided image as instructed. Return ONLY the edited image.\n\nUSER INSTRUCTION: ${prompt}`;

  if (mode === 'FACE_SWAP') {
    systemPrompt = `TASK: Face swap. Swap the face from the second reference image onto the person in the first base image. Preserve lighting, skin tone, shadows. USER PROMPT: ${prompt}`;
  } else if (mode === 'ID_EDIT') {
    systemPrompt = `TASK: Document editing. Edit the text fields on the provided document as requested. Match the existing font, size, and style. USER PROMPT: ${prompt}`;
  }

  const parts: any[] = [
    { inlineData: { data: baseImage, mimeType: baseMime } }
  ];

  if (refImage && refMime) {
    parts.push({ inlineData: { data: refImage, mimeType: refMime } });
  }

  parts.push({ text: systemPrompt });

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: { parts },
      config: { responseModalities: ['image', 'text'] } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          return `data:image/png;base64,${(part as any).inlineData.data}`;
        }
      }
    }
    return `data:${baseMime};base64,${baseImage}`;
  } catch (err: any) {
    throw new Error(err.message || "Failed to transform image.");
  }
};

// ─── IMAGE UPSCALE ───────────────────────────────────────────────────────────
export const upscaleImage = async (
  base64Image: string,
  mimeType: string,
  targetSize: '2K' | '4K' = '2K'
): Promise<string> => {
  const ai = getFreshAi();

  // Gemini doesn't natively upscale — we use it to enhance details descriptively
  // and return the original if no image part is returned
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `Enhance and sharpen this image. Improve details, reduce noise, and maximize clarity as if upscaling to ${targetSize}. Return the enhanced image.` }
        ]
      },
      config: { responseModalities: ['image', 'text'] } as any
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          return `data:image/png;base64,${(part as any).inlineData.data}`;
        }
      }
    }
    return `data:${mimeType};base64,${base64Image}`;
  } catch (err: any) {
    throw new Error(err.message || "Failed to upscale image.");
  }
};

// ─── TEXT GENERATION ─────────────────────────────────────────────────────────
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const ai = getFreshAi();

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    return response.text || "";
  } catch (err: any) {
    throw new Error(err.message || "Failed to generate text.");
  }
};

// ─── VIDEO GENERATION ────────────────────────────────────────────────────────
export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = getFreshAi();

  // veo-2.0-generate-001 is the current stable video generation model
  const model = 'veo-2.0-generate-001';

  try {
    let operation = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: 8,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion (max 3 minutes)
    let attempts = 0;
    while (!operation.done && attempts < 36) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ name: (operation as any).name } as any);
      attempts++;
    }

    if ((operation as any).error) {
      throw new Error((operation as any).error.message);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned from API.");

    const apiKey = getApiKey();
    const sep = videoUri.includes('?') ? '&' : '?';
    const response = await fetch(`${videoUri}${sep}key=${apiKey}`);
    if (!response.ok) throw new Error("Failed to download generated video.");

    return URL.createObjectURL(await response.blob());
  } catch (err: any) {
    throw new Error(err.message || "Failed to generate video.");
  }
};

// ─── PDF CHAT SERVICE ────────────────────────────────────────────────────────
export class PdfChatService {
  private chat: Chat | null = null;

  async startChat(pdfBase64: string, mimeType: string = 'application/pdf'): Promise<string> {
    const ai = getFreshAi();
    this.chat = ai.chats.create({
      model: FLASH_MODEL,
      config: {
        systemInstruction: "You are a professional PDF document analyzer. Provide concise, accurate summaries and answer questions based solely on the document's content. Be helpful, clear and precise.",
      }
    });

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: [
          { inlineData: { data: pdfBase64, mimeType } },
          { text: "Please analyze this document and provide a brief summary of its main content, key topics, and any important information." }
        ]
      });

      return response.text || "Document analyzed. What would you like to know?";
    } catch (err: any) {
      throw new Error(err.message || "Failed to start AI chat session.");
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session not initialized. Please upload a document first.");
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message: text });
      return response.text || "";
    } catch (err: any) {
      throw new Error(err.message || "Failed to send message to AI.");
    }
  }
}

// ─── VIDEO CHAT SERVICE ───────────────────────────────────────────────────────
export class VideoChatService {
  private chat: Chat | null = null;

  async startChat(videoBase64: string, mimeType: string): Promise<string> {
    const ai = getFreshAi();
    this.chat = ai.chats.create({
      model: FLASH_MODEL,
      config: {
        systemInstruction: "You are a video analysis expert. Analyze the video content and answer questions about what happens in it, including actions, objects, people, text, and scenes.",
      }
    });

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({
        message: [
          { inlineData: { data: videoBase64, mimeType } },
          { text: "Watch this video and provide a brief summary of what happens, including key scenes, people, actions, and any text visible." }
        ]
      });

      return response.text || "Video analyzed. What would you like to know?";
    } catch (err: any) {
      throw new Error(err.message || "Failed to analyze video.");
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session not initialized.");
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message: text });
      return response.text || "";
    } catch (err: any) {
      throw new Error(err.message || "Failed to send message to AI.");
    }
  }
}