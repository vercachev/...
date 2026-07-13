import { NextRequest } from "next/server";
import { generateJson } from "@/lib/gemini";
import { errorResponse, validateText } from "@/lib/api-utils";
import {
  buildAssessmentPrompt,
  normalizeAssessmentResult,
} from "@/lib/prompts/assessment";
import type { AssessmentResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const textError = validateText(body.text);
    if (textError) return errorResponse(textError, 400);

    const text = (body.text as string).trim();
    const prompt = buildAssessmentPrompt(text);
    const raw = await generateJson<AssessmentResult>(prompt);
    const result = normalizeAssessmentResult(raw, text);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return errorResponse(message);
  }
}
