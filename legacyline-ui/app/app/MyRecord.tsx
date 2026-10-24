"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND } from "../../lib/brand";
import { CoreError, core, coreSafe, currentParticipantId, hasIndividualSession, signOut as endSession } from "../../lib/core";
import { bandFor } from "../../lib/bands";
import { AREAS, RULESET_LABEL, type Run, fmtMT } from "../../lib/frari";
import { STATUS_STEPS, pointsMeta, summarize, type SlotState } from "../../lib/record";
import { BandChip, Completeness, CopyMono, DemoBanner, Hallmark, type HallmarkState, StatusWord, Wordmark } from "../_components/assay";
import { IconArrowRight, IconChevron, IconLock, IconLogout, IconRecord, IconShare, IconShelf, IconShield, IconUpload, IconUser } from "../_components/assay/icons";


type Tab = "record" | "evidence" | "share" | "me";
export type RecordData = {
  participantId: string; firstName: string; lastName: string; email: string; registryId: string; status: string; createdAt?: string;
  intake: Record<string, any> | null; run: Run | null;
};

export default function MyRecord({ demo }: { demo?: RecordData }) {
  const router = useRouter();
  const [data, setData] = useState<RecordData | null>(demo ?? null);
  const [loading, setLoading] = useState(!demo);
  const [loadNote, setLoadNote] = useState("");
  const [tab, setTab] = useState<Tab>("record");
  const [hall, setHall] = useState<HallmarkState>("current");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (demo) return;
    const pid = currentParticipantId();
    if (!hasIndividualSession() || !pid) { router.replace("/app/login"); return; }
    (async () => {
      const get = async (p: string) => { try { return await core(p); } catch (e) { return e instanceof CoreError && e.status === 401 ? "401" : null; } };
      const [vault, me, intake, hist] = await Promise.all([
        get(`/participants/${pid}/vault`), get(`/auth/individual/me`), get(`/intake/by-participant/${pid}`), get(`/frari/history/individual/${pid}`),
      ]);
      if (me === "401" || vault === "401") { await endSession("individual"); router.replace("/app/login"); return; }
      const runs: Run[] = Array.isArray(hist?.runs) ? hist.runs : Array.isArray(hist) ? hist : [];
      setData({
        participantId: pid,
        firstName: vault?.first_name ?? localStorage.getItem("user_first_name") ?? "",
        lastName: vault?.last_name ?? localStorage.getItem("user_last_name") ?? "",
        email: me?.email ?? localStorage.getItem("user_email") ?? "",
        registryId: me?.registry_id ?? "",
        status: vault?.current_status ?? "registered",
        createdAt: vault?.created_at ?? "",
        intake: intake && intake !== "401" ? intake : null,
        run: runs[0] ?? null,
      });
      if (!vault) setLoadNote("Part of your record didn't load. What you see may be incomplete; try again in a moment.");
      setLoading(false);
    })();
  }, [demo, router]);

  const sum = useMemo(() => summarize(data?.intake ?? null, data?.run ?? null), [data]);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2600); }

  async function verify() {
    if (!data?.run) return;
    setHall("running");
    if (demo) { setTimeout(() => setHall("verified"), 1400); setTimeout(() => setHall("current"), 5400); return; }
    try {
      const j = await coreSafe<{ determinism_check: boolean }>(`/frari/assess/${data.run.id}/verify`);
      setHall(j?.determinism_check ? "verified" : "stale");
      if (!j?.determinism_check) flash("Couldn't reproduce this run right now. Your reviewer has been told.");
    } catch { setHall("current"); flash("Couldn't reach the engine. Try again shortly."); }
    setTimeout(() => setHall("current"), 4000);
  }

  function signOut() {
    if (demo) { flash("Demo: sign-out is disabled on the sample record."); return; }
    endSession("individual").then(() => router.push("/app/login"));
  }

  const actHref = (s: SlotState) => demo ? undefined : `/intake?slot=${s.key}`;

  if (loading || !data) return <Skeleton />;

  const certified = data.status === "certified";
  const score = sum.score;
  const band = bandFor(score);
  const initials = `${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`.toUpperCase() || "·";

  return (
    <div className="ao-paper">
      {demo && <DemoBanner />}
      {/* App bar */}
      <header className="sticky top-0 z-20" style={{ background: "rgb(247 243 234 / .92)", backdropFilter: "saturate(1.4) blur(10px)", borderBottom: "1px solid var(--linen)" }}>
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-4 md:px-8">
          <Link href="/" aria-label={`${BRAND.name} home`}><Wordmark /></Link>
          <nav aria-label="Record sections" className="hidden h-16 items-stretch gap-7 md:flex">
            {TABS.map((t) => <button key={t.k} className="ao-toptab" aria-current={tab === t.k ? "page" : undefined} onClick={() => setTab(t.k)}>{t.label}</button>)}
          </nav>
          <button onClick={() => setTab("me")} aria-label="Your profile" className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 14, fontWeight: 600, border: 0, cursor: "pointer" }}>{initials}</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 pb-32 pt-6 md:px-8 md:pb-16 md:pt-10">
        {loadNote && <div role="status" className="mb-4 rounded-[10px] px-4 py-3" style={{ background: "var(--amber-tint)", color: "var(--ink)", fontSize: 14 }}>{loadNote}</div>}

        {/* Page heading */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
          <div>
            <p className="ao-eyebrow">{tab === "record" ? "My record" : TABS.find((t) => t.k === tab)?.label}</p>
            <h1 className="ao-h1 mt-1 md:text-[34px] md:leading-[40px]">{tab === "record" ? `${data.firstName ? `${data.firstName}'s` : "Your"} record` : TAB_TITLES[tab]}</h1>
          </div>
          {data.registryId && <div className="flex items-center gap-2"><span className="ao-meta">Registry ID</span><CopyMono value={data.registryId} label="Registry ID" /></div>}
        </div>

        {tab === "record" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-5 lg:col-span-8">
              {/* Standing ribbon */}
              <section aria-labelledby="standing" className={`ao-card ao-reveal ${hall === "running" ? "ao-pulse" : ""}`} style={{ padding: "22px 22px 18px" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p id="standing" className="ao-eyebrow">Record standing</p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="ao-serif" style={{ fontSize: 30, lineHeight: "36px", fontWeight: 600, color: "var(--ink)" }}>{certified ? "Certified" : band.label}</span>
                      {score !== null && <span className="ao-mono" style={{ fontSize: 32, lineHeight: "36px", fontWeight: 500 }}>{score}<span style={{ fontSize: 16, color: "var(--ink-3)" }}> / 100</span></span>}
                    </div>
                  </div>
                  {certified ? <SealDisc /> : <BandChip score={score} />}
                </div>
                <div className="mt-3">
                  {data.run ? <Hallmark runId={data.run.id} outputHash={data.run.output_hash} at={data.run.computed_at} state={hall} onVerify={verify} />
                    : <Hallmark state="none" />}
                </div>
                <p className="ao-body-2 mt-4" style={{ maxWidth: 620 }}>
                  {data.run
                    ? <>This is a documentation check: it measures what's on file against {RULESET_LABEL}. It is not a judgment of you. Anyone can re-run it and get the same result.</>
                    : <>Your first check runs once a reviewer starts your record. Fill the steps below first; each one is a rule in the standard.</>}
                </p>
                {data.run && <DomainStrip run={data.run} />}
                <div className="mt-4 flex items-center gap-2 rounded-[8px] px-3 py-2" style={{ background: "var(--vellum)" }}>
                  <span className="ao-chip chip-none" style={{ background: "var(--card)" }}>Not yet assessed</span>
                  <span className="ao-meta" style={{ color: "var(--ink-2)" }}>Readiness standing arrives when the {BRAND.standard} instrument is published.</span>
                </div>
              </section>

              {/* Next steps */}
              <section aria-labelledby="next">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 id="next" className="ao-h2">Next steps</h2>
                  <span className="ao-meta">From the rules your record hasn't met yet</span>
                </div>
                {sum.next.length === 0 ? (
                  <div className="ao-card p-5 ao-body-2">Everything the standard asks for is on file. Nice work. Keep documents current; we'll tell you when something needs a refresh.</div>
                ) : (
                  <ol className="flex flex-col gap-3">
                    {sum.next.map((s, i) => <NextStep key={s.key} slot={s} i={i} href={actHref(s)} onDemo={() => flash("Demo: uploads are disabled on the sample record.")} />)}
                  </ol>
                )}
              </section>
            </div>

            <aside className="flex flex-col gap-5 lg:col-span-4">
              <section aria-labelledby="complete" className="ao-card ao-reveal p-5" style={{ animationDelay: "60ms" }}>
                <p id="complete" className="ao-eyebrow">Record completeness</p>
                <div className="mt-3 flex items-center gap-5">
                  <Completeness filled={sum.onFile} total={sum.total} size={116} />
                  <div className="min-w-0">
                    <p style={{ fontSize: 16, lineHeight: "22px", fontWeight: 600 }}>{sum.onFile === sum.total ? "Complete." : `${sum.total - sum.onFile} to go`}</p>
                    <p className="ao-body-2 mt-1"><span className="ao-serif" style={{ fontStyle: "italic" }}>Kamili</span> means complete. Every piece on file closes the ring.</p>
                  </div>
                </div>
              </section>

              <section aria-labelledby="shelf" className="ao-card p-5">
                <div className="flex items-baseline justify-between"><h2 id="shelf" className="ao-h2">Evidence</h2><button className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => setTab("evidence")}>Open shelf <IconChevron size={16} /></button></div>
                <ul className="mt-3 divide-y" style={{ borderColor: "var(--linen)" }}>
                  {sum.areas.map((a) => (
                    <li key={a.key} className="flex items-center gap-3 py-3" style={{ borderColor: "var(--linen)" }}>
                      <span aria-hidden style={{ width: 3, height: 22, borderRadius: 2, background: a.ident }} />
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{a.label}</span>
                      <span className="ao-mono" style={{ fontSize: 13, color: a.onFile === a.total ? "var(--pine)" : "var(--ink-2)" }}>{a.onFile}/{a.total}{a.onFile === a.total ? " ✓" : ""}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="where" className="ao-card p-5">
                <h2 id="where" className="ao-h2">Where your record is</h2>
                <Journey status={data.status} />
              </section>
            </aside>
          </div>
        )}

        {tab === "evidence" && <EvidenceShelf slots={sum.slots} hrefFor={actHref} onDemo={() => flash("Demo: uploads are disabled on the sample record.")} />}
        {tab === "share" && <ShareTab rid={data.registryId} demo={!!demo} />}
        {tab === "me" && <MeTab d={data} onSignOut={signOut} />}

        <footer className="ao-meta mt-14 flex flex-wrap items-center justify-between gap-2 border-t pt-5" style={{ borderColor: "var(--linen)" }}>
          <span>{BRAND.name} · {BRAND.endorsement}</span>
          <span className="inline-flex items-center gap-1.5"><IconLock size={14} /> Only people you approve can see your record.</span>
        </footer>
      </main>

      {/* Mobile tabs */}
      <nav aria-label="Record sections" className="ao-tabbar md:hidden">
        <div className="mx-auto flex max-w-[560px]">
          {TABS.map((t) => (
            <button key={t.k} className="ao-tab" aria-current={tab === t.k ? "page" : undefined} onClick={() => { setTab(t.k); window.scrollTo({ top: 0 }); }}>
              <t.Icon size={22} />{t.label}
            </button>
          ))}
        </div>
      </nav>

      {toast && <div role="status" className="ao-fade fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-[10px] px-4 py-3 md:bottom-8" style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 14, boxShadow: "var(--sheet-shadow)" }}>{toast}</div>}
    </div>
  );
}

const TABS: { k: Tab; label: string; Icon: (p: { size?: number }) => React.ReactElement }[] = [
  { k: "record", label: "Record", Icon: IconRecord },
  { k: "evidence", label: "Evidence", Icon: IconShelf },
  { k: "share", label: "Share", Icon: IconShare },
  { k: "me", label: "Me", Icon: IconUser },
];
const TAB_TITLES: Record<Tab, string> = { record: "", evidence: "What's on file", share: "Share your record", me: "You" };

function SealDisc() {
  return <div aria-label={`${BRAND.standard} certified`} className="grid h-12 w-12 place-items-center rounded-full ao-mono" style={{ background: "var(--seal)", color: "var(--ink)", fontSize: 11, fontWeight: 500 }}>{BRAND.standard} ✓</div>;
}

function DomainStrip({ run }: { run: Run }) {
  const L: Record<string, string> = { housing: "Housing", workforce: "Work", financial: "Financial", behavioral: "Consistency" };
  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      {run.dimension_scores.map((d) => (
        <div key={d.domain}>
          <dt className="ao-meta" style={{ color: "var(--ink-2)" }}>{L[d.domain] ?? d.domain}</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span className="ao-track flex-1" style={{ height: 6 }}><span style={{ width: `${(d.score / d.max_score) * 100}%`, background: "var(--ink-2)" }} /></span>
            <span className="ao-mono" style={{ fontSize: 13, minWidth: 24, textAlign: "right" }}>{d.score}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function NextStep({ slot, i, href, onDemo }: { slot: SlotState; i: number; href?: string; onDemo: () => void }) {
  const [open, setOpen] = useState(false);
  const m = pointsMeta(slot);
  const Btn = href ? Link : "button";
  return (
    <li className="ao-card ao-next ao-reveal overflow-hidden" style={{ animationDelay: `${80 + i * 50}ms` }}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 16, lineHeight: "22px", fontWeight: 600 }}>{slot.ask}</p>
          <p className="ao-body-2 mt-1">{slot.why}</p>
          <p className="ao-mono ao-meta mt-2">+{m.total}{m.areas > 1 ? ` across ${m.areas} areas` : ""} · FRARI v1 · {m.ruleIds[0]}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button className="ao-btn ao-btn-quiet ao-btn-sm" aria-expanded={open} onClick={() => setOpen(!open)}>Why?</button>
          {/* @ts-expect-error polymorphic */}
          <Btn {...(href ? { href } : { type: "button", onClick: onDemo })} className="ao-btn ao-btn-primary">
            {slot.kind === "Document" && <IconUpload size={18} />}{slot.action}
          </Btn>
        </div>
      </div>
      {open && (
        <div className="ao-fade border-t px-5 py-4 ao-body-2" style={{ borderColor: "var(--linen)", background: "var(--paper)" }}>
          This step meets {m.ruleIds.length > 1 ? "these rules" : "this rule"} in {RULESET_LABEL}: <span className="ao-mono" style={{ fontSize: 13 }}>{m.ruleIds.join(", ")}</span>. The points are published in the standard; nobody adds them by hand. A reviewer confirms what you send before it counts as verified.
        </div>
      )}
    </li>
  );
}

function Journey({ status }: { status: string }) {
  const idx = Math.max(0, STATUS_STEPS.findIndex((s) => s.key === status));
  const cur = STATUS_STEPS[idx];
  return (
    <div className="mt-4">
      <ol className="flex items-center gap-1.5" aria-label={`Step ${idx + 1} of ${STATUS_STEPS.length}: ${cur.label}`}>
        {STATUS_STEPS.map((s, i) => (
          <li key={s.key} className="flex-1" aria-current={i === idx ? "step" : undefined}>
            <span className="block h-1.5 rounded-full" style={{ background: i < idx ? "var(--ink-2)" : i === idx ? "var(--action)" : "var(--vellum)" }} />
          </li>
        ))}
      </ol>
      <p className="mt-3" style={{ fontSize: 15, fontWeight: 600 }}>{cur.label}</p>
      <p className="ao-body-2">{cur.plain}</p>
    </div>
  );
}

function EvidenceShelf({ slots, hrefFor, onDemo }: { slots: SlotState[]; hrefFor: (s: SlotState) => string | undefined; onDemo: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {AREAS.map((a) => {
        const of = slots.filter((s) => s.area === a.key);
        return (
          <section key={a.key} className="ao-card overflow-hidden" aria-labelledby={`area-${a.key}`}>
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--linen)", background: "var(--paper)" }}>
              <span aria-hidden style={{ width: 3, height: 18, borderRadius: 2, background: a.ident }} />
              <h2 id={`area-${a.key}`} className="ao-h2" style={{ fontSize: 16, flex: 1 }}>{a.label}</h2>
              <span className="ao-mono ao-meta">{of.filter((s) => s.status !== "missing").length}/{of.length}</span>
            </div>
            <ul>
              {of.map((s) => {
                const href = hrefFor(s);
                return (
                  <li key={s.key} className="ao-row flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5" style={{ borderTop: "1px solid var(--linen)" }}>
                    <div className="min-w-[180px] flex-1">
                      <p style={{ fontSize: 15, fontWeight: 500 }}>{s.label}</p>
                      <p className="ao-meta">{s.kind} · +{s.points} in FRARI v1</p>
                    </div>
                    <StatusWord status={s.status} />
                    {s.status === "missing" ? (
                      href ? <Link href={href} className="ao-btn ao-btn-secondary ao-btn-sm">{s.action}</Link> : <button className="ao-btn ao-btn-secondary ao-btn-sm" onClick={onDemo}>{s.action}</button>
                    ) : <span className="ao-meta" style={{ minWidth: 72 }}>Awaiting review</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ShareTab({ rid, demo }: { rid: string; demo?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className="ao-card p-6 lg:col-span-7">
        <h2 className="ao-h2">Let someone check your standing</h2>
        <p className="ao-body-2 mt-2">Give a lender, landlord or program your Registry ID. They can look it up themselves. They see your standing and when it was checked, never your documents.</p>
        {rid && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[10px] p-4" style={{ background: "var(--paper)", border: "1px solid var(--linen)" }}><CopyMono value={rid} label="Registry ID" /><Link className="ao-btn ao-btn-secondary ao-btn-sm" href={`/verify?rid=${encodeURIComponent(rid)}`}>See what they see <IconArrowRight size={16} /></Link></div>}
      </section>
      <section className="ao-card p-6 lg:col-span-5">
        <h2 className="ao-h2">Your standing report</h2>
        <p className="ao-body-2 mt-2">A one-page summary of your standing, receipts and what's on file, with a verify link. No documents. Print it or save it as a PDF.</p>
        <Link className="ao-btn ao-btn-primary ao-btn-sm mt-4" href={demo ? "/app/demo/report" : "/app/report"}>Open my report <IconArrowRight size={16} /></Link>
        <p className="ao-meta mt-4" style={{ borderTop: "1px solid var(--linen)", paddingTop: 12 }}>Coming next: packets for one named recipient, with an end date and a log of every view.</p>
      </section>
    </div>
  );
}

function MeTab({ d, onSignOut }: { d: RecordData; onSignOut: () => void }) {
  const rows: [string, string][] = [["Name", `${d.firstName} ${d.lastName}`.trim() || "—"], ["Email", d.email || "—"], ["Registry ID", d.registryId || "Issued after your first review"], ["Record started", "—"]];
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className="ao-card lg:col-span-7">
        <dl>
          {rows.filter((r) => r[0] !== "Record started").map(([k, v], i) => (
            <div key={k} className="flex flex-wrap justify-between gap-2 px-5 py-4" style={{ borderTop: i ? "1px solid var(--linen)" : 0 }}>
              <dt className="ao-body-2">{k}</dt><dd className={k === "Registry ID" ? "ao-mono" : ""} style={{ fontSize: 15, fontWeight: 500 }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ao-card p-5 lg:col-span-5">
        <div className="flex items-start gap-3"><span style={{ color: "var(--pine)" }}><IconShield size={22} /></span><div><h2 className="ao-h2" style={{ fontSize: 16 }}>Your privacy</h2><p className="ao-body-2 mt-1">Your documents are stored privately. Reviewers see them only while working on your record.</p></div></div>
        <button className="ao-btn ao-btn-secondary mt-5 w-full" onClick={onSignOut}><IconLogout size={18} /> Sign out</button>
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="ao-paper" aria-busy="true" aria-label="Loading your record">
      <div style={{ height: 64, borderBottom: "1px solid var(--linen)" }} />
      <div className="mx-auto grid max-w-[1120px] gap-5 px-4 pt-10 md:px-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8"><div className="ao-skel" style={{ height: 28, width: 220 }} /><div className="ao-skel" style={{ height: 220 }} /><div className="ao-skel" style={{ height: 96 }} /><div className="ao-skel" style={{ height: 96 }} /></div>
        <div className="flex flex-col gap-4 lg:col-span-4"><div className="ao-skel" style={{ height: 160 }} /><div className="ao-skel" style={{ height: 240 }} /></div>
      </div>
    </div>
  );
}
