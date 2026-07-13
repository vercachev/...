import type { AiDetectionResult } from "@/types";

export function buildAiDetectionPrompt(text: string): string {
  return `You are an expert AI-text detection analyst for an English teacher.
Analyze the following text for signs of AI generation (ChatGPT, Claude, Gemini, etc.).

Consider: vocabulary uniformity, overly polished structure, lack of personal voice, 
generic transitions, perfect grammar with no natural errors, repetitive sentence patterns,
and typical AI phrasing.

Text to analyze:
"""
${text}
"""

Respond ONLY with valid JSON matching this exact structure:
{
  "verdict": "likely_human" | "uncertain" | "likely_ai",
  "confidence": <number 0-100>,
  "summary": "<2-3 sentences in Russian for the teacher>",
  "signals": [
    { "label": "<short signal name>", "detail": "<explanation in Russian>" }
  ],
  "suspiciousFragments": [
    { "text": "<exact quote from text>", "reason": "<why suspicious, in Russian>" }
  ]
}

Be honest about uncertainty. Short texts (<50 words) should often be "uncertain".
Provide 3-5 signals. suspiciousFragments can be empty if none found.`;
}

export function normalizeAiResult(raw: AiDetectionResult): AiDetectionResult {
  const verdicts = ["likely_human", "uncertain", "likely_ai"] as const;
  const verdict = verdicts.includes(raw.verdict as (typeof verdicts)[number])
    ? (raw.verdict as AiDetectionResult["verdict"])
    : "uncertain";

  return {
    verdict,
    confidence: Math.min(100, Math.max(0, Number(raw.confidence) || 50)),
    summary: raw.summary || "Анализ завершён.",
    signals: Array.isArray(raw.signals) ? raw.signals.slice(0, 6) : [],
    suspiciousFragments: Array.isArray(raw.suspiciousFragments)
      ? raw.suspiciousFragments.slice(0, 5)
      : [],
  };
}
