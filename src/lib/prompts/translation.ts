import type { TranslationCheckResult } from "@/types";

export function buildTranslationPrompt(
  original: string,
  translation: string,
  pair: "en-ru" | "ru-en"
): string {
  const [sourceLang, targetLang] = pair === "en-ru" ? ["English", "Russian"] : ["Russian", "English"];

  return `You are an expert translation evaluator for an English teacher.
Evaluate a student's translation from ${sourceLang} to ${targetLang}.

Original (${sourceLang}):
"""
${original}
"""

Student's translation (${targetLang}):
"""
${translation}
"""

Check: meaning accuracy, grammar, naturalness, calques/word-for-word errors,
and whether it looks like machine translation (Google Translate, DeepL, ChatGPT).

Respond ONLY with valid JSON:
{
  "verdict": "excellent" | "good" | "needs_work" | "poor",
  "meaningAccuracy": <0-100>,
  "grammarScore": <0-100>,
  "naturalness": <0-100>,
  "likelyMachineTranslation": <boolean>,
  "summary": "<2-4 sentences in Russian for the teacher>",
  "issues": [
    {
      "original": "<phrase from original>",
      "translation": "<student's translation of it>",
      "problem": "<what's wrong, in Russian>",
      "suggestion": "<better translation, in Russian>"
    }
  ],
  "improvedTranslation": "<full improved translation in ${targetLang}, or empty string if excellent>"
}

Provide 0-8 issues. Be constructive. summary and problem fields in Russian.`;
}

export function normalizeTranslationResult(
  raw: TranslationCheckResult
): TranslationCheckResult {
  const verdicts = ["excellent", "good", "needs_work", "poor"] as const;
  const verdict = verdicts.includes(raw.verdict as (typeof verdicts)[number])
    ? (raw.verdict as TranslationCheckResult["verdict"])
    : "needs_work";

  return {
    verdict,
    meaningAccuracy: clamp(raw.meaningAccuracy),
    grammarScore: clamp(raw.grammarScore),
    naturalness: clamp(raw.naturalness),
    likelyMachineTranslation: Boolean(raw.likelyMachineTranslation),
    summary: raw.summary || "Проверка перевода завершена.",
    issues: Array.isArray(raw.issues) ? raw.issues.slice(0, 8) : [],
    improvedTranslation: raw.improvedTranslation || undefined,
  };
}

function clamp(n: unknown): number {
  return Math.min(100, Math.max(0, Number(n) || 0));
}
