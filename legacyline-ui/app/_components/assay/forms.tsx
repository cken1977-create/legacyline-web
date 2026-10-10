"use client";
// Assay Office form kit: auth shell, fields, consent, story form, document upload.
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { BRAND } from "../../../lib/brand";
import { Wordmark } from ".";
import { IconCheck, IconLock } from "./icons";

export function AuthShell({ aside, children, footer }: { aside: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="ao-paper grid min-h-screen lg:grid-cols-[1fr_minmax(520px,620px)]">
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between" style={{ background: "var(--vellum)", borderRight: "1px solid var(--linen)", padding: "40px 56px" }}>
        <Link href="/" aria-label={`${BRAND.name} home`}><Wordmark size="lg" /></Link>
        <div className="max-w-[460px]">{aside}</div>
        <p className="ao-meta">{BRAND.name} · {BRAND.endorsement}</p>
      </aside>
      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <div className="lg:hidden"><Link href="/" aria-label={`${BRAND.name} home`}><Wordmark /></Link></div>
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-8">{children}</div>
        <div className="mx-auto w-full max-w-[460px]">{footer ?? <p className="ao-meta flex items-center gap-1.5"><IconLock size={14} /> Your record is private. Only people you approve can see it.</p>}</div>
      </main>
    </div>
  );
}

export function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div className="ao-field">
      <label htmlFor={id} className="ao-label">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="ao-meta mt-1">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1" style={{ fontSize: 13, color: "var(--brick)" }}>{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ao-input ${props.className ?? ""}`} />;
}
export function Select({ options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: [string, string][]; placeholder?: string }) {
  return (
    <select {...props} className="ao-input" style={{ appearance: "auto", font: "inherit", fontSize: 16, ...(props.style || {}) }}>
      <option value="">{placeholder ?? "Choose one"}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "ok" | "info"; children: React.ReactNode }) {
  const bg = { error: "var(--brick-tint)", ok: "var(--pine-tint)", info: "var(--vellum)" }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className="rounded-[8px] px-3.5 py-3" style={{ background: bg, color: "var(--ink)", fontSize: 14, lineHeight: "20px" }}>{children}</div>;
}

export function Steps({ steps, at }: { steps: string[]; at: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === at ? "step" : undefined}>
          <span className="grid h-6 w-6 place-items-center rounded-full ao-mono" style={{ fontSize: 12, background: i < at ? "var(--pine)" : i === at ? "var(--ink)" : "var(--card)", color: i <= at ? "var(--paper)" : "var(--ink-3)", border: i > at ? "1px solid var(--rule)" : "none" }}>{i < at ? <IconCheck size={14} /> : i + 1}</span>
          <span style={{ fontSize: 13, fontWeight: i === at ? 600 : 400, color: i === at ? "var(--ink)" : "var(--ink-2)" }} className={i === at ? "" : "hidden sm:inline"}>{s}</span>
          {i < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-6" style={{ background: "var(--rule)" }} />}
        </li>
      ))}
    </ol>
  );
}

export const CONSENT_TEXT = `I agree that ${BRAND.name} may collect and use what I add to my record to check it against the ${BRAND.standard} standard. Only reviewers and the programs I choose can see it, and I can withdraw consent at any time.`;

export function ConsentBox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer gap-3 rounded-[10px] p-4" style={{ background: checked ? "var(--pine-tint)" : "var(--card)", border: `1px solid ${checked ? "var(--pine)" : "var(--rule)"}`, transition: "background .2s" }}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--pine)", flex: "none" }} />
      <span style={{ fontSize: 14, lineHeight: "21px", color: "var(--ink)" }}>{CONSENT_TEXT}</span>
    </label>
  );
}

export const HOUSING: [string, string][] = [["own", "I own my home"], ["rent", "I rent"], ["with_family", "With family or friends"], ["transitional", "Transitional housing"], ["unhoused", "Without stable housing"], ["other", "Other"]];
export const WORK: [string, string][] = [["employed_full", "Working full time"], ["employed_part", "Working part time"], ["self_employed", "Self-employed"], ["in_program", "In a workforce program"], ["student", "Student"], ["unemployed_looking", "Looking for work"], ["unemployed_not_looking", "Not working right now"], ["retired", "Retired"], ["other", "Other"]];

export type Story = { dob: string; address: string; city: string; state: string; zip: string; housing_type: string; monthly_housing_cost: string; employment_status: string; employer_name: string; monthly_income: string };
export const EMPTY_STORY: Story = { dob: "", address: "", city: "", state: "", zip: "", housing_type: "", monthly_housing_cost: "", employment_status: "", employer_name: "", monthly_income: "" };

export function StoryForm({ value, onChange }: { value: Story; onChange: (s: Story) => void }) {
  const set = (k: keyof Story) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value });
  const working = ["employed_full", "employed_part", "self_employed"].includes(value.employment_status);
  return (
    <div className="flex flex-col gap-7">
      <fieldset className="flex flex-col gap-4">
        <legend className="ao-eyebrow mb-3">About you</legend>
        <Field id="dob" label="Date of birth"><Input id="dob" type="date" autoComplete="bday" value={value.dob} onChange={set("dob")} /></Field>
        <Field id="address" label="Street address"><Input id="address" autoComplete="street-address" value={value.address} onChange={set("address")} /></Field>
        <div className="grid grid-cols-[1fr_88px_112px] gap-3">
          <Field id="city" label="City"><Input id="city" autoComplete="address-level2" value={value.city} onChange={set("city")} /></Field>
          <Field id="state" label="State"><Input id="state" autoComplete="address-level1" maxLength={2} value={value.state} onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })} /></Field>
          <Field id="zip" label="ZIP"><Input id="zip" inputMode="numeric" autoComplete="postal-code" maxLength={10} value={value.zip} onChange={set("zip")} /></Field>
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="ao-eyebrow mb-3" style={{ color: "var(--d-adobe)" }}>Housing</legend>
        <Field id="housing" label="Where you live now"><Select id="housing" options={HOUSING} value={value.housing_type} onChange={set("housing_type")} /></Field>
        <Field id="hcost" label="Monthly housing cost" hint="Rent or mortgage. Leave blank if none."><Input id="hcost" inputMode="decimal" placeholder="$" value={value.monthly_housing_cost} onChange={set("monthly_housing_cost")} /></Field>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="ao-eyebrow mb-3" style={{ color: "var(--d-juniper)" }}>Work & income</legend>
        <Field id="work" label="Work right now"><Select id="work" options={WORK} value={value.employment_status} onChange={set("employment_status")} /></Field>
        {working && <Field id="employer" label="Employer"><Input id="employer" autoComplete="organization" value={value.employer_name} onChange={set("employer_name")} /></Field>}
        <Field id="income" label="Monthly income" hint="Before taxes, all sources."><Input id="income" inputMode="decimal" placeholder="$" value={value.monthly_income} onChange={set("monthly_income")} /></Field>
      </fieldset>
    </div>
  );
}

export function storyToForm(s: Story, fd = new FormData()) {
  (Object.keys(s) as (keyof Story)[]).forEach((k) => { if (s[k]?.toString().trim()) fd.append(k, s[k].toString().trim()); });
  return fd;
}

export function DocUpload({ label, help, onFile, state, accept = ".jpg,.jpeg,.png,.pdf,.heic,.heif", capture }: { label: string; help: string; onFile: (f: File) => void; state: "missing" | "submitted" | "uploading" | "error"; accept?: string; capture?: "user" | "environment" }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const id = useId();
  const on = state === "submitted";
  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      className="flex items-center gap-4 rounded-[10px] p-4" style={{ background: drag ? "var(--vellum)" : "var(--card)", border: `1px ${on ? "solid" : "dashed"} ${on ? "var(--pine)" : drag ? "var(--action)" : "var(--rule)"}` }}>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 15, fontWeight: 600 }}>{label}</p>
        <p className="ao-meta mt-0.5" style={{ color: state === "error" ? "var(--brick)" : undefined }}>{state === "error" ? "That didn't upload. JPG, PNG, PDF or HEIC up to 10 MB." : on ? "On file. Upload again to replace it." : help}</p>
      </div>
      <input ref={ref} id={id} aria-label={label} type="file" accept={accept} capture={capture} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button type="button" className={`ao-btn ao-btn-sm ${on ? "ao-btn-secondary" : "ao-btn-primary"}`} disabled={state === "uploading"} onClick={() => ref.current?.click()} aria-describedby={id}>
        {state === "uploading" ? "Uploading…" : on ? "Replace" : "Upload"}
      </button>
    </div>
  );
}
