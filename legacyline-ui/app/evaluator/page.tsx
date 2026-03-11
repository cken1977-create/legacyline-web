"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type IntakeSubmission = {
  id: string;
  participant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  housing_type: string;
  monthly_housing_cost: string;
  employment_status: string;
  employer_name: string;
  monthly_income: string;
  submitted_at: string;

  // optional future fields
  status?: "pending" | "under_review" | "approved" | "request_info" | "rejected";
  gov_id_url?: string;
  selfie_url?: string;
  bank_statement_url?: string;
};

type FilterValue =
  | "all"
  | "pending"
  | "under_review"
  | "approved"
  | "request_info"
  | "rejected";

function StatusBadge({ status }: { status: string }) {
  const normalized = status || "pending";

  const styles: Record<string, string> = {
    pending: "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/20",
    under_review: "bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/20",
    approved: "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/20",
    request_info: "bg-orange-400/20 text-orange-200 ring-1 ring-orange-400/20",
    rejected: "bg-red-400/20 text-red-200 ring-1 ring-red-400/20",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[normalized] || styles.pending
      }`}
    >
      {normalized.replace("_", " ")}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-white/5 py-2 text-sm">
      <div className="text-white/50">{label}</div>
      <div className="text-white/90">{value || "—"}</div>
    </div>
  );
}

export default function EvaluatorPage() {
  const [rows, setRows] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [actionMessage, setActionMessage] = useState(false);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const data = await api<IntakeSubmission[]>("/admin/intake-submissions");
      const normalized = (data || []).map((row) => ({
        ...row,
        status: row.status || "pending",
      }));
      setRows(normalized);

      if (!selectedId && normalized.length > 0) {
        setSelectedId(normalized[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message || "Failed to load evaluator queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesFilter = filter === "all" ? true : row.status === filter;

      const haystack = [
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.participant_id,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = q ? haystack.includes(q) : true;

      return matchesFilter && matchesQuery;
    });
  }, [rows, query, filter]);

  const selected =
    filteredRows.find((row) => row.id === selectedId) ||
    rows.find((row) => row.id === selectedId) ||
    null;

  async function handleAction(
  status: "approved" | "request_info" | "rejected"
) {
  if (!selected) return;

  try {
    setActionLoading(true);
    setActionMessage("");

    await api(`/admin/intake-submissions/${selected.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        reviewed_by: "Evaluator",
        review_notes:
          status === "approved"
            ? "Approved by evaluator."
            : status === "request_info"
            ? "Additional information requested by evaluator."
            : "Rejected by evaluator.",
      }),
    });

    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id ? { ...row, status } : row
      )
    );

    setActionMessage(
      `Submission ${status.replace("_", " ")} successfully.`
    );

    await loadSubmissions();
  } catch (err: any) {
    setActionMessage(
      err?.message || "Failed to update submission status."
    );
  } finally {
    setActionLoading(false);
  }
    }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Evaluator Console
              </h2>
              <p className="mt-2 max-w-2xl text-white/70">
                Review intake submissions, inspect participant records, and move
                cases through evaluator workflow.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:w-[460px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone, participant ID..."
                className="rounded-xl bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/20"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterValue)}
                className="rounded-xl bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/20"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under review</option>
                <option value="approved">Approved</option>
                <option value="request_info">Request info</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {actionMessage && (
            <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-white/75 ring-1 ring-white/10">
              {actionMessage}
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          {/* LEFT: QUEUE */}
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Submission Queue</div>
                <div className="mt-1 text-xs text-white/55">
                  {loading
                    ? "Loading..."
                    : `${filteredRows.length} visible submission${
                        filteredRows.length === 1 ? "" : "s"
                      }`}
                </div>
              </div>

              <button
                onClick={loadSubmissions}
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
              >
                Refresh
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {loading && (
                <div className="rounded-2xl bg-black/30 p-4 text-sm text-white/60 ring-1 ring-white/10">
                  Loading submissions...
                </div>
              )}

              {!loading && filteredRows.length === 0 && (
                <div className="rounded-2xl bg-black/30 p-4 text-sm text-white/60 ring-1 ring-white/10">
                  No submissions match the current filter.
                </div>
              )}

              {!loading &&
                filteredRows.map((row) => {
                  const active = selected?.id === row.id;

                  return (
                    <button
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`w-full rounded-2xl p-4 text-left ring-1 transition ${
                        active
                          ? "bg-white/10 ring-white/20"
                          : "bg-black/30 ring-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {row.first_name} {row.last_name}
                          </div>
                          <div className="mt-1 text-xs text-white/55">
                            {row.email || "—"}
                          </div>
                          <div className="mt-1 text-xs text-white/40">
                            {row.participant_id}
                          </div>
                        </div>

                        <StatusBadge status={row.status || "pending"} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/60">
                        <div>
                          <div className="text-white/35">Employment</div>
                          <div className="mt-1">{row.employment_status || "—"}</div>
                        </div>
                        <div>
                          <div className="text-white/35">Housing</div>
                          <div className="mt-1">{row.housing_type || "—"}</div>
                        </div>
                        <div>
                          <div className="text-white/35">Income</div>
                          <div className="mt-1">
                            {row.monthly_income ? `$${row.monthly_income}` : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/35">Submitted</div>
                          <div className="mt-1">
                            {row.submitted_at
                              ? new Date(row.submitted_at).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* RIGHT: DETAIL */}
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            {!selected ? (
              <div className="rounded-2xl bg-black/30 p-6 text-sm text-white/60 ring-1 ring-white/10">
                Select a submission to review.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                      Intake Review
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {selected.first_name} {selected.last_name}
                    </h3>
                    <div className="mt-2 text-sm text-white/55">
                      Participant ID: {selected.participant_id}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status={selected.status || "pending"} />
                    <button
                      onClick={() =>
                        window.open(`/intake/${selected.participant_id}`, "_blank")
                      }
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                    >
                      Open Intake
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white">
                      Participant Details
                    </div>

                    <div className="mt-4">
                      <DetailRow label="Email" value={selected.email} />
                      <DetailRow label="Phone" value={selected.phone} />
                      <DetailRow label="DOB" value={selected.dob} />
                      <DetailRow
                        label="Address"
                        value={[
                          selected.address,
                          selected.city,
                          selected.state,
                          selected.zip,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white">
                      Stability Snapshot
                    </div>

                    <div className="mt-4">
                      <DetailRow label="Housing" value={selected.housing_type} />
                      <DetailRow
                        label="Housing Cost"
                        value={
                          selected.monthly_housing_cost
                            ? `$${selected.monthly_housing_cost}`
                            : "—"
                        }
                      />
                      <DetailRow
                        label="Employment"
                        value={selected.employment_status}
                      />
                      <DetailRow label="Employer" value={selected.employer_name} />
                      <DetailRow
                        label="Monthly Income"
                        value={
                          selected.monthly_income
                            ? `$${selected.monthly_income}`
                            : "—"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                  <div className="text-sm font-semibold text-white">
                    Uploaded Documents
                  </div>
                  <div className="mt-2 text-sm text-white/55">
                    Ready for direct file links once the admin detail endpoint
                    returns document URLs.
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <DocStub title="Government ID" />
                    <DocStub title="Selfie" />
                    <DocStub title="Bank Statement" />
                  </div>
                </div>

                <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
                  <div className="text-sm font-semibold text-white">
                    Evaluator Actions
                  </div>
                  <div className="mt-2 text-sm text-white/55">
                    These buttons are production-shaped and ready to wire into
                    the backend status transition endpoint.
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                   <button
                   onClick={() => handleAction("approved")}
                   disabled={actionLoading}
                   className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
                    >
                   {actionLoading ? "Working..." : "Approve"}
                   </button>

                   <button
                   onClick={() => handleAction("request_info")}
                   disabled={actionLoading}
                   className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50"
                   >
                   {actionLoading ? "Working..." : "Request Info"}
                   </button>

                   <button
                    onClick={() => handleAction("rejected")}
                    disabled={actionLoading}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
                       >
                     {actionLoading ? "Working..." : "Reject"}
                   </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function DocStub({ title }: { title: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-2 text-xs text-white/50">Pending document URL wiring</div>
    </div>
  );
      }
