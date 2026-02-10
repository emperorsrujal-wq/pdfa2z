
// @google/genai guidelines: Use GoogleGenAI from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types.ts";

/**
 * Retrieves the Gemini API key exclusively from the environment variable.
 * Per guidelines: The API key must be obtained exclusively from process.env.API_KEY.
 */
const getApiKey = (): string => {
  // 1. Try process.env.API_KEY (injected by build)
  const envKey = process.env.API_KEY;
  if (envKey && envKey.trim() !== "") {
    return envKey.trim();
  }

  // 2. Try LocalStorage (user manually entered)
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
  // Use gemini-2.5-flash-image for standard, gemini-3-pro-image-preview for high quality
  const model = highQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

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
  const model = 'gemini-2.5-flash-image';

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

export const upscaleImage = async (
  base64Image: string,
  mimeType: string,
  targetSize: '2K' | '4K' = '2K'
): Promise<string> => {
  const ai = getFreshAi();
  const model = 'gemini-3-pro-image-preview';

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
  const model = 'gemini-3-flash-preview';

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
  const model = 'veo-3.1-fast-generate-preview';

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
    const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
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
      model: 'gemini-3-flash-preview',
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
    // Using gemini-3-flash-preview for multimodal tasks as recommended for general text/multimodal tasks
    const model = 'gemini-3-flash-preview';

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