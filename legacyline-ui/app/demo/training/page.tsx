import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CERT_SOURCE, CERT_STAGES, RENEWAL } from "../../../lib/program";
import { DEMO_EVALUATORS, DEMO_TODAY } from "../../../lib/demo";
import { TRAINING_MODULES } from "../../../lib/program-training";
import SampleQuestion from "../../_components/program/SampleQuestion";

export const metadata: Metadata = { title: "Evaluator training", robots: { index: false, follow: false } };

// The real evaluator course: module doctrine and key concepts from the BRSA Evaluator Study
// Guide, one real exam question per module. Never served on production.
export default function TrainingPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p className="ao-eyebrow">Evaluator training · the real course</p>
        <h1 className="ao-h1 mt-2">How evaluators are trained and certified</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 720 }}>Eight modules. Each one has a core rule, the protocols it covers, the key ideas to master, and ten exam questions. One real question per module is shown here; the full exam is only given inside the evaluator portal.</p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ listStyle: "none", padding: 0 }}>
          {CERT_STAGES.map((s, i) => <li key={s.name} className="ao-card p-4"><span className="ao-mono ao-meta">Stage {i + 1}</span><p className="mt-1" style={{ fontWeight: 600 }}>{s.name}</p><p className="ao-body-2 mt-1">{s.text}</p></li>)}
        </ol>
        <p className="ao-meta mt-2">Source: {CERT_SOURCE}. Annual renewal: program rule adopted Oct 2026.</p>

        <section className="ao-card mt-6" style={{ overflowX: "auto", padding: 0 }} aria-labelledby="creds">
          <h2 id="creds" className="ao-h3" style={{ padding: "14px 16px 0", fontSize: 18 }}>Evaluator credentials (sample) · as of {DEMO_TODAY}</h2>
          <p className="ao-meta" style={{ padding: "4px 16px 0" }}>{RENEWAL.evaluator} A lapsed evaluator&apos;s sign-off isn&apos;t accepted.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8 }}>
            <thead><tr>{["Evaluator", "Role", "Certified", "Expires", "Status"].map((h) => <th key={h} scope="col" style={{ textAlign: "left", padding: "8px 16px", borderBottom: "1px solid var(--linen)" }}>{h}</th>)}</tr></thead>
            <tbody>{DEMO_EVALUATORS.map((e) => <tr key={e.name}><td style={{ padding: "8px 16px", borderBottom: "1px solid var(--linen)", fontWeight: 600 }}>{e.name}</td><td style={{ padding: "8px 16px", borderBottom: "1px solid var(--linen)" }}>{e.role}</td><td className="ao-mono" style={{ padding: "8px 16px", borderBottom: "1px solid var(--linen)" }}>{e.certified}</td><td className="ao-mono" style={{ padding: "8px 16px", borderBottom: "1px solid var(--linen)" }}>{e.expires}</td><td style={{ padding: "8px 16px", borderBottom: "1px solid var(--linen)", color: e.status.startsWith("Lapsed") ? "var(--brick, #9b2c1f)" : e.renewing ? "var(--ochre, #8a5a00)" : "var(--pine)" }}>{e.status}</td></tr>)}</tbody>
          </table>
        </section>

        <div className="mt-8 flex flex-col gap-4">
          {TRAINING_MODULES.map((m) => (
            <details key={m.n} className="ao-card p-5" open={m.n === 1}>
              <summary style={{ cursor: "pointer" }}>
                <span className="ao-mono ao-meta">Module {m.n} · 10 questions · pass with 8</span>
                <span className="ao-h3 block mt-1" style={{ fontSize: 20 }}>{m.title}</span>
              </summary>
              <p className="ao-serif mt-3" style={{ fontSize: 18, lineHeight: "26px" }}>{m.doctrine}</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="ao-meta" style={{ fontWeight: 600, color: "var(--ink)" }}>Key ideas</p>
                  <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: 14, paddingLeft: 18, listStyle: "disc" }}>{m.concepts.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
                <div>
                  <p className="ao-meta" style={{ fontWeight: 600, color: "var(--ink)" }}>Protocols covered</p>
                  <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: 14, paddingLeft: 18, listStyle: "disc" }}>{m.protocols.map((c) => <li key={c}>{c}</li>)}</ul>
                  <SampleQuestion q={m.sample.q} options={m.sample.options} correct={m.sample.correct} why={m.sample.why} />
                </div>
              </div>
            </details>
          ))}
        </div>
        <p className="ao-meta mt-4">Source: BRSA Evaluator Study Guide (module doctrine, key concepts, answer explanations); the questions are the live certification bank.</p>
      </div>
    </main>
  );
}
