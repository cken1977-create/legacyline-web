import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A3A5C]">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        .gold-line { background: linear-gradient(90deg, #C8A84B, #e8c96b, #C8A84B); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.55s; opacity: 0; }
        .fade-up-5 { animation-delay: 0.7s; opacity: 0; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-[#1A3A5C]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A3A5C] rounded flex items-center justify-center">
            <span className="text-[#C8A84B] font-display font-bold text-sm">L</span>
          </div>
          <div>
            <div className="font-display font-bold text-[#1A3A5C] text-lg leading-none">LEGACYLINE</div>
            <div className="text-[10px] text-[#C8A84B] tracking-widest uppercase leading-none mt-0.5">Behavioral Readiness</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/verify" className="hidden md:block text-sm text-[#1A3A5C]/60 hover:text-[#1A3A5C] transition">Verify Record</Link>
          <Link href="/dashboard" className="hidden md:block text-sm text-[#1A3A5C]/60 hover:text-[#1A3A5C] transition">Dashboard</Link>
          <Link href="/intake" className="bg-[#1A3A5C] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1A3A5C]/90 transition font-medium">
            Begin Intake
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 md:px-12 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #1A3A5C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8A84B 0%, transparent 40%)'}} />
        
        <div className="relative max-w-4xl">
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 bg-[#1A3A5C]/5 border border-[#1A3A5C]/10 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8A84B]" />
            <span className="text-xs text-[#1A3A5C]/60 tracking-wider uppercase font-medium">Powered by BRSA Standards</span>
          </div>

          <h1 className="fade-up fade-up-2 font-display text-5xl md:text-7xl font-bold text-[#1A3A5C] leading-tight tracking-tight">
            Readiness.<br />
            <span className="text-[#C8A84B]">Measured.</span><br />
            Proven.
          </h1>

          <div className="fade-up fade-up-3 h-px w-24 gold-line my-8" />

          <p className="fade-up fade-up-3 text-lg md:text-xl text-[#1A3A5C]/65 max-w-2xl leading-relaxed font-light">
            Legacyline is the behavioral readiness engine implementing BRSA's federal standard. We don't guess. We document behavior, verify evidence, and compute readiness using governed rules — over time.
          </p>

          <div className="fade-up fade-up-4 flex flex-wrap gap-4 mt-10">
            <Link href="/intake" className="bg-[#1A3A5C] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1A3A5C]/90 transition text-sm tracking-wide">
              Begin My Intake
            </Link>
            <Link href="/verify" className="border border-[#1A3A5C]/20 text-[#1A3A5C] px-8 py-4 rounded-xl font-semibold hover:border-[#1A3A5C]/40 transition text-sm tracking-wide">
              Verify a Record
            </Link>
          </div>

          <div className="fade-up fade-up-5 flex flex-wrap gap-6 mt-12">
            {["Evidence-based", "No credit scoring", "Audit-defensible", "Deterministic"].map(tag => (
              <div key={tag} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#C8A84B]" />
                <span className="text-xs text-[#1A3A5C]/50 tracking-wide">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Legacyline Measures */}
      <section className="px-6 py-20 md:px-12 bg-[#1A3A5C]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              The whole picture. Not a snapshot.
            </div>
            <div className="h-px w-16 gold-line mx-auto mb-4" />
            <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
              Unlike a credit score, Legacyline captures behavioral patterns over time — revealing who a person truly is financially and behaviorally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Financial Readiness", desc: "Income consistency, debt ratios, bill payment timing, and spending discipline — measured over time.", icon: "◈" },
              { title: "Housing Stability", desc: "Housing type, payment history, move frequency, and cost-to-income ratios analyzed for stability.", icon: "⬡" },
              { title: "Employment Readiness", desc: "Job stability, employer history, income trajectory, and workforce engagement patterns.", icon: "◎" },
            ].map(item => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition">
                <div className="text-[#C8A84B] text-2xl mb-4">{item.icon}</div>
                <div className="font-display font-semibold text-white text-lg mb-2">{item.title}</div>
                <div className="text-white/50 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="font-display text-3xl md:text-4xl font-bold text-[#1A3A5C] mb-4">How it works</div>
            <div className="h-px w-16 gold-line mb-4" />
            <p className="text-[#1A3A5C]/50 text-sm max-w-xl leading-relaxed">A governed process from onboarding to certified readiness.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register", desc: "Create your subject record and grant consent." },
              { step: "02", title: "Submit Evidence", desc: "Upload documents and behavioral data." },
              { step: "03", title: "Evaluator Review", desc: "A certified BRSA evaluator reviews your submission." },
              { step: "04", title: "Readiness Score", desc: "Receive your composite readiness score and report." },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="font-display text-5xl font-bold text-[#C8A84B]/20 mb-3">{item.step}</div>
                <div className="font-semibold text-[#1A3A5C] mb-2">{item.title}</div>
                <div className="text-[#1A3A5C]/50 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It Serves */}
      <section className="px-6 py-20 md:px-12 bg-[#F0EDE6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-display text-3xl md:text-4xl font-bold text-[#1A3A5C] mb-4">Built for institutions. Designed for people.</div>
            <div className="h-px w-16 gold-line mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Lenders & Mortgage Institutions",
              "Workforce Development Programs",
              "Housing Agencies",
              "Corrections & Reentry Programs",
              "Education Systems",
              "Economic Development Agencies",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 bg-white border border-[#1A3A5C]/10 rounded-xl px-5 py-4">
                <div className="w-2 h-2 rounded-full bg-[#C8A84B] shrink-0" />
                <span className="text-sm text-[#1A3A5C] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 md:px-12 bg-[#1A3A5C] text-center">
        <div className="max-w-2xl mx-auto">
          <div className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Your readiness is your record.
          </div>
          <div className="h-px w-16 gold-line mx-auto mb-8" />
          <p className="text-white/50 mb-10 leading-relaxed">Start your intake today. A BRSA-certified evaluator will guide you through the process.</p>
          <Link href="/intake" className="inline-block bg-[#C8A84B] text-[#1A3A5C] px-10 py-4 rounded-xl font-bold hover:bg-[#d4b55a] transition text-sm tracking-wide">
            Begin My Intake
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 md:px-12 border-t border-[#1A3A5C]/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#1A3A5C] rounded flex items-center justify-center">
              <span className="text-[#C8A84B] font-display font-bold text-xs">L</span>
            </div>
            <span className="font-display font-bold text-[#1A3A5C] text-sm">LEGACYLINE</span>
          </div>
          <div className="text-xs text-[#1A3A5C]/40">
            A BRSA Holdings Inc. platform. Standards-governed. © 2026 Legacyline HQ.
          </div>
          <div className="flex gap-6">
            <Link href="/intake" className="text-xs text-[#1A3A5C]/40 hover:text-[#1A3A5C] transition">Intake</Link>
            <Link href="/verify" className="text-xs text-[#1A3A5C]/40 hover:text-[#1A3A5C] transition">Verify</Link>
            <Link href="/dashboard" className="text-xs text-[#1A3A5C]/40 hover:text-[#1A3A5C] transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
                  }
