"use client";

import { useState } from "react";
import { WaveEffect } from "./WaveEffect";

const MAX_CHARS = 5000;

interface TranslationInputProps {
  original: string;
  translation: string;
  onOriginalChange: (v: string) => void;
  onTranslationChange: (v: string) => void;
  pair: "en-ru" | "ru-en";
  onPairChange: (pair: "en-ru" | "ru-en") => void;
}

export function TranslationInput({
  original,
  translation,
  onOriginalChange,
  onTranslationChange,
  pair,
  onPairChange,
}: TranslationInputProps) {
  const [focusedCol, setFocusedCol] = useState<"original" | "translation" | null>(
    null
  );

  const [origLabel, transLabel] =
    pair === "en-ru" ? ["Оригинал (EN)", "Перевод (RU)"] : ["Оригинал (RU)", "Перевод (EN)"];

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-center gap-2">
        {(["en-ru", "ru-en"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPairChange(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              pair === p
                ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {p === "en-ru" ? "EN → RU" : "RU → EN"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Column
          label={origLabel}
          value={original}
          onChange={onOriginalChange}
          placeholder="Вставьте оригинальный текст..."
          focused={focusedCol === "original"}
          onFocus={() => setFocusedCol("original")}
          onBlur={() => setFocusedCol(null)}
        />
        <Column
          label={transLabel}
          value={translation}
          onChange={onTranslationChange}
          placeholder="Вставьте перевод ученика..."
          focused={focusedCol === "translation"}
          onFocus={() => setFocusedCol("translation")}
          onBlur={() => setFocusedCol(null)}
        />
      </div>
    </div>
  );
}

function Column({
  label,
  value,
  onChange,
  placeholder,
  focused,
  onFocus,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative">
      <p className="mb-2 text-center text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </p>
      <div className="glass-panel relative overflow-hidden rounded-3xl p-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={10}
          className="glass-input w-full resize-none rounded-[1.35rem] px-4 py-3 text-[15px] leading-relaxed text-neutral-800 placeholder:text-neutral-400"
        />
        <div className="flex justify-end px-3 pb-2">
          <span className="text-xs text-neutral-400">
            {value.length} / {MAX_CHARS}
          </span>
        </div>
        <WaveEffect active={focused} />
      </div>
    </div>
  );
}
