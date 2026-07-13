import type { AssessmentResult } from "@/types";

export function buildAssessmentPrompt(text: string): string {
  return `You are an expert English teacher and CEFR assessor.
Evaluate the following English text written by a student.

Text:
"""
${text}
"""

Assess CEFR level (A1, A2, B1, B2, C1, C2), find errors, and provide constructive feedback.

Respond ONLY with valid JSON:
{
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "levelDescription": "<1 sentence describing this level in Russian>",
  "overallScore": <0-100>,
  "summary": "<2-3 sentences overall feedback in Russian>",
  "strengths": ["<strength in Russian>", ...],
  "weaknesses": ["<weakness in Russian>", ...],
  "errors": [
    {
      "type": "grammar" | "vocabulary" | "spelling" | "style" | "punctuation",
      "original": "<incorrect phrase>",
      "correction": "<corrected phrase>",
      "explanation": "<brief explanation in Russian>"
    }
  ],
  "correctedText": "<full text with all corrections applied>",
  "teacherNotes": "<practical advice for the teacher in Russian, 2-3 sentences>"
}

Provide 0-12 errors. strengths and weaknesses: 2-4 items each.
All feedback fields (summary, strengths, weaknesses, explanation, teacherNotes) in Russian.`;
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ERROR_TYPES = ["grammar", "vocabulary", "spelling", "style", "punctuation"] as const;

export function normalizeAssessmentResult(
  raw: AssessmentResult,
  originalText: string
): AssessmentResult {
  const level = CEFR_LEVELS.includes(raw.cefrLevel as (typeof CEFR_LEVELS)[number])
    ? raw.cefrLevel
    : "B1";

  return {
    cefrLevel: level,
    levelDescription: raw.levelDescription || "",
    overallScore: Math.min(100, Math.max(0, Number(raw.overallScore) || 50)),
    summary: raw.summary || "Оценка завершена.",
    strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 5) : [],
    weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses.slice(0, 5) : [],
    errors: Array.isArray(raw.errors)
      ? raw.errors.slice(0, 12).map((e) => ({
          type: ERROR_TYPES.includes(e.type as (typeof ERROR_TYPES)[number])
            ? e.type
            : "grammar",
          original: e.original || "",
          correction: e.correction || "",
          explanation: e.explanation || "",
        }))
      : [],
    correctedText: raw.correctedText || originalText,
    teacherNotes: raw.teacherNotes || "",
  };
}
