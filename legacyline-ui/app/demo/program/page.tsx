import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "../../../lib/brand";
import { BANDS_SOURCE, EVIDENCE_DOMAINS, EVIDENCE_DOMAINS_SOURCE, FRARI_COMPONENTS, FRARI_INDIVIDUAL, INTAKE_FIELDS, OBR, OBR_AREAS, PUBLISHED_BANDS, STANDARD, OBR_GUARDRAIL, RENEWAL, FOLLOW_UP_DAYS, FOLLOW_UP_AREAS, ENGAGEMENT_SIGNALS, RE_REVIEW_RULES } from "../../../lib/program";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export const metadata: Metadata = { title: "The program", robots: { index: false, follow: false } };

const th = { textAlign: "left" as const, padding: "10px 14px", borderBottom: "1px solid var(--linen)", fontWeight: 600 };
const td = { padding: "10px 14px", borderBottom: "1px solid var(--linen)", verticalAlign: "top" as const };

// The real program, from Clarence's written standard. Nothing on this page is sample data.
export default function ProgramPage() {
  if (!demoPagesAllowed()) notFound();
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p className="ao-eyebrow">The {BRAND.name} program · the real standard</p>
        <h1 className="ao-h1 mt-2">What {BRAND.name} measures, and how</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 720 }}>Everything on this page is the written program: the definition, the formulas, the thresholds and the evidence domains. The demo&apos;s people and numbers are made up. These rules are not.</p>

        <section className="ao-card mt-8 p-6" aria-labelledby="def">
          <h2 id="def" className="ao-h2">Behavioral readiness</h2>
          <p className="ao-serif mt-3" style={{ fontSize: 20, lineHeight: "28px" }}>“{STANDARD.definition}”</p>
          <p className="ao-body-2 mt-2">It is {STANDARD.notList.join(", ")}. It is established only through documented evidence. {STANDARD.financial}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
            {STANDARD.principles.map((p) => <li key={p.name}><span style={{ fontWeight: 600 }}>{p.name}.</span> <span className="ao-body-2">{p.text}</span></li>)}
          </ul>
          <p className="ao-meta mt-4">Source: {STANDARD.source}</p>
        </section>

        <section className="mt-8" aria-labelledby="person">
          <h2 id="person" className="ao-h2">A person&apos;s readiness score <span className="ao-meta">{FRARI_INDIVIDUAL.label}</span></h2>
          <p className="ao-body-2 mt-2">Four parts, each scored 0–100, then weighted. Same inputs always give the same score.</p>
          <div className="ao-card mt-3" style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead><tr><th scope="col" style={th}>Part</th><th scope="col" style={{ ...th, textAlign: "right" }}>Weight</th><th scope="col" style={th}>How it&apos;s scored</th></tr></thead>
              <tbody>{FRARI_COMPONENTS.map((c) => <tr key={c.key}><th scope="row" style={{ ...td, textAlign: "left" }}>{c.label}<span className="ao-meta block" style={{ fontWeight: 400 }}>{c.plain}</span></th><td className="ao-mono" style={{ ...td, textAlign: "right" }}>{Math.round(c.weight * 100)}%</td><td style={td}>{c.rule}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="ao-mono mt-3" style={{ fontSize: 14 }}>{FRARI_INDIVIDUAL.formula}</p>
          <details className="mt-2"><summary className="ao-link" style={{ fontSize: 14, cursor: "pointer" }}>The 12 intake fields</summary><p className="ao-body-2 mt-2">{INTAKE_FIELDS.join(" · ")}</p></details>
          <p className="ao-meta mt-2">Source: {FRARI_INDIVIDUAL.source}</p>
        </section>

        <section className="mt-8" aria-labelledby="bands">
          <h2 id="bands" className="ao-h2">What the score means</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
            {PUBLISHED_BANDS.map((b) => <li key={b.key} className="ao-card p-4"><span className={`ao-chip chip-${b.key}`}><span className="ao-chip-dot" />{b.label} · {b.key === "green" ? "70 and above" : `${b.min}–${b.max}`}</span><p className="ao-body-2 mt-2">{b.meaning}</p></li>)}
          </ul>
          <p className="ao-meta mt-2">Certified is a step a person reaches after two evaluators sign off. It is not a band. Source: {BANDS_SOURCE}.</p>
        </section>

        <section className="mt-8" aria-labelledby="domains">
          <h2 id="domains" className="ao-h2">The 12 evidence domains</h2>
          <p className="ao-body-2 mt-2">The behavioral readiness instrument. Evaluators file every piece of evidence under one of these.</p>
          <ol className="ao-card mt-3 grid gap-x-6 gap-y-3 p-5 sm:grid-cols-2" style={{ listStyle: "none" }}>
            {EVIDENCE_DOMAINS.map((d) => <li key={d.n} className="flex gap-3"><span className="ao-mono" style={{ minWidth: 22, color: "var(--ink-3)" }}>{d.n}</span><span><span style={{ fontWeight: 600 }}>{d.name}</span><span className="ao-meta block">{d.types}</span></span></li>)}
          </ol>
          <p className="ao-meta mt-2">Source: {EVIDENCE_DOMAINS_SOURCE}</p>
        </section>

        <section className="mt-8" aria-labelledby="org">
          <h2 id="org" className="ao-h2">An organization&apos;s readiness rating <span className="ao-meta">{OBR.label}</span></h2>
          <p className="ao-body-2 mt-2">Four areas, each scored 0–100 from documented items, then weighted. Same Green, Yellow and Red thresholds as for people.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {OBR_AREAS.map((a) => (
              <div key={a.key} className="ao-card p-4">
                <p style={{ fontWeight: 600 }}>{a.label} <span className="ao-mono ao-meta">{Math.round(a.weight * 100)}%</span></p>
                <p className="ao-meta mt-1">{a.meaning}</p>
                <ul className="mt-2 flex flex-col gap-1" style={{ fontSize: 14 }}>{a.rules.map((r) => <li key={r.id} className="flex justify-between gap-3"><span>{r.label}</span><span className="ao-mono">+{r.points}</span></li>)}</ul>
              </div>
            ))}
          </div>
          <p className="ao-mono mt-3" style={{ fontSize: 14 }}>{OBR.formula}</p>
          <p className="ao-meta mt-2">Source: {OBR.source}</p>
          <ul className="ao-card mt-3 p-4 flex flex-col gap-1" style={{ fontSize: 14, listStyle: "disc", paddingLeft: 32 }}>{OBR_GUARDRAIL.map((g) => <li key={g}>{g}</li>)}<li>{RENEWAL.org}</li></ul>
        </section>

        <section className="mt-8" aria-labelledby="fu">
          <h2 id="fu" className="ao-h2">Check-ins and re-reviews <span className="ao-meta">(follow-up system v1.0, approved Oct 24, 2026)</span></h2>
          <p className="ao-body-2 mt-2">Check-ins at day {FOLLOW_UP_DAYS.join(", day ")}. Each one asks the same short questions so change shows up over time, refreshes the evidence, and includes a re-review.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {FOLLOW_UP_AREAS.map((a) => <div key={a.key} className="ao-card p-4"><p style={{ fontWeight: 600 }}>{a.label}</p><ul className="mt-2 flex flex-col gap-1" style={{ fontSize: 14, listStyle: "disc", paddingLeft: 18 }}>{a.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>)}
          </div>
          <p className="ao-meta mt-3" style={{ fontWeight: 600, color: "var(--ink)" }}>Also tracked between check-ins: {ENGAGEMENT_SIGNALS.map((e) => e.label.toLowerCase()).join(", ")}.</p>
          <ul className="mt-2 flex flex-col gap-1" style={{ fontSize: 14, listStyle: "disc", paddingLeft: 18 }}>{RE_REVIEW_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      </div>
    </main>
  );
}
