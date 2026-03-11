import Image from "next/image";
import Link from "next/link";
import Navbar from "../_components/Navbar";

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 border border-[#C8A84B]/40 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8A84B]" />
            <span className="text-xs text-white/60 tracking-widest uppercase">What We Offer</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Readiness solutions for<br />
            <span className="text-[#C8A84B]">every context.</span>
          </h1>
          <div className="mx-auto w-16 h-[2px] bg-[#C8A84B] mb-8" />
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Whether you're an individual proving your readiness, an organization measuring its performance, or an institution driving reentry outcomes — Legacyline has a governed solution.
          </p>
        </div>
      </section>

      {/* SOLUTION 1 — Individual */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Solution 01</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Individual Readiness</h2>
              <div className="w-12 h-[2px] bg-[#C8A84B] mb-8" />
              <p className="text-[#1A3A5C]/70 leading-relaxed mb-6">
                Legacyline creates a permanent, evidence-based readiness record for every individual. Unlike a credit score, your readiness record captures behavioral patterns across housing, employment, financial discipline, and stability — verified by a certified evaluator, not an algorithm.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Lifetime readiness record — starts at intake, grows over time",
                  "Four scored domains: Housing, Employment, Financial, Stability",
                  "Human evaluator review — 24 to 48 hour turnaround",
                  "Shareable with lenders, employers, and housing agencies",
                  "Immutable audit trail — every data point is timestamped",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border border-[#C8A84B] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#C8A84B] text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-[#1A3A5C]/70">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/intake" className="inline-block bg-[#1A3A5C] border-2 border-[#C8A84B] text-white px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition text-sm">
                Begin Intake
              </Link>
            </div>
            <div className="bg-white border border-[#e6dfd2] rounded-3xl p-8 shadow-sm">
              <div className="flex justify-center mb-6">
                <Image src="/logo-columns.png" alt="Individual Readiness" width={100} height={100} className="h-24 w-auto" />
              </div>
              <div className="space-y-4">
                {[
                  { domain: "Housing Readiness", score: "Complete", color: "bg-[#1A3A5C]" },
                  { domain: "Employment Readiness", score: "Complete", color: "bg-[#1A3A5C]" },
                  { domain: "Financial Readiness", score: "Complete", color: "bg-[#C8A84B]" },
                  { domain: "Stability", score: "Complete", color: "bg-[#1A3A5C]" },
                ].map(item => (
                  <div key={item.domain} className="flex items-center justify-between p-3 rounded-xl bg-[#f6f3ee]">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-[#1A3A5C]">{item.domain}</span>
                    </div>
                    <span className="text-xs text-[#C8A84B] font-semibold">{item.score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <div className="text-5xl font-bold text-[#1A3A5C]">78</div>
                <div className="text-xs text-[#C8A84B] tracking-widest uppercase mt-1">Readiness Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION 2 — OBR */}
      <section className="bg-white px-6 py-20 md:px-10 border-y border-[#e6dfd2]">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-[#f6f3ee] border border-[#e6dfd2] rounded-3xl p-8">
              <div className="flex justify-center mb-6">
                <Image src="/logo-shield.png" alt="OBR" width={100} height={100} className="h-24 w-auto" />
              </div>
              <div className="space-y-4">
                {[
                  { label: "Staff Readiness Assessment", status: "Active" },
                  { label: "Program Integrity Review", status: "Active" },
                  { label: "Evaluator Compliance Audit", status: "Scheduled" },
                  { label: "Institutional Certification", status: "Pending" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e6dfd2]">
                    <span className="text-sm font-medium text-[#1A3A5C]">{item.label}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === "Active" ? "bg-[#1A3A5C]/10 text-[#1A3A5C]" : "bg-[#C8A84B]/10 text-[#C8A84B]"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Solution 02</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Organizational Readiness (OBR)</h2>
              <div className="w-12 h-[2px] bg-[#C8A84B] mb-8" />
              <p className="text-[#1A3A5C]/70 leading-relaxed mb-6">
                Organizations that serve individuals — housing agencies, workforce programs, lenders, reentry providers — need to demonstrate their own readiness. OBR is the institutional accountability layer inside Legacyline. It measures whether an organization's staff, programs, and evaluators meet BRSA standards.
              </p>
              <div className="space-y-3">
                {[
                  "3 to 5 business day organizational evaluation",
                  "Staff and program integrity assessment",
                  "Evaluator compliance verification",
                  "Institutional certification upon passing",
                  "Ongoing monitoring and re-certification cycle",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border border-[#C8A84B] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#C8A84B] text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-[#1A3A5C]/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION 3 — Corrections */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Solution 03</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Corrections & Reentry</h2>
              <div className="w-12 h-[2px] bg-[#C8A84B] mb-8" />
              <p className="text-[#1A3A5C]/70 leading-relaxed mb-4">
                The corrections system faces a structural problem: case managers lack the tools, training, and accountability to prepare individuals for successful reentry. The result is high recidivism, demoralized staff, and communities that never heal.
              </p>
              <p className="text-[#1A3A5C]/70 leading-relaxed mb-6">
                Legacyline's corrections solution gives institutions a governed framework to document, measure, and certify individual readiness before and after release — creating accountability at every level.
              </p>
              <div className="space-y-3">
                {[
                  "Pre-release readiness documentation and scoring",
                  "Post-release behavioral tracking and evidence intake",
                  "Case manager accountability through evaluator certification",
                  "Reentry readiness reports for courts, parole, and housing",
                  "Longitudinal data for institutional performance reviews",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border border-[#C8A84B] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#C8A84B] text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-[#1A3A5C]/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1A3A5C] rounded-3xl p-8 text-white">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-6">The Problem We Solve</div>
              <div className="space-y-5">
                {[
                  { problem: "No accountability", solution: "Evaluator certification creates a verifiable standard" },
                  { problem: "No evidence of readiness", solution: "Permanent record documents behavioral change over time" },
                  { problem: "No institutional framework", solution: "OBR measures the organization, not just the individual" },
                  { problem: "High recidivism", solution: "Readiness scoring identifies gaps before release" },
                ].map(item => (
                  <div key={item.problem} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                    <div className="text-sm text-white/40 mb-1">Problem: {item.problem}</div>
                    <div className="text-sm text-white font-medium">→ {item.solution}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
          <div className="mx-auto w-16 h-[2px] bg-[#C8A84B] mb-8" />
          <p className="text-white/60 mb-10 leading-relaxed">Whether you're an individual, an organization, or an institution — Legacyline has a governed path forward.</p>
          <Link href="/intake" className="inline-block bg-[#C8A84B] text-[#1A3A5C] px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition text-sm tracking-wide">
            Begin Intake
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t-4 border-[#C8A84B] bg-[#1A3A5C] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:px-10">
        <div className="flex items-center gap-4">
          <Image src="/logo-shield.png" alt="Legacyline" width={48} height={48} className="h-12 w-12 object-contain" />
          <div className="text-3xl font-semibold">LEGACYLINE</div>
        </div>
        <FooterCol title="Contact" items={["info@legacylinehq.com"]} />
        <FooterCol title="About" items={["About"]} />
        <FooterCol title="Certification" items={["Certification"]} />
        <FooterCol title="Solutions" items={["Solutions"]} />
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © 2026 Legacyline HQ · A BRSA Holdings Inc. platform · Standards-governed.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xl font-semibold">{title}</div>
      <div className="mt-4 space-y-2 text-base text-white/80">
        {items.map((item) => <div key={item}>{item}</div>)}
      </div>
    </div>
  );
                    }
