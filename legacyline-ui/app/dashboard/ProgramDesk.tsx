"use client";
// Program Desk — an organization's cohort at a glance (Assay Office, paper).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "../../lib/brand";
import { core, signOut } from "../../lib/core";
import { Wordmark } from "../_components/assay";
import { IconArrowRight, IconFlag, IconLogout, IconSearch } from "../_components/assay/icons";

type Person = { id: string; subject_number: number; first_name: string; last_name: string; status: string; created_at: string; eval_status?: string; flagged?: boolean };
type Summary = { org: { name: string; slug: string; created_at: string }; total_participants: number; lifecycle_counts: Record<string, number>; flagged_count: number };

const STAGES = [["registered", "Registered"], ["data_collecting", "Gathering evidence"], ["under_review", "Waiting for review"], ["evaluated", "Reviewed"], ["certified", "Certified"]] as const;
const CHIP: Record<string, string> = { registered: "chip-neutral", data_collecting: "chip-amber", under_review: "chip-engine", evaluated: "chip-proficient", certified: "chip-certified", revoked: "chip-neutral" };
const LABEL: Record<string, string> = Object.fromEntries([...STAGES, ["revoked", "Revoked"]]);
const days = (d: string) => Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 864e5));

export default function ProgramDesk({ demo }: { demo?: { summary: Summary; people: Person[] } }) {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(demo?.summary ?? null);
  const [people, setPeople] = useState<Person[]>(demo?.people ?? []);
  const [loading, setLoading] = useState(!demo);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");

  useEffect(() => {
    if (demo) return;
    const slug = localStorage.getItem("org_slug");
    if (!slug) { router.replace("/login/organization"); return; }
    Promise.all([core<Summary>(`/orgs/${slug}/cohort-summary`), core<any>(`/orgs/${slug}/participants`)])
      .then(([s, p]) => { setSummary(s); setPeople(Array.isArray(p) ? p : p?.participants ?? []); })
      .catch((e) => { if (e?.status === 401) { signOut("org"); router.replace("/login/organization"); } else setErr("Your cohort didn't load. Try again in a moment."); })
      .finally(() => setLoading(false));
  }, [demo, router]);

  const shown = useMemo(() => people.filter((p) => (stage === "all" || p.status === stage) && `${p.first_name} ${p.last_name}`.toLowerCase().includes(q.toLowerCase())), [people, q, stage]);
  const total = summary?.total_participants ?? people.length;
  const lc = summary?.lifecycle_counts ?? {};

  return (
    <div className="ao-paper min-h-screen">
      <header className="flex h-14 items-center justify-between px-4 md:px-8" style={{ background: "var(--card)", borderBottom: "1px solid var(--linen)" }}>
        <div className="flex items-center gap-3"><Wordmark /><span className="ao-meta hidden sm:inline">Program Desk</span></div>
        <div className="flex items-center gap-1">
          <Link href="/app/org" className="ao-btn ao-btn-quiet ao-btn-sm">Our organization record</Link>
          <button aria-label="Sign out" className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => { if (!demo) signOut("org").then(() => router.push("/login/organization")); }}><IconLogout size={16} /><span className="hidden sm:inline">Sign out</span></button>
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-4 pb-20 pt-8 md:px-8">
        <p className="ao-eyebrow">Cohort</p>
        <h1 className="ao-h1 mt-1" style={{ fontSize: 32 }}>{summary?.org.name ?? (loading ? "Loading…" : "Your program")}</h1>
        {err && <p role="alert" className="mt-4 rounded-[8px] px-4 py-3" style={{ background: "var(--amber-tint)" }}>{err}</p>}

        <section aria-label="Where people are" className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">
          {STAGES.map(([k, l]) => {
            const n = lc[k] ?? people.filter((p) => p.status === k).length;
            return (
              <button key={k} onClick={() => setStage(stage === k ? "all" : k)} aria-pressed={stage === k} className="ao-card p-4 text-left" style={{ cursor: "pointer", outline: stage === k ? "2px solid var(--action)" : undefined }}>
                <p className="ao-meta">{l}</p>
                <p className="ao-mono mt-1" style={{ fontSize: 28, fontWeight: 500 }}>{n}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--linen)" }}><div style={{ width: `${total ? (n / total) * 100 : 0}%`, height: "100%", background: k === "certified" ? "var(--seal)" : "var(--ink-2)" }} /></div>
              </button>
            );
          })}
        </section>

        <section aria-labelledby="people" className="ao-card mt-8 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--linen)" }}>
            <h2 id="people" className="ao-h2 flex-1">People <span className="ao-mono ao-meta">{shown.length}/{people.length}</span></h2>
            <label className="relative"><span className="sr-only">Search people</span><span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-3)" }}><IconSearch size={16} /></span><input className="ao-input" style={{ height: 40, paddingLeft: 34, width: 240 }} placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          </div>
          {loading ? <p className="ao-meta p-6">Loading your cohort…</p> : shown.length === 0 ? (
            <div className="p-10 text-center"><p className="ao-h2" style={{ fontSize: 17 }}>{people.length ? "No one matches" : "No one yet"}</p><p className="ao-body-2 mt-1">{people.length ? "Try a different search or stage." : `People appear here when they start a ${BRAND.name} record with your program.`}</p></div>
          ) : (
            <ul>
              {shown.map((p) => (
                <li key={p.id} className="ao-row flex items-center gap-4 px-5" style={{ minHeight: 56, borderTop: "1px solid var(--linen)" }}>
                  <span className="ao-mono ao-meta w-10">#{p.subject_number}</span>
                  <span className="min-w-0 flex-1 truncate" style={{ fontWeight: 500 }}>{p.first_name} {p.last_name}</span>
                  {p.flagged && <span className="ao-chip chip-amber hidden sm:inline-flex"><IconFlag size={12} />Needs attention</span>}
                  <span className={`ao-chip ${CHIP[p.status] ?? "chip-neutral"}`}>{LABEL[p.status] ?? p.status}</span>
                  <span className="ao-mono ao-meta hidden w-14 text-right md:inline">{days(p.created_at)}d</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="ao-meta mt-4">Standings and evidence are visible to you only for people who shared a packet with your program. <Link className="ao-link" href="/obr">About organization records <IconArrowRight size={12} /></Link></p>
      </main>
    </div>
  );
}
