import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">
      {/* HEADER */}
      <header className="border-b-4 border-[#C8A84B] bg-[#1A3A5C] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-4">
            <Image src="/logo-shield.png" alt="Legacyline" width={52} height={52} className="h-12 w-12 object-contain" />
            <div className="text-3xl font-semibold tracking-wide">LEGACYLINE</div>
          </div>
          <nav className="hidden items-center gap-10 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-[#C8A84B]">HOME</Link>
            <Link href="#about" className="hover:text-[#C8A84B]">ABOUT</Link>
            <Link href="#solutions" className="hover:text-[#C8A84B]">SOLUTIONS</Link>
            <Link href="#certification" className="hover:text-[#C8A84B]">CERTIFICATION</Link>
          </nav>
          <Link href="/intake" className="rounded-2xl bg-[#C8A84B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            LOGIN
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute left-[-10%] top-[30%] h-[500px] w-[900px] rotate-[-12deg] rounded-full border-2 border-[#C8A84B]" />
          <div className="absolute left-[-5%] top-[38%] h-[420px] w-[820px] rotate-[-12deg] rounded-full border border-[#C8A84B]" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20">
          <div className="relative z-10">
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              <span className="block">Readiness Measured.</span>
              <span className="block">Behavioral Intelligence</span>
              <span className="block text-[#C8A84B]">Proven.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#2e4463] md:text-xl">
              The standard for behavioral readiness intelligence. Understand individual readiness, evaluate institutional integrity, and drive better outcomes.
            </p>
            <Link href="/intake" className="mt-10 inline-block rounded-[22px] bg-[#1A3A5C] border-2 border-[#C8A84B] px-10 py-5 text-base font-semibold text-white shadow-md transition hover:opacity-95">
              GET STARTED
            </Link>
          </div>
          <div className="relative z-10 flex justify-center md:justify-end">
            <Image
              src="/legacyline_laptop_mockup.png"
              alt="Legacyline dashboard"
              width={560}
              height={560}
              className="w-full max-w-[540px] object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-7xl px-6 py-4 md:px-10">
        <div className="grid gap-8 border-y border-[#1A3A5C]/10 py-8 text-[#1A3A5C] md:grid-cols-3">
          <FeatureLine text="Evaluate Participant Readiness" />
          <FeatureLine text="Institutional Accountability" />
          <FeatureLine text="Certify Evaluator Standards" />
        </div>
      </section>

      {/* CARDS */}
      <section id="solutions" className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="rounded-[28px] border border-[#e6dfd2] bg-white/90 p-8 shadow-[0_10px_30px_rgba(26,58,92,0.08)] md:p-10">
          <h2 className="text-center text-3xl font-semibold tracking-[0.12em] md:text-4xl">
            <span className="text-[#1A3A5C]">READINESS.</span>{" "}
            <span className="text-[#C8A84B]">MEASURED. PROVEN.</span>
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <InfoCard
              image="/logo-columns.png"
              title="Evaluate Participant Readiness"
              description="Measure behavioral, housing, employment, and financial readiness."
            />
            <InfoCard
              image="/logo-shield.png"
              title="Institutional Accountability"
              description="Assess and certify institutional performance and evaluator standards."
            />
            <InfoCard
              image="/logo-seal.png"
              title="Readiness Snapshot"
              description="See readiness across life domains, evidence events, and certified evaluators."
            />
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="mt-8 bg-[#1A3A5C] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:px-10 md:py-20">
          <h3 className="text-4xl font-semibold leading-tight md:text-5xl">
            The <span className="text-[#C8A84B]">Standard</span> for Behavioral Readiness.
          </h3>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-white/85 md:text-xl">
            Legacyline provides a structured, evidence-based approach to measure and certify behavioral readiness at both individual and institutional levels.
          </p>
          <div className="mx-auto mt-10 max-w-md border-t border-[#c8a84b]/40 pt-8">
            <Link href="/intake" className="inline-block rounded-2xl bg-[#C8A84B] px-10 py-5 text-base font-semibold text-white shadow-md transition hover:opacity-95">
              GET STARTED
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
    </main>
  );
}
function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C8A84B] text-[#1A3A5C]">
        <span className="text-xl font-bold">✓</span>
      </div>
      <p className="text-2xl font-medium leading-tight">{text}</p>
    </div>
  );
}

function InfoCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#ece5d8] bg-[#fffdfa] p-8 shadow-sm">
      <div className="flex justify-center">
        <Image src={image} alt={title} width={120} height={120} className="h-[120px] w-[120px] object-contain" />
      </div>
      <h4 className="mt-6 text-center text-3xl font-semibold leading-tight text-[#1A3A5C]">{title}</h4>
      <div className="mx-auto mt-4 h-[2px] w-24 bg-[#C8A84B]" />
      <p className="mt-5 text-center text-lg leading-8 text-[#334866]">{description}</p>
    </div>
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
