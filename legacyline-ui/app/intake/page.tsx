import Shell from "../_components/Shell";

export default function IntakePage() {
  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Intake</h2>
        <p className="mt-2 text-white/70">
          This will create a subject record and start evidence collection.
          Next step: connect to Legacyline Core API.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Subject Creation</div>
            <div className="mt-2 text-sm text-white/65">
              Deterministic subject number + registry ID binding.
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Consent + Scope</div>
            <div className="mt-2 text-sm text-white/65">
              Consent-based, longitudinal behavioral data. No lending decisions.
            </div>
          </div>
        </div>

        <button
  onClick={() => createSubject()}
  className="mt-7 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
>
  Create Subject
</button>
          Create Subject (API next)
        </button>
      </div>
    </Shell>
  );
}
