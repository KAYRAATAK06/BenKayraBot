
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiAI = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const CHAT_MODEL = 'gemini-3-flash-preview';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getGeminiAI();
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Görsel oluşturulamadı.");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
