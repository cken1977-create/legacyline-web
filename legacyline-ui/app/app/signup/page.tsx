"use client";
// Start your record — one flow: account + consent → your story (saved on its own) → My Record.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "../../../lib/brand";
import { CoreError, core, currentParticipantId, hasIndividualSession } from "../../../lib/core";
import { Mark } from "../../_components/assay";
import { Alert, AuthShell, ConsentBox, EMPTY_STORY, Field, Input, Steps, Story, StoryForm, storyToForm } from "../../_components/assay/forms";
import { IconEye } from "../../_components/assay/icons";

const STEPS = ["Your account", "Your story", "Your record"];

export default function StartYourRecord() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [story, setStory] = useState<Story>(EMPTY_STORY);
  const [pid, setPid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState(false);

  // Already signed in? Continue at step 2 rather than creating a second record.
  useEffect(() => { if (hasIndividualSession() && currentParticipantId()) { setPid(currentParticipantId()); setStep(1); } }, []);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const pwOk = f.password.length >= 8;
  const ok0 = f.first_name.trim() && f.last_name.trim() && emailOk && pwOk && consent;

  async function createAccount(e: React.FormEvent) {
    e.preventDefault(); setTouched(true);
    if (!ok0) return;
    setBusy(true); setErr("");
    try {
      const d = await core<any>("/auth/individual/signup", { method: "POST", body: JSON.stringify({ ...f, email: f.email.trim().toLowerCase() }) });
      try {
        if (d.token) localStorage.setItem("individual_token", d.token);
        localStorage.setItem("participant_id", d.participant_id);
        localStorage.setItem("user_first_name", d.first_name ?? f.first_name);
        localStorage.setItem("user_last_name", d.last_name ?? f.last_name);
        localStorage.setItem("user_email", d.email ?? f.email);
      } catch {}
      setPid(d.participant_id);
      // Consent is recorded, not just ticked.
      await core(`/participants/${d.participant_id}/consent`, { method: "POST", body: JSON.stringify({ scope: "behavioral_readiness_v1", terms: "kamili_terms_v1", reason: "signup consent checkbox" }) }).catch(() => null);
      setStep(1);
    } catch (e) {
      setErr(e instanceof CoreError && e.code === "email_exists" ? "There's already a record with this email. Sign in instead." : "We couldn't create your record. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function saveStory(skip = false) {
    if (!pid) return;
    if (skip) { router.push("/app"); return; }
    setBusy(true); setErr("");
    try {
      const fd = storyToForm(story); fd.append("tier", "2"); fd.append("consent", "granted");
      await core(`/intake/${pid}`, { method: "POST", body: fd });
      setStep(2);
      setTimeout(() => router.push("/app"), 1400);
    } catch { setErr("We couldn't save that. Your answers are still here; try again."); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell aside={<>
      <p className="ao-eyebrow">Start your record</p>
      <p className="ao-serif mt-3" style={{ fontSize: 40, lineHeight: "46px", fontWeight: 600, letterSpacing: "-.015em" }}>Ten minutes now.<br />A record that works for you after.</p>
      <ul className="mt-8 flex flex-col gap-4">
        {[["One record", "Programs read the same record. No more filling out the same form again."], ["A standard, not an opinion", `Your record is checked against the ${BRAND.standard} standard. Anyone can re-run the check.`], ["You decide who sees it", "Nothing is shared until you choose a program."]].map(([t, b]) => (
          <li key={t} className="flex gap-3"><span aria-hidden className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: "var(--seal)" }} /><span><span style={{ fontWeight: 600 }}>{t}.</span> <span style={{ color: "var(--ink-2)" }}>{b}</span></span></li>
        ))}
      </ul>
    </>}>
      <Steps steps={STEPS} at={step} />

      {step === 0 && (
        <form onSubmit={createAccount} noValidate className="mt-7 flex flex-col gap-5">
          <div>
            <h1 className="ao-h1" style={{ fontSize: 32, lineHeight: "38px" }}>Start your record</h1>
            <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>Already have one? <Link className="ao-link" href="/app/login">Sign in</Link></p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="fn" label="First name" error={touched && !f.first_name.trim() ? "Add your first name" : undefined}><Input id="fn" autoComplete="given-name" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
            <Field id="ln" label="Last name" error={touched && !f.last_name.trim() ? "Add your last name" : undefined}><Input id="ln" autoComplete="family-name" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
          </div>
          <Field id="em" label="Email" error={touched && !emailOk ? "Use an email you can open" : undefined}><Input id="em" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field id="ph" label="Mobile phone (optional)" hint="Only for updates about your record."><Input id="ph" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field id="pw" label="Password" hint="At least 8 characters." error={touched && !pwOk ? "Use at least 8 characters" : undefined}>
            <div className="relative">
              <Input id="pw" type={show ? "text" : "password"} autoComplete="new-password" style={{ paddingRight: 52 }} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-[6px]" style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer" }}><IconEye size={20} /></button>
            </div>
          </Field>
          <ConsentBox checked={consent} onChange={setConsent} />
          {touched && !consent && <p role="alert" style={{ fontSize: 13, color: "var(--brick)", marginTop: -8 }}>Consent is needed to start a record.</p>}
          {err && <Alert>{err} {err.includes("Sign in") && <Link className="ao-link" href="/app/login">Sign in →</Link>}</Alert>}
          <button type="submit" className="ao-btn ao-btn-primary w-full" style={{ height: 50, fontSize: 16 }} disabled={busy}>{busy ? "Creating your record…" : "Create my record"}</button>
        </form>
      )}

      {step === 1 && (
        <div className="mt-7">
          <h1 className="ao-h1" style={{ fontSize: 30, lineHeight: "36px" }}>Your story, in your words</h1>
          <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>Each answer fills a part of your record. It saves on its own, so you can stop any time. Documents come next, from your record.</p>
          <div className="mt-7"><StoryForm value={story} onChange={setStory} /></div>
          {err && <div className="mt-5"><Alert>{err}</Alert></div>}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button className="ao-btn ao-btn-quiet" onClick={() => saveStory(true)} disabled={busy}>Skip for now</button>
            <button className="ao-btn ao-btn-primary" style={{ height: 50, minWidth: 200 }} onClick={() => saveStory()} disabled={busy}>{busy ? "Saving…" : "Save and see my record"}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ao-fade mt-10 flex flex-col items-center text-center" role="status">
          <Mark size={72} progress={0.45} />
          <h1 className="ao-h1 mt-6" style={{ fontSize: 28 }}>Saved to your record</h1>
          <p className="ao-body-2 mt-2">Opening My Record…</p>
        </div>
      )}
    </AuthShell>
  );
}
