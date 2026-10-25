import { bandFor } from "../../../lib/bands";
import { FRARI_COMPONENTS, FRARI_INDIVIDUAL, type FrariInputs, frariScore } from "../../../lib/program";

/** FRARI v1.0.0 breakdown: the four published parts, their weights and what each adds. */
export default function FrariPanel({ inputs, compact }: { inputs: FrariInputs; compact?: boolean }) {
  const r = frariScore(inputs);
  const band = bandFor(r.composite);
  return (
    <div className="mt-4 rounded-[10px] p-4" style={{ background: "var(--vellum)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="ao-meta" style={{ color: "var(--ink-2)" }}>How this score is built · <span className="ao-mono">{FRARI_INDIVIDUAL.label}</span></p>
        <span className={`ao-chip chip-${band.key}`}><span className="ao-chip-dot" />{band.label} · {r.composite}</span>
      </div>
      <table className="mt-3 w-full" style={{ fontSize: 14, borderCollapse: "collapse" }}>
        <caption className="sr-only">FRARI v1.0.0 parts</caption>
        <thead>
          <tr className="ao-meta" style={{ textAlign: "left" }}>
            <th scope="col" className="py-1 font-normal">Part</th>
            <th scope="col" className="py-1 pl-4 text-right font-normal">Weight</th>
            <th scope="col" className="py-1 pl-4 text-right font-normal">Part score</th>
            <th scope="col" className="py-1 pl-4 text-right font-normal">Adds</th>
          </tr>
        </thead>
        <tbody>
          {FRARI_COMPONENTS.map((c) => (
            <tr key={c.key} style={{ borderTop: "1px solid var(--linen)" }}>
              <th scope="row" className="py-2 pr-2 text-left" style={{ fontWeight: 500 }}>
                {c.label}
                {!compact && <span className="ao-meta block" style={{ fontWeight: 400 }}>{c.rule}</span>}
              </th>
              <td className="ao-mono py-2 pl-4 text-right">{Math.round(c.weight * 100)}%</td>
              <td className="ao-mono py-2 pl-4 text-right">{r.parts[c.key]}</td>
              <td className="ao-mono py-2 pl-4 text-right">{(r.parts[c.key] * c.weight).toFixed(1)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: "1px solid var(--rule)", fontWeight: 600 }}>
            <th scope="row" className="py-2 text-left">Score (rounded)</th><td /><td /><td className="ao-mono py-2 pl-4 text-right">{r.composite}</td>
          </tr>
        </tbody>
      </table>
      <p className="ao-meta mt-2">Green is 70 and above, Yellow 40–69, Red below 40. Source: {FRARI_INDIVIDUAL.source}.</p>
    </div>
  );
}
