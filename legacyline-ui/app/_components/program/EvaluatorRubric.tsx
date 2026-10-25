import { EVENT_STEPS, EVIDENCE_DOMAINS, EVIDENCE_DOMAINS_SOURCE, PROTOCOLS, RECORDING_EXAMPLES, RUBRIC_SOURCE } from "../../../lib/program";

/** The evaluator's written rules, shown beside the sample Reading Room. */
export default function EvaluatorRubric() {
  return (
    <section aria-labelledby="rubric" className="ao-paper px-4 pb-16 pt-10 md:px-8">
      <div className="mx-auto max-w-[1120px]">
        <p className="ao-eyebrow">The evaluator&apos;s rulebook</p>
        <h2 id="rubric" className="ao-h1 mt-1" style={{ fontSize: 28 }}>What an evaluator follows on every record</h2>
        <p className="ao-body-2 mt-2" style={{ maxWidth: 720 }}>Evaluators record what they see. They don&apos;t interpret it, and they don&apos;t set the score: the engine computes it from the recorded evidence using fixed rules.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="ao-card p-5">
            <h3 className="ao-h3" style={{ fontSize: 18 }}>Recording an evidence event: 4 steps</h3>
            <ol className="mt-3 flex flex-col gap-2" style={{ fontSize: 15, paddingLeft: 20, listStyle: "decimal" }}>
              {EVENT_STEPS.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] p-3" style={{ background: "var(--pine-tint)" }}>
                <p className="ao-meta" style={{ color: "var(--ink)", fontWeight: 600 }}>Write this (observable)</p>
                <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: 14 }}>{RECORDING_EXAMPLES.write.map((x) => <li key={x}>“{x}”</li>)}</ul>
              </div>
              <div className="rounded-[8px] p-3" style={{ background: "var(--brick-tint)" }}>
                <p className="ao-meta" style={{ color: "var(--ink)", fontWeight: 600 }}>Never this (interpretation)</p>
                <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: 14 }}>{RECORDING_EXAMPLES.never.map((x) => <li key={x}>“{x}”</li>)}</ul>
              </div>
            </div>
          </div>

          <div className="ao-card p-5">
            <h3 className="ao-h3" style={{ fontSize: 18 }}>Protocol checklist</h3>
            <ul className="mt-3 flex flex-col gap-1.5" style={{ fontSize: 14 }}>
              {PROTOCOLS.map((p) => <li key={p.ref} className="flex gap-3"><span className="ao-mono" style={{ minWidth: 118, color: "var(--ink-2)" }}>{p.ref}</span><span>{p.text}</span></li>)}
            </ul>
            <p className="ao-meta mt-3">Two-person sign-off: one evaluator reviews, a second countersigns. No one approves their own review.</p>
          </div>
        </div>

        <div className="ao-card mt-5 p-5">
          <h3 className="ao-h3" style={{ fontSize: 18 }}>The 12 evidence domains</h3>
          <p className="ao-body-2 mt-1">Every evidence event is filed under exactly one domain that matches what was observed.</p>
          <ol className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
            {EVIDENCE_DOMAINS.map((d) => (
              <li key={d.n} className="flex gap-3">
                <span className="ao-mono" style={{ minWidth: 22, color: "var(--ink-3)" }}>{d.n}</span>
                <span><span style={{ fontWeight: 600 }}>{d.name}</span><span className="ao-meta block">{d.types}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="ao-meta mt-4">Sources: {RUBRIC_SOURCE}; {EVIDENCE_DOMAINS_SOURCE}.</p>
      </div>
    </section>
  );
}
