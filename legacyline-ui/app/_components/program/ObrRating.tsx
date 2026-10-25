import { bandFor } from "../../../lib/bands";
import { OBR, OBR_GUARDRAIL, RENEWAL, obrScore } from "../../../lib/program";

type Entry = { at: string; who: string; action: string; reason: string };

/** Organization readiness rating under OBR organizational v1.0.0 (published weights). */
export default function ObrRating({ passed, assessedOn, expiresOn, renewalOpens, log }: { passed: Set<string>; assessedOn: string; expiresOn?: string; renewalOpens?: string; log?: Entry[] }) {
  const r = obrScore(passed);
  const band = bandFor(r.composite);
  return (
    <section aria-labelledby="obr-rating" className="mt-8">
      <h2 id="obr-rating" className="ao-h2">Readiness rating</h2>
      <div className="ao-card mt-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="flex items-baseline gap-3"><span className="ao-serif" style={{ fontSize: 28, fontWeight: 600 }}>{band.label}</span><span className="ao-mono" style={{ fontSize: 28 }}>{r.composite}<span style={{ fontSize: 15, color: "var(--ink-3)" }}> / 100</span></span></p>
          <span className="ao-meta">Rated {assessedOn}{expiresOn ? <> · <strong style={{ color: "var(--ink)" }}>valid until {expiresOn}</strong></> : null} · <span className="ao-mono">{OBR.id}</span></span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {r.areas.map((a) => (
            <div key={a.key}>
              <p className="flex justify-between" style={{ fontWeight: 600 }}><span>{a.label} <span className="ao-mono ao-meta">{Math.round(a.weight * 100)}%</span></span><span className="ao-mono">{a.score}</span></p>
              <ul className="mt-1 flex flex-col gap-0.5" style={{ fontSize: 14 }}>
                {a.rules.map((x) => <li key={x.id} className="flex justify-between gap-2" style={{ color: passed.has(x.id) ? "var(--ink)" : "var(--ink-3)" }}><span>{passed.has(x.id) ? "✓" : "○"} {x.label}</span><span className="ao-mono">{passed.has(x.id) ? `+${x.points}` : `0 of ${x.points}`}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="ao-mono mt-4" style={{ fontSize: 13 }}>{OBR.formula}</p>
        <p className="ao-meta mt-1">Green 70 and above · Yellow 40–69 · Red below 40. Source: {OBR.source}.</p>
        {expiresOn && <p className="mt-3 rounded-[8px] px-3 py-2" style={{ background: "var(--vellum)", fontSize: 14 }}>{RENEWAL.org} This rating expires <strong>{expiresOn}</strong>; renewal opens <strong>{renewalOpens}</strong>.</p>}
      </div>
      <div className="ao-card mt-4 p-5">
        <h3 className="ao-h3" style={{ fontSize: 18 }}>How this score is made</h3>
        <ol className="mt-2 grid gap-2 md:grid-cols-3" style={{ listStyle: "none", padding: 0, fontSize: 14 }}>
          <li className="rounded-[8px] p-3" style={{ background: "var(--vellum)" }}><span className="ao-mono ao-meta">1 · Evidence</span><p className="mt-1">Evaluators enter and verify documents. They don&apos;t score.</p></li>
          <li className="rounded-[8px] p-3" style={{ background: "var(--vellum)" }}><span className="ao-mono ao-meta">2 · Rules compute</span><p className="mt-1">The published rules turn verified evidence into the area scores above.</p></li>
          <li className="rounded-[8px] p-3" style={{ background: "var(--vellum)" }}><span className="ao-mono ao-meta">3 · Oversight</span><p className="mt-1">A person can flag, pause or send back, always with a logged reason.</p></li>
        </ol>
        <p className="mt-3" style={{ fontSize: 14, fontWeight: 600 }}>{OBR_GUARDRAIL[3]}</p>
        {log && <>
          <p className="ao-meta mt-4" style={{ fontWeight: 600, color: "var(--ink)" }}>Oversight log (permanent; entries can&apos;t be edited or deleted)</p>
          <ol className="mt-2 flex flex-col" style={{ listStyle: "none", padding: 0, fontSize: 14 }}>
            {log.map((e) => <li key={e.at} className="py-2" style={{ borderBottom: "1px solid var(--linen)", display: "grid", gridTemplateColumns: "190px 130px 1fr", gap: 10 }}><span className="ao-mono ao-meta">{e.at}</span><span style={{ fontWeight: 600 }}>{e.action}</span><span>{e.reason} <span className="ao-meta">· {e.who}</span></span></li>)}
          </ol>
        </>}
      </div>
    </section>
  );
}
