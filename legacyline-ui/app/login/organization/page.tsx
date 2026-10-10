"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND } from "../../../lib/brand";
import { CoreError, core } from "../../../lib/core";
import { Alert, AuthShell, Field, Input } from "../../_components/assay/forms";
import { IconEye } from "../../_components/assay/icons";

export default function ProgramSignIn() {
  const router = useRouter();
  const [org, setOrg] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = await core<any>("/orgs/login", { method: "POST", body: JSON.stringify({ slug: org.trim().toLowerCase(), password }) });
      if (data.token) {
        localStorage.setItem("org_token", data.token);
        document.cookie = `ll_org=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      localStorage.setItem("org_slug", data.org?.slug ?? org.trim().toLowerCase());
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof CoreError && (e.status === 401 || e.status === 400) ? "That organization ID and password don't match. Check them and try again." : "We couldn't reach the server. Try again in a moment.");
    } finally { setLoading(false); }
  }

  return (
    <AuthShell aside={<>
      <p className="ao-eyebrow">Program Desk</p>
      <p className="ao-serif mt-3" style={{ fontSize: 40, lineHeight: "46px", fontWeight: 600, letterSpacing: "-.015em" }}>Your cohort, one record each. No spreadsheets.</p>
      <p className="ao-body-2 mt-5" style={{ fontSize: 16, lineHeight: "26px" }}>See who's gathering evidence, who's waiting on a reviewer and who's certified — with the receipts behind every standing.</p>
    </>}>
      <h1 className="ao-h1" style={{ fontSize: 32, lineHeight: "38px" }}>Program sign-in</h1>
      <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>For partner programs and organizations on {BRAND.name}.</p>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
        <Field id="org" label="Organization ID" hint="The short ID we gave you, like riverside-partners"><Input id="org" autoComplete="username" autoCapitalize="none" spellCheck={false} value={org} onChange={(e) => setOrg(e.target.value)} /></Field>
        <Field id="pw" label="Password">
          <div className="relative">
            <Input id="pw" type={show ? "text" : "password"} autoComplete="current-password" style={{ paddingRight: 52 }} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-[6px]" style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer" }}><IconEye size={20} /></button>
          </div>
        </Field>
        {error && <Alert>{error}</Alert>}
        <button type="submit" className="ao-btn ao-btn-primary w-full" style={{ height: 50, fontSize: 16 }} disabled={loading || !org || !password}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>
      <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--linen)" }}>
        <p className="ao-body-2" style={{ fontSize: 15 }}>New organization? <Link className="ao-link" href="/obr">Start an organization record</Link></p>
        <p className="ao-body-2 mt-2" style={{ fontSize: 15 }}>Reviewer? <Link className="ao-link" href="/evaluator">Staff sign-in</Link> · Person? <Link className="ao-link" href="/app/login">Sign in here</Link></p>
      </div>
    </AuthShell>
  );
}
