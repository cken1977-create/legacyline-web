import Link from "next/link";
import Navbar from "./_components/Navbar";
import { BRAND } from "../lib/brand";

const TIERS = [
  { g: "circle", name: "Individual", for: "For a person building a record", body: "Your evidence, in one place, checked against the standard. You decide who sees it." },
  { g: "square", name: "Organization", for: "For programs and employers (OBR)", body: "Governance, staff, policy and finances, held to the same rules and the same receipts." },
  { g: "triangle", name: "Institution", for: "For lenders, funders and housing", body: "Read consented packets and run the institutional ruleset on your own record." },
];
const STEPS = [
  { n: "01", t: "Request", b: "A program or a person opens a record." },
  { n: "02", t: "Record", b: "Evidence goes on the shelf: documents, answers, consent." },
  { n: "03", t: "Run", b: "The engine checks the record against a version-locked ruleset." },
  { n: "04", t: "Review", b: "A certified reviewer verifies evidence and attests. Two keys to certify." },
  { n: "05", t: "Packet", b: "A consented, time-limited copy goes to the person who asked." },
];
const RECEIPT = [
  { r: "Government ID on file", k: "gov_id_verified", p: 25, ok: true },
  { r: "Work status documented", k: "employment_present", p: 25, ok: true },
  { r: "Housing cost documented", k: "housing_cost_present", p: 20, ok: true },
  { r: "Bank statement on file", k: "bank_statement_present", p: 35, ok: false },
];

function Glyph({ g }: { g: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--gold)" strokeWidth="1.5" aria-hidden>
      {g === "circle" && <circle cx="14" cy="14" r="10" />}
      {g === "square" && <rect x="4.5" y="4.5" width="19" height="19" rx="1.5" />}
      {g === "triangle" && <path d="M14 4 24.5 23h-21z" />}
    </svg>
  );
}

export default function Page() {
  return (
    <main className="ao-night min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "min(86vh, 860px)" }}>
        <img src="/photos/records.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgb(14 15 17 / .94) 0%, rgb(14 15 17 / .78) 45%, rgb(14 15 17 / .35) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(transparent, var(--night))" }} />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-36 md:px-6 md:pt-44">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>Readiness registry</p>
          <h1 className="mt-5 max-w-3xl font-serif font-semibold tracking-[-0.02em] text-[44px] leading-[1.02] md:text-[76px]">A person. A record.<br /><span className="italic" style={{ color: "var(--gold)" }}>A packet.</span></h1>
          <p className="mt-7 max-w-xl text-[18px] leading-[30px]" style={{ color: "var(--cream-dim)" }}>{BRAND.name} keeps one honest record per person, checks it against the {BRAND.standard} standard with an engine anyone can re-run, and lets the person decide who reads it.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/app/signup" className="ao-btn ao-btn-gold" style={{ height: 50, padding: "0 24px", fontSize: 16 }}>Start your record</Link>
            <Link href="/app/login" className="ao-btn ao-btn-ghost-n" style={{ height: 50, padding: "0 24px", fontSize: 16 }}>Sign in</Link>
          </div>
          <div className="mt-12 inline-flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 pl-3 font-mono text-[13px]" style={{ borderColor: "var(--gold)", color: "var(--cream-dim)" }}>
            <span style={{ color: "var(--slate)" }}>Sample</span><span>FRARI individual v1</span><span style={{ color: "var(--slate)" }}>·</span><span>run 7f3a</span><span style={{ color: "var(--slate)" }}>·</span><span>Oct 9, 2026</span><span style={{ color: "var(--engine-n)" }}>Verify ↻</span>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-28" aria-labelledby="tiers">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>Who it's for</p>
        <h2 id="tiers" className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-[1.1] md:text-[44px]">One standard, three kinds of record.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[12px] md:grid-cols-3" style={{ background: "#2A2D33" }}>
          {TIERS.map((t) => (
            <article key={t.name} className="p-7 md:p-8" style={{ background: "var(--panel)" }}>
              <Glyph g={t.g} />
              <h3 className="mt-6 font-serif text-[26px] font-semibold">{t.name}</h3>
              <p className="mt-1 text-[14px]" style={{ color: "var(--slate)" }}>{t.for}</p>
              <p className="mt-4 text-[16px] leading-[26px]" style={{ color: "var(--cream-dim)" }}>{t.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y" style={{ borderColor: "#24272C", background: "var(--panel)" }} aria-labelledby="how-h">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-28">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>How it works</p>
          <h2 id="how-h" className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-[1.1] md:text-[44px]">The engine scores. The reviewer attests. The person owns the record.</h2>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-[11px] hidden h-px md:block" style={{ background: "#3A3E45" }} />
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="relative z-10 inline-grid h-6 w-6 place-items-center rounded-full" style={{ background: "var(--night)", border: `1.5px solid ${s.t === "Run" ? "var(--engine-n)" : "var(--gold)"}` }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.t === "Run" ? "var(--engine-n)" : "var(--gold)" }} /></span>
                <p className="mt-4 font-mono text-[12px]" style={{ color: "var(--slate)" }}>{s.n}</p>
                <h3 className="mt-1 text-[18px] font-semibold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-[24px]" style={{ color: "var(--cream-dim)" }}>{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The standard + sample receipt */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-6 md:py-28" aria-labelledby="std">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>The standard</p>
          <h2 id="std" className="mt-3 font-serif text-[34px] font-semibold leading-[1.1] md:text-[44px]">Deterministic. Version-locked. Reproducible.</h2>
          <p className="mt-5 max-w-md text-[17px] leading-[28px]" style={{ color: "var(--cream-dim)" }}>Every number comes with a receipt: which rules passed, which are still missing, the points each one is worth, and a hash of the run. Nobody types a score. <span style={{ color: "var(--cream)" }}>Re-run it yourself.</span></p>
          <Link href="/certification" className="mt-8 inline-flex items-center gap-2 text-[15px] underline decoration-1 underline-offset-4" style={{ color: "var(--blue-n)" }}>Read the standard →</Link>
        </div>
        <figure className="overflow-hidden rounded-[12px]" style={{ background: "var(--cream)", color: "var(--ink)" }} aria-label="Sample receipt">
          <div className="flex items-baseline justify-between px-6 pb-3 pt-5" style={{ borderBottom: "1px solid var(--linen)" }}>
            <span className="font-serif text-[20px] font-semibold">Receipt</span>
            <span className="font-mono text-[12px]" style={{ color: "var(--ink-3)" }}>Sample</span>
          </div>
          <table className="w-full text-left text-[14px]">
            <caption className="sr-only">Sample FRARI receipt</caption>
            <thead><tr style={{ color: "var(--ink-3)" }}><th className="px-6 py-2 text-[12px] font-medium">Rule</th><th className="py-2 text-[12px] font-medium">Result</th><th className="px-6 py-2 text-right text-[12px] font-medium">Points</th></tr></thead>
            <tbody>
              {RECEIPT.map((r) => (
                <tr key={r.k} style={{ borderTop: "1px solid var(--linen)" }}>
                  <td className="px-6 py-3"><div className="font-medium">{r.r}</div><div className="font-mono text-[12px]" style={{ color: "var(--ink-3)" }}>{r.k}</div></td>
                  <td className="py-3" style={{ color: r.ok ? "var(--pine)" : "var(--ink-3)" }}>{r.ok ? "✓ Passed" : "— Missing"}</td>
                  <td className="px-6 py-3 text-right font-mono">{r.ok ? `+${r.p}` : `(${r.p})`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-4 font-mono text-[12px]" style={{ background: "var(--vellum)", color: "var(--ink-2)", borderLeft: "2px solid var(--seal)" }}>
            <span>FRARI individual v1</span><span>·</span><span>output 7f3a</span><span>·</span><span style={{ color: "var(--engine)" }}>Reproduced ✓</span>
          </figcaption>
        </figure>
      </section>

      {/* Verify */}
      <section className="border-t" style={{ borderColor: "#24272C" }} aria-labelledby="verify-h">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-6">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>Verify a record</p>
            <h2 id="verify-h" className="mt-3 font-serif text-[30px] font-semibold leading-[1.15] md:text-[36px]">Have a Registry ID? Check it yourself.</h2>
            <p className="mt-3 max-w-lg text-[16px] leading-[26px]" style={{ color: "var(--cream-dim)" }}>You'll see the standing and when it was checked. Never documents, never personal details.</p>
          </div>
          <form action="/verify" method="get" className="flex w-full max-w-md gap-2" role="search">
            <label htmlFor="rid" className="sr-only">Registry ID</label>
            <input id="rid" name="rid" placeholder="BRSA-IND-2026-00000" className="h-[50px] flex-1 rounded-[6px] px-4 font-mono text-[15px] outline-none" style={{ background: "var(--panel)", border: "1px solid #3A3E45", color: "var(--cream)" }} />
            <button className="ao-btn ao-btn-gold" style={{ height: 50 }}>Verify</button>
          </form>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-6" aria-labelledby="prog">
        <div className="flex flex-col gap-6 rounded-[12px] p-8 md:flex-row md:items-center md:justify-between md:p-10" style={{ background: "var(--panel)", border: "1px solid #24272C" }}>
          <div>
            <h2 id="prog" className="font-serif text-[26px] font-semibold">Running a program or reviewing records?</h2>
            <p className="mt-2 text-[16px]" style={{ color: "var(--cream-dim)" }}>Operators enroll people and chase missing evidence. Certified reviewers verify and attest.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login/organization" className="ao-btn ao-btn-ghost-n">Program desk</Link>
            <Link href="/evaluator" className="ao-btn ao-btn-ghost-n">Reviewer sign-in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "#24272C" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-[13px] md:flex-row md:items-center md:justify-between md:px-6" style={{ color: "var(--slate)" }}>
          <span>{BRAND.name} · {BRAND.endorsement}</span>
          <span>{BRAND.family} · © {new Date().getFullYear()} {BRAND.legalEntity}</span>
        </div>
      </footer>
    </main>
  );
}
