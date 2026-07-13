import { NextRequest } from "next/server";
import { generateJson } from "@/lib/llm";
import { errorResponse, validateText } from "@/lib/api-utils";
import {
  buildTranslationPrompt,
  normalizeTranslationResult,
} from "@/lib/prompts/translation";
import type { TranslationCheckResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const originalError = validateText(body.original);
    if (originalError) return errorResponse(originalError, 400);
    const translationError = validateText(body.translation);
    if (translationError) return errorResponse(translationError, 400);

    const pair = body.pair === "ru-en" ? "ru-en" : "en-ru";
    const original = (body.original as string).trim();
    const translation = (body.translation as string).trim();

    const prompt = buildTranslationPrompt(original, translation, pair);
    const raw = await generateJson<TranslationCheckResult>(prompt);
    const result = normalizeTranslationResult(raw);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return errorResponse(message);
  }
}
