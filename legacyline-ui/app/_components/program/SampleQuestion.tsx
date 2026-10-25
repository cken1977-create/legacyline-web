"use client";
import { useState } from "react";

export default function SampleQuestion({ q, options, correct, why }: { q: string; options: string[]; correct: number; why: string }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <fieldset className="mt-4 rounded-[8px] p-4" style={{ background: "var(--vellum)", border: 0 }}>
      <legend className="ao-meta" style={{ color: "var(--ink-2)", padding: 0 }}>Sample exam question</legend>
      <p className="mt-1" style={{ fontSize: 15, fontWeight: 600 }}>{q}</p>
      <div className="mt-2 flex flex-col gap-1.5" role="radiogroup">
        {options.map((o, i) => {
          const chosen = pick === i, show = pick !== null;
          const bg = show && i === correct ? "var(--pine-tint)" : chosen ? "var(--brick-tint)" : "var(--card)";
          return (
            <button key={o} type="button" role="radio" aria-checked={chosen} onClick={() => setPick(i)} className="rounded-[6px] px-3 py-2 text-left" style={{ background: bg, border: "1px solid var(--linen)", fontSize: 14, cursor: "pointer", color: "var(--ink)" }}>
              <span className="ao-mono" style={{ marginRight: 8, color: "var(--ink-3)" }}>{String.fromCharCode(65 + i)}</span>{o}
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-2" style={{ fontSize: 14, minHeight: 20 }}>
        {pick === null ? "" : pick === correct ? `Correct. ${why}` : `Not quite. The answer is ${String.fromCharCode(65 + correct)}. ${why}`}
      </p>
    </fieldset>
  );
}
