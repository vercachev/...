import { GoogleGenerativeAI } from "@google/generative-ai";

const PRIMARY_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite"] as const;

let client: GoogleGenerativeAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (!client) client = new GoogleGenerativeAI(apiKey);
  return client;
}

function getModelList(): string[] {
  const primary = process.env.GEMINI_MODEL || PRIMARY_MODEL;
  return [...new Set([primary, ...FALLBACK_MODELS])];
}

function parseJsonResponse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse AI response");
    return JSON.parse(match[0]) as T;
  }
}

function isModelUnavailable(message: string): boolean {
  return (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("not supported")
  );
}

export function isGeminiRateLimit(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.includes("quota");
}

async function generateWithModel(modelName: string, prompt: string): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const models = getModelList();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const text = await generateWithModel(modelName, prompt);
      return parseJsonResponse<T>(text);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (isGeminiRateLimit(err)) throw err;
      if (isModelUnavailable(message)) continue;
      throw err;
    }
  }

  throw lastError;
}
