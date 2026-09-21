import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askAI(message) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
    });

    return response.text;
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    // Gemini temporarily unavailable
    if (error.status === 503) {
      return "Gemini AI is temporarily busy. Please try again in a few seconds. 🤖";
    }

    // Rate limit
    if (error.status === 429) {
      return "Gemini free limit has been reached temporarily. Please try again later. ⏳";
    }

    // Authentication/API key error
    if (error.status === 401 || error.status === 403) {
      return "Gemini API key is invalid or not configured correctly. Please check your .env.local file.";
    }

    return "Sorry, I couldn't process your request right now.";
  }
}