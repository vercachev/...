import { NextRequest } from "next/server";
import { generateJson } from "@/lib/gemini";
import { errorResponse, validateText } from "@/lib/api-utils";
import {
  buildAiDetectionPrompt,
  normalizeAiResult,
} from "@/lib/prompts/ai-detection";
import type { AiDetectionResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const textError = validateText(body.text);
    if (textError) return errorResponse(textError, 400);

    const text = (body.text as string).trim();
    const prompt = buildAiDetectionPrompt(text);
    const raw = await generateJson<AiDetectionResult>(prompt);
    const result = normalizeAiResult(raw);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return errorResponse(message);
  }
}
