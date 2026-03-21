"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

type DomainScore = {
  domain: string;
  score: number;
  notes: string;
};

type ParticipantCard = {
  id: string;
  subject_number: number;
  first_name: string;
  last_name: string;
  dob: string;
  status: string;
  created_at: string;
  domain_scores: DomainScore[];
  eval_status: string;
  flagged: boolean;
};

type LifecycleCounts = {
  registered: number;
  data_collecting: number;
  under_review: number;
  evaluated: number;
  certified: number;
  revoked: number;
};

type CohortSummary = {
  org: { id: string; slug: string; name: string; status: string; created_at: string };
  total_participants: number;
  lifecycle_counts: LifecycleCounts;
  domain_averages: Record<string, number>;
  flagged_count: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL;

const LIFECYCLE_STEPS = [
  { key: "registered", label: "Registered" },
  { key: "data_collecting", label: "Data Collection" },
  { key: "under_review", label: "Under Review" },
  { key: "evaluated", label: "Evaluated" },
  { key: "certified", label: "Certified" },
];

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  registered: { label: "Registered", classes: "bg-blue-500/15 text-blue-400 ring-blue-500/25" },
  data_collecting: { label: "Data Collection", classes: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/25" },
  under_review: { label: "Under Review", classes: "bg-orange-500/15 text-orange-400 ring-orange-500/25" },
  evaluated: { label: "Evaluated", classes: "bg-purple-500/15 text-purple-400 ring-purple-500/25" },
  certified: { label: "Certified", classes: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25" },
  revoked: { label: "Revoked", classes: "bg-red-500/15 text-red-400 ring-red-500/25" },
};

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, classes: "bg-white/10 text-white/60 ring-white/10" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${s.classes}`}>
      {s.label}
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<CohortSummary | null>(null);
  const [participants, setParticipants] = useState<ParticipantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    const slug = localStorage.getItem("org_slug");
    if (!token || !slug) {
      router.replace("/login/organization");
      return;
    }

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [sumRes, partRes] = await Promise.all([
          fetch(`${API}/orgs/${slug}/cohort-summary`, { headers }),
          fetch(`${API}/orgs/${slug}/participants`, { headers }),
        ]);

        if (sumRes.status === 401 || partRes.status === 401) {
          localStorage.removeItem("org_token");
          localStorage.removeItem("org_slug");
          router.replace("/login/organization");
          return;
        }

        const sumData = await sumRes.json();
        const partData = await partRes.json();

        setSummary(sumData);
        setParticipants(partData.participants ?? []);
      } catch {
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
        <div className="text-white/50 text-sm">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  const lc = summary?.lifecycle_counts;
  const da = summary?.domain_averages ?? {};
  const total = summary?.total_participants ?? 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">

        {/* Org Header */}
        <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Organization</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{summary?.org.name}</h2>
              <p className="mt-1 text-sm text-white/55">Pilot Partner · Individual Readiness Program</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/25">
                Active Pilot
              </span>
              <span className="text-xs text-white/35">Est. 2026 · New Mexico</span>
            </div>
          </div>

          {/* Cohort Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Total Participants</div>
              <div className="mt-2 text-lg font-semibold text-[#C8A84B]">{total}</div>
            </div>
            <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Certified</div>
              <div className="mt-2 text-lg font-semibold text-emerald-400">{lc?.certified ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Flagged Domains</div>
              <div className="mt-2 text-lg font-semibold text-red-400">{summary?.flagged_count ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Lifecycle Funnel */}
        <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">
            Participant Lifecycle
          </h3>
          <div className="flex items-end gap-2">
            {LIFECYCLE_STEPS.map((step, i) => {
              const count = lc?.[step.key as keyof LifecycleCounts] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-white/70">{count}</div>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max(pct, 4)}px`,
                      minHeight: "4px",
                      maxHeight: "80px",
                      backgroundColor: i === LIFECYCLE_STEPS.length - 1
                        ? "#34d399"
                        : `rgba(200,168,75,${0.3 + i * 0.15})`,
                    }}
                  />
                  <div className="text-center text-[10px] text-white/40 leading-tight">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Averages */}
        {Object.keys(da).length > 0 && (
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">
              Cohort Domain Averages
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["housing", "workforce", "financial", "behavioral"].map((domain) => {
                const avg = da[domain] ?? null;
                return (
                  <div key={domain} className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/50 capitalize">{domain}</div>
                    {avg !== null ? (
                      <>
                        <div className={`mt-1 text-xl font-bold ${scoreColor(avg)}`}>
                          {avg.toFixed(1)}
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-1.5 rounded-full bg-[#C8A84B]"
                            style={{ width: `${avg}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-sm text-white/30">No data yet</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participant Cards */}
        <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
          <div className="p-7 pb-4">
            <h3 className="text-lg font-semibold tracking-tight">Participant Queue</h3>
            <p className="mt-1 text-xs text-white/45">
              {participants.length} participant{participants.length !== 1 ? "s" : ""} in system
            </p>
          </div>

          {participants.length === 0 ? (
            <div className="px-7 pb-7 text-sm text-white/40">
              No participants yet. They will appear here once intake is complete.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {participants.map((p) => (
                <div key={p.id} className="px-7 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-white/40">#{p.subject_number}</span>
                        <span className="font-semibold">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.flagged && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-500/25">
                            ⚠ Flagged
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-white/40">DOB: {p.dob || "—"}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </div>

                  {/* Domain score pills */}
                  {p.domain_scores && p.domain_scores.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.domain_scores.map((ds) => (
                        <div
                          key={ds.domain}
                          className="rounded-lg bg-black/30 px-3 py-1.5 ring-1 ring-white/10"
                        >
                          <span className="text-[10px] text-white/40 capitalize">{ds.domain}</span>
                          <span className={`ml-2 text-xs font-bold ${scoreColor(ds.score)}`}>
                            {ds.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-white/30">Evaluation pending</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/20 pb-4">
          © 2026 Legacyline · Powered by BRSA doctrine · Deterministic · Auditable · Consent-based
        </div>
      </div>
    </div>
  );
        }
