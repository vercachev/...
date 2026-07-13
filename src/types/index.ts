export type Mode = "ai" | "translation" | "assessment";

export interface AiDetectionResult {
  verdict: "likely_human" | "uncertain" | "likely_ai";
  confidence: number;
  summary: string;
  signals: { label: string; detail: string }[];
  suspiciousFragments: { text: string; reason: string }[];
}

export interface TranslationCheckResult {
  verdict: "excellent" | "good" | "needs_work" | "poor";
  meaningAccuracy: number;
  grammarScore: number;
  naturalness: number;
  likelyMachineTranslation: boolean;
  summary: string;
  issues: { original: string; translation: string; problem: string; suggestion: string }[];
  improvedTranslation?: string;
}

export interface AssessmentResult {
  cefrLevel: string;
  levelDescription: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  errors: {
    type: "grammar" | "vocabulary" | "spelling" | "style" | "punctuation";
    original: string;
    correction: string;
    explanation: string;
  }[];
  correctedText: string;
  teacherNotes: string;
}

export interface ApiError {
  error: string;
}
