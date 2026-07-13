"use client";

import type { Mode } from "@/types";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ai", label: "ИИ-детектор", hint: "Проверка на генерацию ИИ" },
  { id: "translation", label: "Перевод", hint: "Оригинал ↔ перевод" },
  { id: "assessment", label: "Оценка", hint: "Уровень CEFR и ошибки" },
];

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            title={m.hint}
            className={`
              relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300
              ${
                active
                  ? "bg-white/80 text-indigo-600 shadow-sm ring-1 ring-indigo-100"
                  : "text-neutral-500 hover:bg-white/50 hover:text-neutral-700"
              }
            `}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
