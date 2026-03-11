import Image from "next/image";
import Link from "next/link";
import Navbar from "../_components/Navbar";

export default function CertificationPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <Image src="/logo-seal.png" alt="BRSA Certification Seal" width={100} height={100} className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            BRSA Certification.<br />
            <span className="text-[#C8A84B]">The standard that matters.</span>
          </h1>
          <div className="mx-auto w-16 h-[2px] bg-[#C8A84B] mb-8" />
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Certification under the BRSA standard is not automatic. It requires training, examination, and demonstrated competency — for both evaluators and institutions.
          </p>
        </div>
      </section>

      {/* BRSA STANDARDS */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">The Framework</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">BRSA Standards Overview</h2>
            <div className="mx-auto w-12 h-[2px] bg-[#C8A84B] mb-6" />
            <p className="text-[#1A3A5C]/60 max-w-2xl mx-auto leading-relaxed text-sm">
              The Behavioral Readiness Standards Authority sets the doctrine, methodology, and thresholds that govern how readiness is defined, measured, and certified across all domains.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Evidence Standards", desc: "All readiness determinations must be based on verifiable, documented behavioral evidence. Self-reported data alone is insufficient — every data point requires a corresponding evidence artifact.", number: "01" },
              { title: "Evaluator Independence", desc: "Certified evaluators must maintain independence from the institutions they serve. No evaluator may certify a readiness score for an individual in which they have a financial or personal interest.", number: "02" },
              { title: "Scoring Methodology", desc: "Readiness scores are composite — drawn from four domains with defined sub-scores. No single domain can carry a passing score. All domains must meet minimum threshold.", number: "03" },
              { title: "Audit Defensibility", desc: "Every readiness determination must produce an audit-defensible record. This includes the evidence reviewed, the evaluator's analysis, the scoring rationale, and the final determination.", number: "04" },
              { title: "Human Review Requirement", desc: "Readiness scores are never auto-generated. A minimum 24 to 48 hour human evaluator review is required before any score is issued. Institutional reviews require 3 to 5 business days.", number: "05" },
              { title: "Consent Governance", desc: "Readiness assessments require direct, documented consent from the individual. Consent cannot be granted by proxy. Scope of consent is enforced at the data level.", number: "06" },
            ].map(item => (
              <div key={item.title} className="bg-white border border-[#e6dfd2] rounded-2xl p-6 shadow-sm">
                <div className="text-4xl font-bold text-[#C8A84B]/20 mb-3">{item.number}</div>
                <h3 className="font-bold text-[#1A3A5C] text-lg mb-3">{item.title}</h3>
                <div className="w-8 h-[2px] bg-[#C8A84B] mb-4" />
                <p className="text-[#1A3A5C]/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVALUATOR CERTIFICATION */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">For Evaluators</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Evaluators Get Certified</h2>
            <div className="mx-auto w-12 h-[2px] bg-[#C8A84B]" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Application", desc: "Submit your evaluator application through the BRSA Evaluator Portal. Background and credential review required." },
              { step: "02", title: "Training", desc: "Complete the BRSA evaluator training curriculum — 8 modules covering standards, methodology, ethics, and domain-specific assessment." },
              { step: "03", title: "Examination", desc: "Pass the BRSA evaluator examination with a minimum score of 80% across all modules. Modules must be passed sequentially." },
              { step: "04", title: "Certification", desc: "Receive your BRSA evaluator certification. Certification is valid for one year and requires annual re-examination to maintain standing." },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-[#C8A84B]/30 mb-3">{item.step}</div>
                <h3 className="font-bold text-white text-lg mb-3">{item.title}</h3>
                <div className="w-8 h-[2px] bg-[#C8A84B] mx-auto mb-4" />
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href="https://evaluators.brsa.org" className="inline-block bg-[#C8A84B] text-[#1A3A5C] px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition text-sm tracking-wide">
              Apply to Become an Evaluator
            </Link>
          </div>
        </div>
      </section>

      {/* VERIFY */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Verification</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Verify Certification Standing</h2>
              <div className="w-12 h-[2px] bg-[#C8A84B] mb-8" />
              <p className="text-[#1A3A5C]/70 leading-relaxed mb-6">
                Any institution, lender, or individual can verify BRSA certification standing using a Registry ID. The verification portal confirms whether an evaluator or institution is currently certified, the scope of their certification, and the date of last review.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Real-time registry lookup by Registry ID",
                  "Confirms evaluator certification status and scope",
                  "Confirms institutional certification and review date",
                  "Audit-defensible verification record generated on request",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border border-[#C8A84B] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#C8A84B] text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-[#1A3A5C]/70">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/verify" className="inline-block bg-[#1A3A5C] border-2 border-[#C8A84B] text-white px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition text-sm">
                Verify a Record
              </Link>
            </div>
            <div className="bg-[#1A3A5C] rounded-3xl p-8 text-white">
              <div className="flex justify-center mb-8">
                <Image src="/logo-seal.png" alt="BRSA Seal" width={80} height={80} className="h-20 w-auto" />
              </div>
              <div className="text-center mb-6">
                <div className="text-xs text-[#C8A84B] tracking-widest uppercase mb-2">Registry Status</div>
                <div className="text-2xl font-bold">Active — Certified</div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Certification Type", value: "Individual Evaluator" },
                  { label: "Domains", value: "All Four" },
                  { label: "Issued", value: "March 2026" },
                  { label: "Valid Through", value: "March 2027" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="text-sm text-white/50">{item.label}</span>
                    <span className="text-sm text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
