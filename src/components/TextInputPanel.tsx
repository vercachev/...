"use client";

import { useState } from "react";
import { WaveEffect } from "./WaveEffect";

const MAX_CHARS = 5000;

interface TextInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}

export function TextInputPanel({
  value,
  onChange,
  placeholder,
  rows = 8,
}: TextInputPanelProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full">
      <div className="glass-panel relative overflow-hidden rounded-3xl p-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={rows}
          className="glass-input w-full resize-none rounded-[1.35rem] px-5 py-4 text-[15px] leading-relaxed text-neutral-800 placeholder:text-neutral-400"
        />
        <div className="flex justify-end px-4 pb-2">
          <span className="text-xs text-neutral-400">
            {value.length} / {MAX_CHARS}
          </span>
        </div>
        <WaveEffect active={focused} />
      </div>
    </div>
  );
}

export { MAX_CHARS };
