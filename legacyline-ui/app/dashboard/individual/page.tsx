export default function IndividualDashboardPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-white/50">Legacyline</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Individual Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50">
            View your progress, documents, and next steps.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/50">Progress Status</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Not Started</h2>
            <p className="mt-2 text-sm text-white/40">
              Your readiness progress will appear here.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/50">Documents</p>
            <h2 className="mt-3 text-xl font-semibold text-white">0 Uploaded</h2>
            <p className="mt-2 text-sm text-white/40">
              Your uploaded and required documents will appear here.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/50">Next Step</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Pending</h2>
            <p className="mt-2 text-sm text-white/40">
              Your next required action will appear here.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/50">Messages</p>
            <h2 className="mt-3 text-xl font-semibold text-white">No Updates</h2>
            <p className="mt-2 text-sm text-white/40">
              Notices and updates will appear here.
            </p>
          </div>
        </div>

        {/* Lower Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white">Checklist</h3>
            <p className="mt-2 text-sm text-white/50">
              Your completion checklist will appear here.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="mt-2 text-sm text-white/50">
              Your latest actions and status updates will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
