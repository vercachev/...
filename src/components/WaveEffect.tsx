"use client";

interface WaveEffectProps {
  active: boolean;
}

export function WaveEffect({ active }: WaveEffectProps) {
  return (
    <div
      className={`pointer-events-none absolute -bottom-3 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-full transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      <div
        className={`wave-glow absolute inset-0 rounded-full ${
          active ? "animate-float-wave" : ""
        }`}
      />
      <div
        className={`absolute inset-x-4 top-1 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent ${
          active ? "animate-shimmer" : ""
        }`}
      />
    </div>
  );
}
