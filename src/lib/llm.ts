import { generateJson as geminiGenerateJson, isGeminiRateLimit } from "@/lib/gemini";
import { generateJson as groqGenerateJson } from "@/lib/groq";

function hasGroq() {
  return Boolean(process.env.GROQ_API_KEY);
}

function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function toUserError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("429") || message.includes("quota") || message.includes("rate limit")) {
    return new Error(
      "Лимит Gemini исчерпан. Добавьте бесплатный ключ Groq (console.groq.com) в Vercel как GROQ_API_KEY — и всё заработает."
    );
  }

  if (message.includes("API key") || message.includes("API_KEY") || message.includes("not configured")) {
    return new Error(
      "Не настроен API-ключ. Добавьте GROQ_API_KEY или GEMINI_API_KEY в Vercel."
    );
  }

  if (message.includes("Failed to parse")) {
    return new Error("Не удалось разобрать ответ ИИ. Попробуйте ещё раз.");
  }

  return new Error("Ошибка анализа. Попробуйте ещё раз.");
}

export async function generateJson<T>(prompt: string): Promise<T> {
  if (!hasGroq() && !hasGemini()) {
    throw toUserError(new Error("No API keys configured"));
  }

  // Groq first — стабильнее на бесплатном тарифе
  if (hasGroq()) {
    try {
      return await groqGenerateJson<T>(prompt);
    } catch (err) {
      if (!hasGemini()) throw toUserError(err);
    }
  }

  try {
    return await geminiGenerateJson<T>(prompt);
  } catch (err) {
    if (hasGroq() && isGeminiRateLimit(err)) {
      return await groqGenerateJson<T>(prompt);
    }
    throw toUserError(err);
  }
}
