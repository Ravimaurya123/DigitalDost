import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askAI(message) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured in .env.local."
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
    });

    const text = response?.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return text;
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    const errorMessage =
      error?.message?.toLowerCase() || "";

    /*
    ==========================================
    QUOTA / RATE LIMIT
    ==========================================
    */

    if (
      error?.status === 429 ||
      errorMessage.includes("quota") ||
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("rate limit")
    ) {
      throw new Error(
        "Gemini API quota exceeded. Please try again after the quota resets."
      );
    }

    /*
    ==========================================
    INVALID API KEY
    ==========================================
    */

    if (
      error?.status === 401 ||
      error?.status === 403
    ) {
      throw new Error(
        "Gemini API key is invalid or does not have permission."
      );
    }

    /*
    ==========================================
    MODEL NOT FOUND
    ==========================================
    */

    if (error?.status === 404) {
      throw new Error(
        "The selected Gemini model is not available."
      );
    }

    /*
    ==========================================
    GEMINI TEMPORARILY BUSY
    ==========================================
    */

    if (error?.status === 503) {
      throw new Error(
        "Gemini AI is temporarily busy. Please try again in a few seconds."
      );
    }

    /*
    ==========================================
    OTHER GEMINI ERROR
    ==========================================
    */

    throw new Error(
      "Gemini AI could not process your request right now."
    );
  }
}