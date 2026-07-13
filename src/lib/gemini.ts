import { GoogleGenerativeAI } from "@google/generative-ai";

// Primary model for free tier; fallbacks only when model is unavailable (404), NOT on quota errors
const PRIMARY_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite"] as const;

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
  const primary = process.env.GEMINI_MODEL || PRIMARY_MODEL;
  return [...new Set([primary, ...FALLBACK_MODELS])];
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
      `Слишком много запросов к Gemini (лимит бесплатного тарифа).${wait} Лимит привязан к API-ключу, а не к сайту.`
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

async function generateWithRetry(modelName: string, prompt: string): Promise<string> {
  try {
    return await generateWithModel(modelName, prompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // One retry after rate-limit cooldown — same model only
    if (isRateLimit(message)) {
      const seconds = parseRetrySeconds(message) ?? 10;
      await sleep(Math.min(seconds * 1000, 20000));
      return await generateWithModel(modelName, prompt);
    }

    throw err;
  }
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const models = getModelList();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const text = await generateWithRetry(modelName, prompt);
      return parseJsonResponse<T>(text);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);

      // Quota is per API key — trying other models only makes it worse
      if (isRateLimit(message)) {
        throw toUserError(err);
      }

      // Model deprecated / missing — try next
      if (isModelUnavailable(message)) {
        continue;
      }

      throw toUserError(err);
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
