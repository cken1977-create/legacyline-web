"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND } from "../../../lib/brand";
import { Hallmark, Mark, Wordmark } from "../../_components/assay";
import { IconEye, IconLock } from "../../_components/assay/icons";

const API = (process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app").replace(/\/+$/, "");

export default function AppLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/individual/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) { setError("That email and password don't match a record. Check them and try again."); return; }
      const data = await res.json();
      localStorage.setItem("individual_token", data.token);
      localStorage.setItem("participant_id", data.participant_id);
      localStorage.setItem("user_first_name", data.first_name ?? "");
      localStorage.setItem("user_last_name", data.last_name ?? "");
      localStorage.setItem("user_email", data.email ?? email.trim());
      router.push("/app");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ao-paper grid min-h-screen lg:grid-cols-[1fr_minmax(480px,560px)]">
      {/* Left: the record room */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between" style={{ background: "var(--vellum)", borderRight: "1px solid var(--linen)", padding: "40px 56px" }}>
        <Link href="/" aria-label={`${BRAND.name} home`}><Wordmark size="lg" /></Link>
        <div className="max-w-[460px]">
          <p className="ao-eyebrow">Your readiness record</p>
          <p className="ao-serif mt-3" style={{ fontSize: 40, lineHeight: "46px", fontWeight: 600, letterSpacing: "-.015em" }}>One record. Yours.<br />Checked against a standard anyone can <span style={{ whiteSpace: "nowrap" }}>re-run.</span></p>
          <div className="ao-card mt-10 p-5" style={{ boxShadow: "var(--sheet-shadow)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="ao-eyebrow">Record standing</p>
                <p className="ao-serif mt-1" style={{ fontSize: 24, fontWeight: 600 }}>Proficient <span className="ao-mono" style={{ fontSize: 20, fontWeight: 500 }}>65<span style={{ color: "var(--ink-3)", fontSize: 14 }}> / 100</span></span></p>
              </div>
              <Mark size={44} progress={0.7} />
            </div>
            <div className="mt-3"><Hallmark runId="sample" outputHash="7f3a9c1e" at="2026-10-09T19:20:00Z" /></div>
            <p className="ao-meta mt-3">Sample. Every score carries a hallmark you can verify.</p>
          </div>
        </div>
        <p className="ao-meta">{BRAND.name} · {BRAND.endorsement}</p>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <div className="lg:hidden"><Link href="/" aria-label={`${BRAND.name} home`}><Wordmark /></Link></div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="ao-h1" style={{ fontSize: 32, lineHeight: "38px" }}>Sign in to your record</h1>
          <p className="ao-body-2 mt-2" style={{ fontSize: 16, lineHeight: "24px" }}>Use the email and password you chose when you started your record.</p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5" noValidate>
            <div className="ao-field">
              <label htmlFor="email" className="ao-label">Email</label>
              <input id="email" type="email" inputMode="email" autoComplete="username" required className="ao-input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
            </div>
            <div className="ao-field">
              <div className="flex items-baseline justify-between"><label htmlFor="password" className="ao-label">Password</label></div>
              <div className="relative">
                <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required className="ao-input" style={{ paddingRight: 52 }} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-[6px]" style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer" }}><IconEye size={20} /></button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="flex items-start gap-2 rounded-[8px] px-3 py-2.5" style={{ background: "var(--brick-tint)", color: "var(--ink)", fontSize: 14, lineHeight: "20px" }}>
                <span aria-hidden style={{ color: "var(--brick)", fontWeight: 600 }}>✕</span>{error}
              </p>
            )}

            <button type="submit" className="ao-btn ao-btn-primary w-full" style={{ height: 50, fontSize: 16 }} disabled={loading || !email || !password}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--linen)" }}>
            <p className="ao-body-2" style={{ fontSize: 15 }}>New here? <Link href="/app/signup" className="ao-link" style={{ fontWeight: 500 }}>Start your record</Link></p>
            <p className="ao-body-2 mt-2" style={{ fontSize: 15 }}>Reviewer or program staff? <Link href="/evaluator" className="ao-link">Staff sign-in</Link></p>
          </div>
        </div>
        <p className="ao-meta mx-auto flex max-w-[400px] items-center gap-1.5"><IconLock size={14} /> Your record is private. Only people you approve can see it.</p>
      </main>
    </div>
  );
}
