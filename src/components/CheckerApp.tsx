"use client";

import { useState } from "react";
import Image from "next/image";
import type { Mode } from "@/types";
import type {
  AiDetectionResult,
  AssessmentResult,
  TranslationCheckResult,
} from "@/types";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { TextInputPanel } from "@/components/TextInputPanel";
import { TranslationInput } from "@/components/TranslationInput";
import { ResultsPanel, formatResultForCopy } from "@/components/ResultsPanel";

type AnyResult = AiDetectionResult | TranslationCheckResult | AssessmentResult;

const PLACEHOLDERS: Record<Mode, string> = {
  ai: "Вставьте текст ученика для проверки на ИИ...",
  assessment: "Вставьте английский текст для оценки уровня и ошибок...",
  translation: "",
};

export function CheckerApp() {
  const [mode, setMode] = useState<Mode>("assessment");
  const [text, setText] = useState("");
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [pair, setPair] = useState<"en-ru" | "ru-en">("en-ru");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnyResult | null>(null);

  const canSubmit =
    mode === "translation"
      ? original.trim().length > 0 && translation.trim().length > 0
      : text.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let endpoint = "/api/assess-text";
      let body: Record<string, string> = { text: text.trim() };

      if (mode === "ai") {
        endpoint = "/api/detect-ai";
        body = { text: text.trim() };
      } else if (mode === "translation") {
        endpoint = "/api/check-translation";
        body = {
          original: original.trim(),
          translation: translation.trim(),
          pair,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка анализа");

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(formatResultForCopy(result, mode));
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setError(null);
    setResult(null);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center px-4 py-12 md:py-16">
        <header className="mb-10 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Prism"
            width={72}
            height={72}
            className="mb-4 rounded-2xl shadow-sm"
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800 md:text-3xl">
            Prism
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Проверка текстов, переводов и уровня английского
          </p>
        </header>

        <div className="mb-6 w-full">
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
        </div>

        <div className="mb-6 w-full">
          {mode === "translation" ? (
            <TranslationInput
              original={original}
              translation={translation}
              onOriginalChange={setOriginal}
              onTranslationChange={setTranslation}
              pair={pair}
              onPairChange={setPair}
            />
          ) : (
            <TextInputPanel
              value={text}
              onChange={setText}
              placeholder={PLACEHOLDERS[mode]}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`
            mb-8 w-full max-w-xs rounded-full py-3 text-sm font-semibold transition-all duration-300
            ${
              canSubmit && !loading
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:shadow-indigo-300/50"
                : "cursor-not-allowed bg-neutral-200 text-neutral-400"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Анализируем...
            </span>
          ) : (
            "Проверить"
          )}
        </button>

        {error && (
          <div className="mb-6 w-full rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-center text-sm text-rose-700">
            {error}
          </div>
        )}

        <ResultsPanel result={result} mode={mode} onCopy={handleCopy} />

        <footer className="mt-auto pt-12 text-center text-xs text-neutral-400">
          Тексты отправляются на анализ и не сохраняются на сервере
        </footer>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
