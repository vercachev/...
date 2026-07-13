import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it in Vercel environment variables."
    );
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse AI response");
    return JSON.parse(match[0]) as T;
  }
}
