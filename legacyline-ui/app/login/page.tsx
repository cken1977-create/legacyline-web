import Link from "next/link";

export default function LoginChooserPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <span className="text-2xl font-semibold tracking-tight text-white">L</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Choose your portal
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Select how you want to access Legacyline
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Individual Portal */}
          <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
            <h2 className="text-lg font-semibold text-white">Individual Portal</h2>
            <p className="mt-2 text-sm text-white/50">
              View your documents, track progress, and see your next steps.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login/individual/signup"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#C8A84B] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#dcc47a]"
              >
                Create Account
              </Link>
              <Link
                href="/login/individual"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Organization Portal */}
          <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
            <h2 className="text-lg font-semibold text-white">Organization Portal</h2>
            <p className="mt-2 text-sm text-white/50">
              Manage participants, evaluations, and reporting.
            </p>
            <Link
              href="/login/organization"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
            >
              Enter Organization Portal
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Legacyline · Powered by BRSA doctrine
        </p>
      </div>
    </div>
  );
}
