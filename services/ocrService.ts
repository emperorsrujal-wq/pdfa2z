import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
    const envKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim() !== "" && !envKey.includes("PLACEHOLDER")) {
        return envKey.trim();
    }
    try {
        const localKey = localStorage.getItem('gemini_api_key');
        if (localKey && localKey.trim() !== "") return localKey.trim();
    } catch {}
    return "";
};

const getFreshAi = () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found.");
    return new GoogleGenAI({ apiKey });
};

/**
 * Performs professional-grade OCR using Gemini 1.5 Flash.
 * @param base64 Image data as a base64 string.
 * @param mimeType The mime type of the image (e.g., image/jpeg, image/png).
 * @returns The extracted text.
 */
export const performOCR = async (base64: string, mimeType: string): Promise<string> => {
    const ai = getFreshAi();
    const model = 'gemini-2.5-flash'; // Updated from deprecated gemini-3-flash-preview

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: "Extract all text from this image with high precision. " +
                            "Maintain the document's original structure, including paragraphs, tables (as markdown), and lists. " +
                            "Do not add any commentary or analysis; provide only the transcribed text."
                    }
                ]
            },
            config: {
                temperature: 0.1, // Low temperature for higher accuracy in extraction
            } as any
        });

        return response.text || "";
    } catch (err: any) {
        console.error("OCR Error:", err);
        throw new Error(err.message || "Failed to extract text from image.");
    }
};

/**
 * Performs OCR on multiple images (e.g. from PDF pages) and combines results.
 */
export const performOcrOnImages = async (base64Array: string[]): Promise<string> => {
    let combinedText = "";
    for (let i = 0; i < base64Array.length; i++) {
        const pageText = await performOCR(base64Array[i].split(',')[1], 'image/jpeg');
        combinedText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
    }
    return combinedText;
};
