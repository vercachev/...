import { GoogleGenerativeAI } from "@google/generative-ai";

// Ordered by free-tier friendliness; 1.5-flash is deprecated (404 on v1beta)
const DEFAULT_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

let client: GoogleGenerativeAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY не настроен. Добавьте ключ в переменные окружения Vercel."
    );
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

function getModelList(): string[] {
  if (process.env.GEMINI_MODEL) {
    return [process.env.GEMINI_MODEL, ...DEFAULT_MODELS];
  }
  return [...DEFAULT_MODELS];
}

function getModel(modelName: string) {
  return getClient().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });
}

function parseRetrySeconds(message: string): number | null {
  const match = message.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1])) : null;
}

function isRateLimit(message: string): boolean {
  return message.includes("429") || message.includes("quota");
}

function isModelUnavailable(message: string): boolean {
  return (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("not supported")
  );
}

function toUserError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);

  if (isRateLimit(message)) {
    const seconds = parseRetrySeconds(message);
    const wait = seconds ? ` Подождите ~${seconds} сек.` : " Подождите минуту.";
    return new Error(
      `Лимит бесплатного API Gemini исчерпан.${wait} Попробуйте снова чуть позже.`
    );
  }

  if (message.includes("API key") || message.includes("API_KEY")) {
    return new Error("Неверный или отсутствующий API-ключ Gemini.");
  }

  if (message.includes("Failed to parse")) {
    return new Error("Не удалось разобрать ответ ИИ. Попробуйте ещё раз.");
  }

  return new Error("Ошибка анализа. Попробуйте ещё раз через минуту.");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithModel(modelName: string, prompt: string): Promise<string> {
  const model = getModel(modelName);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const models = [...new Set(getModelList())];
  let lastError: unknown;

  for (const modelName of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await generateWithModel(modelName, prompt);
        return parseJsonResponse<T>(text);
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);

        if (isModelUnavailable(message)) break;

        if (isRateLimit(message) && attempt === 0) {
          const seconds = parseRetrySeconds(message) ?? 5;
          await sleep(Math.min(seconds * 1000, 15000));
          continue;
        }

        if (isRateLimit(message)) break;
        break;
      }
    }
  }

  throw toUserError(lastError);
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
