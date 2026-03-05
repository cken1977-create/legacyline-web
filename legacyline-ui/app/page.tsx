import Link from "next/link";
import Shell from "./_components/Shell";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Card({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-white/65">{desc}</div>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 group-hover:bg-white/10">
          {cta} →
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <Shell>
      <section className="rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-7 ring-1 ring-white/10 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          <Pill>Evidence-based</Pill>
          <Pill>Deterministic</Pill>
          <Pill>No credit scoring</Pill>
          <Pill>Audit-defensible</Pill>
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Readiness you can prove.
        </h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Legacyline is the individual readiness engine implementing BRSA’s
          standard. We don’t guess. We document behavior, verify evidence, and
          compute readiness using governed rules — over time.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/intake"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
          >
            Begin Intake
          </Link>
          <Link
            href="/verify"
            className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            Verify Record
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 ring-1 ring-white/10 hover:bg-white/10"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card
          title="Intake"
          desc="Create a subject record, consent, and start evidence collection."
          href="/intake"
          cta="Start"
        />
        <Card
          title="Verify"
          desc="Confirm registry standing using a Registry ID."
          href="/verify"
          cta="Verify"
        />
        <Card
          title="Dashboard"
          desc="See readiness stage, signals, and the audit trail (UI-first, API next)."
          href="/dashboard"
          cta="Open"
        />
      </section>

      <section className="mt-10 rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <div className="text-sm font-semibold text-white/80">
          What we built (so far)
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-base font-semibold">BRSA Authority Layer</div>
            <div className="mt-2 text-sm text-white/65">
              Registry + doctrine + standards + evaluator certification rules.
              Authoritative. Not operational.
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-base font-semibold">Legacyline Engine</div>
            <div className="mt-2 text-sm text-white/65">
              Individual onboarding + case workflow + readiness computation.
              Operational. Evidence-first.
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
