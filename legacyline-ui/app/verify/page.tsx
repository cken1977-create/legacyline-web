import Shell from "../_components/Shell";

export default function VerifyPage() {
  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Verify Record</h2>
        <p className="mt-2 text-white/70">
          Enter a Registry ID to verify standing. Next step: call Core API /
          registry endpoint.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-white/25"
            placeholder="BRSA-26-XXXXXXXX"
          />
          <button
            className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            disabled
          >
            Verify (API next)
          </button>
        </div>

        <div className="mt-7 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Standing</div>
          <div className="mt-2 text-sm text-white/65">
            Green / Yellow / Red — evidence-backed readiness classification.
          </div>
        </div>
      </div>
    </Shell>
  );
}
