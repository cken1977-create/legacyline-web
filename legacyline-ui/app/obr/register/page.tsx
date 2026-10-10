"use client";
// Organization readiness record (OBR) — register with save-and-resume.
// Answers save on this device after every change; the organization is registered
// at the end of step 1, so a resumed draft keeps its OBR subject id.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "../../../lib/brand";
import { core } from "../../../lib/core";
import { Mark, Wordmark } from "../../_components/assay";
import { TierGlyph } from "../../_components/assay/icons";
import { Alert, DocUpload, Field, Input, Select, Steps } from "../../_components/assay/forms";
import { IconArrowRight, IconCheck, IconLock } from "../../_components/assay/icons";

type Q = { k: string; label: string; hint?: string; kind?: "text" | "area" | "email" | "tel" | "date"; options?: [string, string][]; req?: boolean; half?: boolean };
const SECTIONS: { key: string; title: string; lede: string; color: string; qs: Q[] }[] = [
  { key: "org", title: "Your organization", lede: "Who you are and who we should talk to.", color: "var(--d-slateblue)", qs: [
    { k: "name", label: "Organization name", hint: "Full legal name", req: true },
    { k: "ein", label: "EIN (tax ID)", hint: "XX-XXXXXXX", half: true },
    { k: "legal_structure", label: "Legal structure", half: true, options: [["nonprofit_501c3", "Nonprofit 501(c)(3)"], ["nonprofit_other", "Other nonprofit"], ["llc", "LLC"], ["corporation", "Corporation"], ["government", "Government entity"], ["other", "Other"]] },
    { k: "founded_date", label: "Year founded", half: true },
    { k: "address", label: "Street address" },
    { k: "city", label: "City", half: true }, { k: "state", label: "State", half: true }, { k: "zip", label: "ZIP", half: true },
    { k: "primary_contact", label: "Contact name", req: true }, { k: "contact_email", label: "Contact email", kind: "email", req: true, half: true }, { k: "contact_phone", label: "Contact phone", kind: "tel", half: true },
  ] },
  { key: "gov", title: "Leadership & governance", lede: "How decisions get made and who makes them.", color: "var(--d-plum)", qs: [
    { k: "leadership_composition", label: "Leadership team", hint: "Titles and how long each has served", kind: "area" },
    { k: "board_structure", label: "Board", hint: "Size, makeup, how often it meets", kind: "area" },
    { k: "decision_making_process", label: "How major decisions are made", kind: "area" },
    { k: "succession_plan", label: "If a key leader left tomorrow", kind: "area" },
  ] },
  { key: "staff", title: "Staff", lede: "The people doing the work.", color: "var(--d-juniper)", qs: [
    { k: "staff_count", label: "Total staff", hint: "Full-time and part-time", half: true }, { k: "turnover_rate", label: "Yearly turnover", hint: "e.g. 15%", half: true },
    { k: "training_programs", label: "Training staff receive", kind: "area" }, { k: "behavioral_policy", label: "Conduct and HR policies", kind: "area" },
  ] },
  { key: "policy", title: "Policy & compliance", lede: "What's written down and how it's held to.", color: "var(--d-adobe)", qs: [
    { k: "active_policies", label: "Active policies", kind: "area" }, { k: "last_audit_date", label: "Last audit", kind: "date", half: true },
    { k: "documentation_status", label: "How documented are you?", half: true, options: [["fully_documented", "Fully documented"], ["partially_documented", "Partly documented"], ["in_progress", "In progress"], ["minimal", "Minimal"]] },
    { k: "compliance_history", label: "Findings or violations in the last 3 years", kind: "area" },
  ] },
  { key: "fin", title: "Financial health", lede: "Budget, funding and reserves.", color: "var(--d-ledger)", qs: [
    { k: "annual_budget", label: "Annual operating budget", hint: "$", half: true }, { k: "financial_reserves", label: "Months of reserves", half: true },
    { k: "funding_sources", label: "Main funding sources", kind: "area" }, { k: "sustainability_plan", label: "Plan to sustain the work", kind: "area" },
  ] },
];
const DOCS = [["bylaws", "Bylaws or operating agreement"], ["org_chart", "Organizational chart"], ["audit", "Most recent audit or financial review"], ["policy_manual", "Policy manual or staff handbook"], ["strategic_plan", "Strategic plan"]] as const;
const STEP_NAMES = [...SECTIONS.map((s) => s.title.split(" ")[0].replace(/^Your$/, "Organization")), "Documents", "Review"];
const KEY = "kamili.obr.draft.v1";

export default function OBRRegister() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [subjectId, setSubjectId] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d?.form) { setForm(d.form); setSubjectId(d.subjectId || ""); setStep(Math.min(d.step ?? 0, SECTIONS.length)); setResumed(true); setSavedAt(d.savedAt); }
    } catch {}
  }, []);
  useEffect(() => {
    if (!Object.keys(form).length) return;
    const t = setTimeout(() => { const at = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify({ form, subjectId, step, savedAt: at })); setSavedAt(at); } catch {} }, 400);
    return () => clearTimeout(t);
  }, [form, subjectId, step]);

  const sec = SECTIONS[step];
  const missing = useMemo(() => (sec ? sec.qs.filter((q) => q.req && !form[q.k]?.trim()).map((q) => q.label) : []), [sec, form]);

  async function next() {
    setErr("");
    if (missing.length) { setErr(`Add: ${missing.join(", ")}`); return; }
    if (step === 0 && !subjectId) {
      setBusy(true);
      try {
        const body = Object.fromEntries(SECTIONS[0].qs.map((q) => [q.k, form[q.k] ?? ""]));
        const d = await core<any>("/obr/subjects", { method: "POST", body: JSON.stringify(body) });
        setSubjectId(d.obr_subject_id);
      } catch { setErr("We couldn't register the organization. Your answers are saved; try again."); setBusy(false); return; }
      setBusy(false);
    }
    setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      SECTIONS.slice(1).forEach((s) => s.qs.forEach((q) => fd.append(q.k, form[q.k] ?? "")));
      Object.entries(files).forEach(([k, f]) => f && fd.append(k, f));
      await core(`/obr/subjects/${subjectId}/intake`, { method: "POST", body: fd });
      localStorage.removeItem(KEY); setDone(true);
    } catch { setErr("We couldn't send it. Everything is still saved here; try again."); }
    finally { setBusy(false); }
  }

  function startOver() { localStorage.removeItem(KEY); setForm({}); setSubjectId(""); setStep(0); setResumed(false); setSavedAt(null); }

  if (done) return (
    <div className="ao-paper grid min-h-screen place-items-center p-6">
      <div className="ao-reveal max-w-[460px] text-center">
        <div className="flex justify-center"><Mark size={72} progress={1} /></div>
        <h1 className="ao-h1 mt-6" style={{ fontSize: 30 }}>Sent for review</h1>
        <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>{form.name} now has an organization record. A certified reviewer will read it and run the {BRAND.standard} check. We'll write to {form.contact_email || "your contact"}.</p>
        <p className="ao-mono ao-meta mt-5">Record {subjectId}</p>
        <div className="mt-8 flex justify-center gap-2"><Link className="ao-btn ao-btn-secondary" href="/obr">About organization records</Link><button className="ao-btn ao-btn-primary" onClick={() => router.push("/login/organization")}>Program sign-in</button></div>
      </div>
    </div>
  );

  return (
    <div className="ao-paper min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-4 md:px-8" style={{ background: "var(--paper)", borderBottom: "1px solid var(--linen)" }}>
        <Link href="/obr" aria-label={`${BRAND.name} — organization records`}><Wordmark /></Link>
        <span className="ao-meta flex items-center gap-1.5" aria-live="polite">{savedAt ? <><IconCheck size={14} /> Saved on this device</> : "Answers save as you type"}</span>
      </header>
      <main className="mx-auto max-w-[760px] px-4 pb-24 pt-8 md:px-8">
        <div className="flex items-center gap-2"><TierGlyph tier="organization" size={18} /><p className="ao-eyebrow">Organization record · OBR</p></div>
        <div className="mt-4 overflow-x-auto pb-1" tabIndex={0} role="region" aria-label="Progress steps"><Steps steps={STEP_NAMES} at={step} /></div>
        {resumed && step > 0 && <div className="mt-5"><Alert tone="info">Welcome back — we kept your answers{form.name ? ` for ${form.name}` : ""}. <button className="ao-link" style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }} onClick={startOver}>Start over</button></Alert></div>}

        {sec && (
          <section className="ao-fade mt-8" key={sec.key}>
            <h1 className="ao-h1" style={{ fontSize: 30, lineHeight: "36px" }}>{sec.title}</h1>
            <p className="ao-body-2 mt-1" style={{ fontSize: 16 }}>{sec.lede}</p>
            <div className="ao-card mt-6 grid grid-cols-2 gap-4 p-5 md:p-6" style={{ borderTop: `3px solid ${sec.color}` }}>
              {sec.qs.map((q) => (
                <div key={q.k} className={q.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                  <Field id={q.k} label={`${q.label}${q.req ? "" : " (optional)"}`} hint={q.hint}>
                    {q.options ? <Select id={q.k} options={q.options} value={form[q.k] ?? ""} onChange={(e) => setForm({ ...form, [q.k]: e.target.value })} />
                      : q.kind === "area" ? <textarea id={q.k} className="ao-input" style={{ height: 112, padding: 12, lineHeight: "22px" }} value={form[q.k] ?? ""} onChange={(e) => setForm({ ...form, [q.k]: e.target.value })} />
                      : <Input id={q.k} type={q.kind ?? "text"} value={form[q.k] ?? ""} onChange={(e) => setForm({ ...form, [q.k]: e.target.value })} />}
                  </Field>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === SECTIONS.length && (
          <section className="ao-fade mt-8">
            <h1 className="ao-h1" style={{ fontSize: 30 }}>Documents</h1>
            <p className="ao-body-2 mt-1" style={{ fontSize: 16 }}>Add what you have. You can send the rest later. Files stay on this page until you send.</p>
            <div className="mt-6 flex flex-col gap-3">{DOCS.map(([k, l]) => <DocUpload key={k} label={l} help="PDF, JPG or PNG, up to 10 MB" state={files[k] ? "submitted" : "missing"} onFile={(f) => setFiles({ ...files, [k]: f })} />)}</div>
            <p className="ao-meta mt-3 flex items-center gap-1.5"><IconLock size={14} />Stored privately. Only certified reviewers can open them.</p>
          </section>
        )}

        {step === SECTIONS.length + 1 && (
          <section className="ao-fade mt-8">
            <h1 className="ao-h1" style={{ fontSize: 30 }}>Review and send</h1>
            <div className="mt-6 flex flex-col gap-3">
              {SECTIONS.map((s, i) => { const filled = s.qs.filter((q) => form[q.k]?.trim()).length; return (
                <div key={s.key} className="ao-card flex items-center gap-4 p-4" style={{ borderLeft: `3px solid ${s.color}` }}>
                  <div className="flex-1"><p style={{ fontWeight: 600 }}>{s.title}</p><p className="ao-meta">{filled} of {s.qs.length} answered</p></div>
                  <button className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => setStep(i)}>Edit</button>
                </div>); })}
              <div className="ao-card flex items-center gap-4 p-4"><div className="flex-1"><p style={{ fontWeight: 600 }}>Documents</p><p className="ao-meta">{Object.values(files).filter(Boolean).length} of {DOCS.length} added</p></div><button className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => setStep(SECTIONS.length)}>Edit</button></div>
            </div>
          </section>
        )}

        {err && <div className="mt-5"><Alert>{err}</Alert></div>}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? <button className="ao-btn ao-btn-secondary" onClick={() => setStep(step - 1)} disabled={busy}>Back</button> : <Link className="ao-btn ao-btn-quiet" href="/obr">Cancel</Link>}
          {step < SECTIONS.length + 1
            ? <button className="ao-btn ao-btn-primary" style={{ minWidth: 180 }} onClick={next} disabled={busy}>{busy ? "Saving…" : step === 0 && !subjectId ? "Register and continue" : "Continue"} <IconArrowRight size={16} /></button>
            : <button className="ao-btn ao-btn-primary" style={{ minWidth: 180 }} onClick={submit} disabled={busy || !subjectId}>{busy ? "Sending…" : "Send for review"}</button>}
        </div>
      </main>
    </div>
  );
}
