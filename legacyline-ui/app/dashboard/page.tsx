import Link from "next/link";
import Shell from "../_components/Shell";

type Participant = {
  id: string;
  subject_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
  created_at: string;
};

async function getParticipants(): Promise<Participant[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/intake-submissions`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const all = data.submissions ?? data ?? [];
    
    // Only show valid BRSA lifecycle participants
    const validStatuses = [
      "registered",
      "data_collecting", 
      "under_review",
      "evaluated",
      "certified",
      "revoked"
    ];
    
    return all.filter((p: Participant) => 
      validStatuses.includes(p.status) && 
      p.first_name && 
      p.first_name.trim() !== ""
    );
  } catch {
    return [];
  }
}

function StatCard({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "gold" | "neutral";
}) {
  return (
    <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
      <div className="text-xs text-white/50">{label}</div>
      <div className={`mt-2 text-lg font-semibold tracking-tight ${accent === "gold" ? "text-[#C8A84B]" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    registered: { label: "Registered", classes: "bg-blue-500/15 text-blue-400 ring-blue-500/25" },
    data_collecting: { label: "Data Collection", classes: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/25" },
    under_review: { label: "Under Review", classes: "bg-orange-500/15 text-orange-400 ring-orange-500/25" },
    evaluated: { label: "Evaluated", classes: "bg-purple-500/15 text-purple-400 ring-purple-500/25" },
    certified: { label: "Certified", classes: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25" },
    revoked: { label: "Revoked", classes: "bg-red-500/15 text-red-400 ring-red-500/25" },
  };
  const config = map[status] ?? { label: status, classes: "bg-white/10 text-white/60 ring-white/10" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${config.classes}`}>
      {config.label}
    </span>
  );
}

export default async function DashboardPage() {
  const participants = await getParticipants();

  return (
    <Shell>
      <div className="space-y-6">

        {/* Org Identity Block */}
        <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Organization</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Vizionz Sankofa</h2>
              <p className="mt-1 text-sm text-white/55">Pilot Partner · Individual Readiness Program</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/25">
                Active Pilot
              </span>
              <span className="text-xs text-white/35">Est. 2026 · New Mexico</span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Evaluator Status" value="BRSA Certified" accent="gold" />
            <StatCard label="Modules Completed" value="8 / 8" accent="gold" />
            <StatCard label="Passing Score" value="80% Required" accent="neutral" />
          </div>
        </div>

        {/* Participant Queue */}
        {participants.length === 0 ? (
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold tracking-tight">Participant Queue</h3>
            <p className="mt-4 text-sm text-white/50">
              No participants yet. They will appear here once intake is complete.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
            <div className="p-7 pb-4">
              <h3 className="text-lg font-semibold tracking-tight">Participant Queue</h3>
              <p className="mt-1 text-xs text-white/45">
                {participants.length} participant{participants.length !== 1 ? "s" : ""} in system
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-white/10 text-left text-xs text-white/40">
                    <th className="px-7 py-3 font-medium">Subject #</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Date of Birth</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-7 py-4 font-mono text-xs text-white/60">{p.subject_number ?? "—"}</td>
                      <td className="px-4 py-4 font-medium">{p.first_name} {p.last_name}</td>
                      <td className="px-4 py-4 text-white/60">
                        {p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-4 text-xs text-white/50">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/subject/${p.id}`}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 ring-1 ring-white/10 transition-colors"
                        >
                          Open Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
        }
