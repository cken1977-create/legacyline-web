// app/evaluator/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";
import { StateBadge } from "./components/StateBadge";
import { EvaluatorHeader } from "./components/EvaluatorHeader";

type Evaluator = {
  evaluator_id: string;
  full_name: string;
  email: string;
  organization: string;
  status: string;
  certified: boolean;
  certified_at: string | null;
};

type Participant = {
  id: string;
  subject_number: number;
  registry_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  organization: string;
  status: string;
  created_at: string;
};

type ReadinessSnapshot = {
  participant_id: string;
  readiness: number | null;
  trajectory: string | null;
  ruleset: string | null;
  computed_at: string | null;
};

type StateHistoryEntry = {
  id: string;
  participant_id: string;
  from_state: string;
  to_state: string;
  actor: string;
  reason: string;
  occurred_at: string;
};

type View = "dashboard" | "queue" | "profile";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  registered:      ["data_collecting"],
  data_collecting: ["under_review"],
  under_review:    ["data_collecting", "evaluated"],
  evaluated:       ["certified"],
  certified:       ["revoked"],
  revoked:         [],
};

const TRANSITION_REQUIRES_REASON = new Set(["revoked"]);

function scoreLabel(score: number): string {
  if (score >= 80) return "Ready";
  if (score >= 65) return "Proficient";
  if (score >= 50) return "Developing";
  if (score >= 35) return "Early Stage";
  return "Pre-Readiness";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const C = {
  navy: "#1A3A5C", navyDark: "#112540", navyDeep: "#0B1C30",
  gold: "#C8A84B", goldDim: "#8A6E2F", teal: "#2DD4BF",
  white: "#F4F6F9", gray: "#8899AA", grayLight: "#C5D0DC",
  surface: "#162E4A", surfaceHi: "#1E3D5A",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{children}</div>;
}

function Card({ children, gold = false, style = {} }: { children: React.ReactNode; gold?: boolean; style?: React.CSSProperties }) {
  return <div style={{ background: C.surface, border: `1px solid ${gold ? C.gold + "44" : C.surfaceHi}`, borderRadius: 8, padding: 20, ...style }}>{children}</div>;
}

function MetricCard({ label, value, highlight, onClick }: { label: string; value: number; highlight?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: 1, minWidth: 110, background: C.surface, border: `1px solid ${highlight ? C.gold + "55" : C.surfaceHi}`, borderRadius: 8, padding: "16px 18px", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: highlight ? C.gold : C.white, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 10, color: C.gray, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.surfaceHi}` }}>
      <span style={{ fontSize: 11, color: C.gray }}>{label}</span>
      <span style={{ fontSize: 11, color: C.white }}>{value || "—"}</span>
    </div>
  );
}

function Dashboard({ participants, evaluator, onNav, onOpenProfile }: {
  participants: Participant[];
  evaluator: Evaluator | null;
  onNav: (v: "queue") => void;
  onOpenProfile: (p: Participant) => void;
}) {
  const needsAction = participants.filter((p) => p.status === "under_review").length;
  const collecting  = participants.filter((p) => p.status === "data_collecting").length;
  const certified   = participants.filter((p) => p.status === "certified").length;
  const total       = participants.length;
  const recent = [...participants]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>
          Welcome back{evaluator ? `, ${evaluator.full_name.split(" ")[0]}` : ""}.
        </div>
        <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>Caseload overview.</div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <MetricCard label="Total Participants" value={total} onClick={() => onNav("queue")} />
        <MetricCard label="Needs Action" value={needsAction} highlight onClick={() => onNav("queue")} />
        <MetricCard label="Collecting" value={collecting} onClick={() => onNav("queue")} />
        <MetricCard label="Certified" value={certified} onClick={() => onNav("queue")} />
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionTitle>Recent Participants</SectionTitle>
          <button onClick={() => onNav("queue")} style={{ background: "none", border: "none", color: C.gold, fontSize: 11, cursor: "pointer" }}>
            View Queue →
          </button>
        </div>
        {recent.map((p, i) => (
          <div key={p.id} onClick={() => onOpenProfile(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < recent.length - 1 ? `1px solid ${C.surfaceHi}` : "none", cursor: "pointer" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.first_name} {p.last_name}</span>
              <span style={{ fontSize: 11, color: C.gray, marginLeft: 10 }}>{p.registry_id}</span>
            </div>
            <StateBadge state={p.status} />
            <div style={{ fontSize: 11, color: C.gray, width: 70, textAlign: "right" }}>{relativeTime(p.created_at)}</div>
          </div>
        ))}
        {recent.length === 0 && <div style={{ fontSize: 13, color: C.gray }}>No participants yet.</div>}
      </Card>
    </div>
  );
}

function DecisionQueue({ participants, onOpenProfile }: {
  participants: Participant[];
  onOpenProfile: (p: Participant) => void;
}) {
  const [filter, setFilter] = useState<string>("under_review");
  const [query, setQuery] = useState("");

  const filtered = participants.filter((p) => {
    const matchState = filter === "all" || p.status === filter;
    const q = query.trim().toLowerCase();
    const haystack = [p.first_name, p.last_name, p.registry_id, p.id].join(" ").toLowerCase();
    return matchState && (!q || haystack.includes(q));
  });

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>Decision Queue</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{filtered.length} case{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or ID..."
            style={{ padding: "7px 12px", borderRadius: 4, fontSize: 12, background: C.navyDeep, border: `1px solid ${C.surfaceHi}`, color: C.white, outline: "none", width: 200 }} />
          {["under_review", "data_collecting", "all"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: filter === f ? C.gold : "none", color: filter === f ? C.navyDeep : C.gray, border: `1px solid ${filter === f ? C.gold : C.surfaceHi}` }}>
              {f === "under_review" ? "Needs Action" : f === "data_collecting" ? "Collecting" : "All"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.surfaceHi}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 140px 160px 110px 110px", padding: "10px 20px", background: C.navyDeep, borderBottom: `1px solid ${C.surfaceHi}` }}>
          {["Registry ID", "Name", "State", "Organization", "Last Updated", ""].map((h) => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", color: C.gray, fontSize: 13 }}>No cases match the current filter.</div>}
        {filtered.map((p, i) => (
          <div key={p.id}
            style={{ display: "grid", gridTemplateColumns: "160px 1fr 140px 160px 110px 110px", padding: "13px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? `1px solid ${C.surfaceHi}` : "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceHi)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", fontWeight: 600 }}>{p.registry_id || "—"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.first_name} {p.last_name}</div>
              <div style={{ fontSize: 10, color: C.gray }}>{p.id}</div>
            </div>
            <div><StateBadge state={p.status} /></div>
            <div style={{ fontSize: 11, color: C.grayLight }}>{p.organization || "—"}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{relativeTime(p.created_at)}</div>
            <div>
              <button onClick={() => onOpenProfile(p)}
                style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "none", color: C.gold, border: `1px solid ${C.gold}55` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.navyDeep; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.gold; }}>
                Open Case
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  }
  function ParticipantProfile({ participant, onBack, actorEmail }: {
  participant: Participant;
  onBack: () => void;
  actorEmail: string;
}) {
  const [readiness, setReadiness] = useState<ReadinessSnapshot | null>(null);
  const [history, setHistory] = useState<StateHistoryEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedTo, setSelectedTo] = useState<string>("");
  const [reason, setReason] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [currentStatus, setCurrentStatus] = useState(participant.status);
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [rdx, hx] = await Promise.allSettled([
        api<ReadinessSnapshot>(`/participants/${participant.id}/readiness`),
        api<{ history: StateHistoryEntry[] }>(`/participants/${participant.id}/state-history`),
      ]);
      if (rdx.status === "fulfilled") setReadiness(rdx.value);
      if (hx.status === "fulfilled") setHistory(hx.value.history ?? []);
    } finally {
      setLoadingData(false);
    }
  }, [participant.id]);

  useEffect(() => {
    fetchData();
    setCurrentStatus(participant.status);
    setSelectedTo("");
    setReason("");
    setTransitionMsg(null);
  }, [participant.id, fetchData]);

  async function handleTransition() {
    if (!selectedTo) return;
    if (TRANSITION_REQUIRES_REASON.has(selectedTo) && !reason.trim()) {
      setTransitionMsg({ ok: false, text: "A reason is required for this transition." });
      return;
    }
    setTransitioning(true);
    setTransitionMsg(null);
    try {
      await api(`/participants/${participant.id}/state`, {
        method: "POST",
        body: JSON.stringify({ to: selectedTo, reason: reason.trim() }),
        headers: { "X-Actor": actorEmail },
      });
      setCurrentStatus(selectedTo);
      setSelectedTo("");
      setReason("");
      setTransitionMsg({ ok: true, text: `Transitioned to ${selectedTo.replace(/_/g, " ")}.` });
      await fetchData();
    } catch (err: any) {
      setTransitionMsg({ ok: false, text: err?.message ?? "Transition failed." });
    } finally {
      setTransitioning(false);
    }
  }

  const score = readiness?.readiness ?? null;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1080, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 12, padding: 0, marginBottom: 16 }}>
        ← Back to Queue
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{participant.first_name} {participant.last_name}</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 3 }}>DOB: {participant.dob} · {participant.id}</div>
                <div style={{ fontSize: 11, color: C.gold, marginTop: 2, fontFamily: "monospace" }}>{participant.registry_id || "Registry ID pending"}</div>
              </div>
              <StateBadge state={currentStatus} large />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.surfaceHi}` }}>
              <div>
                <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>Organization</div>
                <div style={{ fontSize: 12, color: C.white, marginTop: 2 }}>{participant.organization || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>Member Since</div>
                <div style={{ fontSize: 12, color: C.white, marginTop: 2 }}>{new Date(participant.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</div>
                <div style={{ fontSize: 12, color: C.white, marginTop: 2 }}>{participant.email || "—"}</div>
              </div>
            </div>
          </Card>

          {!loadingData && (
            <Card style={{ border: `1px solid ${C.teal}33` }}>
              <SectionTitle>Readiness Score</SectionTitle>
              {score !== null ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: C.teal, fontFamily: "monospace", lineHeight: 1 }}>{score}</div>
                    <div style={{ paddingBottom: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{scoreLabel(score)}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
                        Trajectory:{" "}
                        <span style={{ color: readiness?.trajectory === "improving" ? "#34D399" : C.grayLight, textTransform: "capitalize" }}>
                          {readiness?.trajectory ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: C.gray }}>
                    Computed by Legacyline Behavioral Pattern Engine ·{" "}
                    {readiness?.computed_at ? new Date(readiness.computed_at).toLocaleString() : "—"}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.gray }}>No readiness snapshot yet. Compute one after evidence is collected.</div>
              )}
            </Card>
          )}

          <Card>
            <SectionTitle>State History</SectionTitle>
            {loadingData && <div style={{ fontSize: 12, color: C.gray }}>Loading...</div>}
            {!loadingData && history.length === 0 && <div style={{ fontSize: 12, color: C.gray }}>No history recorded.</div>}
            {history.map((h, i) => (
              <div key={h.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < history.length - 1 ? `1px solid ${C.surfaceHi}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {h.from_state && h.from_state !== "none" && (
                      <><StateBadge state={h.from_state} /><span style={{ color: C.gray, fontSize: 11 }}>→</span></>
                    )}
                    <StateBadge state={h.to_state} />
                  </div>
                  <div style={{ fontSize: 10, color: C.gray }}>{new Date(h.occurred_at).toLocaleString()}</div>
                </div>
                {h.reason && <div style={{ fontSize: 11, color: C.gray, marginTop: 3 }}>{h.reason}</div>}
                <div style={{ fontSize: 10, color: h.actor === "system" ? C.gray : C.gold, marginTop: 3 }}>
                  {h.actor === "system" ? "System" : `Evaluator: ${h.actor}`}
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card gold>
            <SectionTitle>Evaluator Actions</SectionTitle>
            {transitionMsg && (
              <div style={{ padding: "10px 12px", borderRadius: 4, marginBottom: 14, fontSize: 12, background: transitionMsg.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${transitionMsg.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`, color: transitionMsg.ok ? "#34D399" : "#F87171" }}>
                {transitionMsg.text}
              </div>
            )}
            {allowed.length > 0 ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>Current state</div>
                  <StateBadge state={currentStatus} large />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>Advance to</div>
                  {allowed.length === 1 ? (
                    <StateBadge state={allowed[0]} large />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {allowed.map((s) => (
                        <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                          <input type="radio" name="transition" value={s} checked={selectedTo === s} onChange={() => setSelectedTo(s)} style={{ accentColor: C.gold }} />
                          <StateBadge state={s} large />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>
                    Reason{" "}
                    <span style={{ color: (selectedTo && TRANSITION_REQUIRES_REASON.has(selectedTo)) ? "#F87171" : C.gray }}>
                      {selectedTo && TRANSITION_REQUIRES_REASON.has(selectedTo) ? "(required)" : "(optional)"}
                    </span>
                  </div>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Document rationale..." rows={3}
                    style={{ width: "100%", padding: 10, borderRadius: 4, background: C.navyDeep, border: `1px solid ${C.surfaceHi}`, color: C.white, fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <button onClick={handleTransition} disabled={transitioning || (allowed.length > 1 && !selectedTo)}
                  style={{ width: "100%", padding: "9px", borderRadius: 4, cursor: "pointer", background: (transitioning || (allowed.length > 1 && !selectedTo)) ? C.surfaceHi : C.gold, color: C.navyDeep, fontSize: 12, fontWeight: 800, border: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {transitioning ? "Recording..." : allowed.length === 1 ? `Advance to ${allowed[0].replace(/_/g, " ")}` : selectedTo ? `Transition to ${selectedTo.replace(/_/g, " ")}` : "Select transition"}
                </button>
              </>
            ) : (
              <div style={{ fontSize: 12, color: C.gray }}>
                No transitions available from <strong style={{ color: C.white }}>{currentStatus.replace(/_/g, " ")}</strong>.
              </div>
            )}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.surfaceHi}`, display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: 8, borderRadius: 4, cursor: "pointer", background: "none", color: C.gray, border: `1px solid ${C.surfaceHi}`, fontSize: 11, fontWeight: 600 }}>Add Note</button>
              <button style={{ flex: 1, padding: 8, borderRadius: 4, cursor: "pointer", background: "none", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", fontSize: 11, fontWeight: 600 }}>Flag for Admin</button>
            </div>
          </Card>

          <Card>
            <SectionTitle>Details</SectionTitle>
            <KV label="Phone" value={participant.phone} />
            <KV label="Subject #" value={participant.subject_number?.toString()} />
            <KV label="Participant ID" value={participant.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EvaluatorPage() {
  const [view, setView] = useState<View>("dashboard");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedP, setSelectedP] = useState<Participant | null>(null);
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const PILOT_EVALUATOR_EMAIL = process.env.NEXT_PUBLIC_EVALUATOR_EMAIL ?? "";

  useEffect(() => {
    async function boot() {
      setLoading(true);
      try {
        const ps = await api<Participant[]>("/participants");
        setParticipants(ps ?? []);
        if (PILOT_EVALUATOR_EMAIL) {
          try {
            const ev = await api<Evaluator>(`/evaluators/lookup?email=${encodeURIComponent(PILOT_EVALUATOR_EMAIL)}`);
            setEvaluator(ev);
          } catch {}
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to load.");
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  function openProfile(p: Participant) {
    setSelectedP(p);
    setView("profile");
  }

  function handleNav(v: "dashboard" | "queue") {
    setView(v);
    setSelectedP(null);
  }

  return (
    <Shell>
      <div style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#112540" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; }
          textarea::placeholder { color: #8899AA; }
          input::placeholder { color: #8899AA; }
        `}</style>
        <EvaluatorHeader evaluator={evaluator} activeView={view} onNav={handleNav} />
        {loading && <div style={{ padding: 40, textAlign: "center", color: "#8899AA", fontSize: 13 }}>Loading participants...</div>}
        {!loading && error && <div style={{ padding: 40, textAlign: "center", color: "#F87171", fontSize: 13 }}>{error}</div>}
        {!loading && !error && view === "dashboard" && <Dashboard participants={participants} evaluator={evaluator} onNav={handleNav} onOpenProfile={openProfile} />}
        {!loading && !error && view === "queue" && <DecisionQueue participants={participants} onOpenProfile={openProfile} />}
        {!loading && !error && view === "profile" && selectedP && <ParticipantProfile participant={selectedP} onBack={() => setView("queue")} actorEmail={evaluator?.email ?? "evaluator"} />}
      </div>
    </Shell>
  );
                  }
