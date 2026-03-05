import Shell from "../_components/Shell";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
      <div className="text-xs text-white/55">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-2 text-white/70">
          UI scaffold is live. Next step: hydrate this with real subject data
          from Legacyline Core.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Readiness Stage" value="Developing" />
          <Stat label="Registry Standing" value="Yellow" />
          <Stat label="Evidence Events" value="—" />
        </div>

        <div className="mt-6 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Audit Trail</div>
          <div className="mt-2 text-sm text-white/65">
            Every computed value must map to: evidence → rule → output → hash
            chain record.
          </div>
        </div>
      </div>
    </Shell>
  );
}
