import Image from "next/image";
import Link from "next/link";
import Navbar from "../_components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 border border-[#C8A84B]/40 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8A84B]" />
            <span className="text-xs text-white/60 tracking-widest uppercase">Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Building the Standard for<br />
            <span className="text-[#C8A84B]">Behavioral Readiness.</span>
          </h1>
          <div className="mx-auto w-16 h-[2px] bg-[#C8A84B] mb-8" />
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Legacyline exists because the systems meant to help people rebuild their lives were failing them — not because people weren't ready, but because no one had built the infrastructure to prove it.
          </p>
        </div>
      </section>

      {/* WHY WE BUILT THIS */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Why Legacyline Was Built</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                The gap wasn't effort.<br />It was evidence.
              </h2>
              <div className="w-12 h-[2px] bg-[#C8A84B] mb-8" />
              <div className="space-y-5 text-[#1A3A5C]/70 leading-relaxed">
                <p>
                  Lenders, housing agencies, workforce programs, and corrections systems all make high-stakes decisions about individuals — but without a governed, evidence-based standard for measuring behavioral readiness, those decisions default to proxies like credit scores, criminal records, and gut instinct.
                </p>
                <p>
                  The result: qualified people are turned away. Institutions lack accountability. And the cycle continues.
                </p>
                <p>
                  Legacyline was built to close that gap — to create a permanent, auditable, evidence-based readiness record for every individual, governed by a federal standard that any institution can trust.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "4", label: "Readiness Domains", sub: "Housing, Employment, Financial, Stability" },
                { number: "7", label: "Platform Modules", sub: "From intake to certified readiness" },
                { number: "24–48hr", label: "Evaluation Window", sub: "Human-reviewed, not auto-generated" },
                { number: "1", label: "Governing Standard", sub: "BRSA — the authority layer" },
              ].map(item => (
                <div key={item.label} className="bg-white border border-[#e6dfd2] rounded-2xl p-5 shadow-sm">
                  <div className="text-2xl font-bold text-[#C8A84B] mb-1">{item.number}</div>
                  <div className="font-semibold text-[#1A3A5C] text-sm mb-1">{item.label}</div>
                  <div className="text-xs text-[#1A3A5C]/50 leading-relaxed">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRSA MISSION */}
      <section className="bg-white px-6 py-20 md:px-10 border-y border-[#e6dfd2]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">The Authority Layer</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What is BRSA?</h2>
            <div className="mx-auto w-12 h-[2px] bg-[#C8A84B]" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Standards Authority", desc: "BRSA sets and governs the behavioral readiness standard — the rules, thresholds, and methodology that define what readiness means and how it is measured.", icon: "◈" },
              { title: "Evaluator Certification", desc: "BRSA certifies every evaluator who works within the Legacyline platform. Certification is not automatic — it requires training, examination, and ongoing compliance.", icon: "◎" },
              { title: "Registry & Verification", desc: "BRSA maintains the authoritative registry of certified individuals and institutions. Any party can verify standing through the BRSA verification portal.", icon: "⬡" },
            ].map(item => (
              <div key={item.title} className="text-center p-8 rounded-2xl border border-[#e6dfd2] hover:border-[#C8A84B]/40 transition">
                <div className="text-3xl text-[#C8A84B] mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#1A3A5C] text-lg mb-3">{item.title}</h3>
                <div className="w-8 h-[2px] bg-[#C8A84B] mx-auto mb-4" />
                <p className="text-[#1A3A5C]/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="bg-[#1A3A5C] text-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <Image src="/logo-seal.png" alt="BRSA Seal" width={100} height={100} className="h-24 w-auto opacity-90" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            National readiness infrastructure.<br />
            <span className="text-[#C8A84B]">Built to last.</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            The long-term vision for Legacyline is to become the national standard for behavioral readiness — a permanent infrastructure layer that lenders, housing agencies, workforce systems, corrections programs, and education institutions rely on to make better, fairer, more accountable decisions.
          </p>
          <Link href="/intake" className="inline-block bg-[#C8A84B] text-[#1A3A5C] px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition text-sm tracking-wide">
            Begin Your Intake
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
