"use client";

import type {
  AiDetectionResult,
  AssessmentResult,
  TranslationCheckResult,
} from "@/types";

type Result = AiDetectionResult | TranslationCheckResult | AssessmentResult;

interface ResultsPanelProps {
  result: Result | null;
  mode: "ai" | "translation" | "assessment";
  onCopy: () => void;
}

export function ResultsPanel({ result, mode, onCopy }: ResultsPanelProps) {
  if (!result) return null;

  return (
    <div className="glass-panel w-full animate-in fade-in rounded-3xl p-6 duration-500">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">Результат</h2>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-white"
        >
          Скопировать отчёт
        </button>
      </div>

      {mode === "ai" && <AiResults data={result as AiDetectionResult} />}
      {mode === "translation" && (
        <TranslationResults data={result as TranslationCheckResult} />
      )}
      {mode === "assessment" && (
        <AssessmentResults data={result as AssessmentResult} />
      )}
    </div>
  );
}

function AiResults({ data }: { data: AiDetectionResult }) {
  const verdictMap = {
    likely_human: { label: "Скорее человек", color: "text-emerald-600 bg-emerald-50" },
    uncertain: { label: "Неясно", color: "text-amber-600 bg-amber-50" },
    likely_ai: { label: "Скорее ИИ", color: "text-rose-600 bg-rose-50" },
  };
  const v = verdictMap[data.verdict];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${v.color}`}>
          {v.label}
        </span>
        <span className="text-sm text-neutral-500">Уверенность: {data.confidence}%</span>
      </div>
      <p className="text-[15px] leading-relaxed text-neutral-700">{data.summary}</p>

      {data.signals.length > 0 && (
        <Section title="Признаки">
          <ul className="space-y-2">
            {data.signals.map((s, i) => (
              <li key={i} className="rounded-xl bg-white/50 px-3 py-2 text-sm">
                <span className="font-medium text-neutral-800">{s.label}</span>
                <span className="text-neutral-600"> — {s.detail}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.suspiciousFragments.length > 0 && (
        <Section title="Подозрительные фрагменты">
          <ul className="space-y-2">
            {data.suspiciousFragments.map((f, i) => (
              <li key={i} className="rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-sm">
                <p className="italic text-neutral-700">&ldquo;{f.text}&rdquo;</p>
                <p className="mt-1 text-neutral-500">{f.reason}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function TranslationResults({ data }: { data: TranslationCheckResult }) {
  const verdictMap = {
    excellent: { label: "Отлично", color: "text-emerald-600 bg-emerald-50" },
    good: { label: "Хорошо", color: "text-blue-600 bg-blue-50" },
    needs_work: { label: "Нужна доработка", color: "text-amber-600 bg-amber-50" },
    poor: { label: "Слабо", color: "text-rose-600 bg-rose-50" },
  };
  const v = verdictMap[data.verdict];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${v.color}`}>
          {v.label}
        </span>
        {data.likelyMachineTranslation && (
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
            Похоже на машинный перевод
          </span>
        )}
      </div>
      <p className="text-[15px] leading-relaxed text-neutral-700">{data.summary}</p>

      <div className="grid grid-cols-3 gap-3">
        <Score label="Смысл" value={data.meaningAccuracy} />
        <Score label="Грамматика" value={data.grammarScore} />
        <Score label="Естественность" value={data.naturalness} />
      </div>

      {data.issues.length > 0 && (
        <Section title="Замечания">
          <ul className="space-y-3">
            {data.issues.map((issue, i) => (
              <li key={i} className="rounded-xl bg-white/50 px-3 py-2 text-sm">
                <p className="text-neutral-500">
                  <span className="text-neutral-400">Оригинал:</span> {issue.original}
                </p>
                <p className="text-neutral-500">
                  <span className="text-neutral-400">Перевод:</span> {issue.translation}
                </p>
                <p className="mt-1 text-neutral-700">{issue.problem}</p>
                <p className="mt-1 text-emerald-700">→ {issue.suggestion}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.improvedTranslation && (
        <Section title="Улучшенный вариант">
          <p className="rounded-xl bg-emerald-50/60 px-3 py-2 text-sm leading-relaxed text-neutral-700">
            {data.improvedTranslation}
          </p>
        </Section>
      )}
    </div>
  );
}

function AssessmentResults({ data }: { data: AssessmentResult }) {
  const levelColors: Record<string, string> = {
    A1: "bg-neutral-100 text-neutral-600",
    A2: "bg-sky-50 text-sky-600",
    B1: "bg-blue-50 text-blue-600",
    B2: "bg-indigo-50 text-indigo-600",
    C1: "bg-violet-50 text-violet-600",
    C2: "bg-purple-50 text-purple-600",
  };

  const errorTypeLabels: Record<string, string> = {
    grammar: "Грамматика",
    vocabulary: "Лексика",
    spelling: "Орфография",
    style: "Стиль",
    punctuation: "Пунктуация",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-4 py-1.5 text-lg font-bold ${levelColors[data.cefrLevel] || levelColors.B1}`}
        >
          {data.cefrLevel}
        </span>
        <span className="text-sm text-neutral-500">Балл: {data.overallScore}/100</span>
      </div>
      {data.levelDescription && (
        <p className="text-sm text-neutral-500">{data.levelDescription}</p>
      )}
      <p className="text-[15px] leading-relaxed text-neutral-700">{data.summary}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {data.strengths.length > 0 && (
          <Section title="Сильные стороны">
            <ul className="list-inside list-disc space-y-1 text-sm text-emerald-700">
              {data.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Section>
        )}
        {data.weaknesses.length > 0 && (
          <Section title="Слабые стороны">
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-700">
              {data.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {data.errors.length > 0 && (
        <Section title="Ошибки">
          <ul className="space-y-2">
            {data.errors.map((e, i) => (
              <li key={i} className="rounded-xl bg-white/50 px-3 py-2 text-sm">
                <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                  {errorTypeLabels[e.type] || e.type}
                </span>
                <span className="line-through text-rose-600/80">{e.original}</span>
                <span className="mx-1 text-neutral-300">→</span>
                <span className="font-medium text-emerald-700">{e.correction}</span>
                <p className="mt-1 text-neutral-500">{e.explanation}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.correctedText && (
        <Section title="Исправленный текст">
          <p className="rounded-xl bg-white/60 px-3 py-2 text-sm leading-relaxed text-neutral-700">
            {data.correctedText}
          </p>
        </Section>
      )}

      {data.teacherNotes && (
        <Section title="Заметки для учителя">
          <p className="text-sm leading-relaxed text-neutral-600">{data.teacherNotes}</p>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/50 px-3 py-2 text-center">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-lg font-semibold text-neutral-800">{value}%</p>
    </div>
  );
}

export function formatResultForCopy(
  result: Result,
  mode: "ai" | "translation" | "assessment"
): string {
  return JSON.stringify({ mode, result, generatedAt: new Date().toISOString() }, null, 2);
}
