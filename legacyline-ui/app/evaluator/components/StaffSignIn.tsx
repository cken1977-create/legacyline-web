"use client";

// Phase S: real evaluator sign-in. Replaces the old auto-sign-in as the pilot evaluator.

import { useState } from "react";
import { STAFF_EMAIL_KEY, STAFF_TOKEN_KEY } from "../../../lib/api";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app"
).replace(/\/+$/, "");

export default function StaffSignIn({ onSignedIn }: { onSignedIn: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }
      const data = await res.json();
      localStorage.setItem(STAFF_TOKEN_KEY, data.token);
      localStorage.setItem(STAFF_EMAIL_KEY, data.staff?.email ?? email.trim().toLowerCase());
      setPassword("");
      onSignedIn(data.staff?.email ?? email.trim().toLowerCase());
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, padding: "12px 16px", color: "#F4F6F9", fontSize: 15, outline: "none",
  };

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F4F6F9", marginBottom: 6 }}>Evaluator sign in</h2>
        <p style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", marginBottom: 20 }}>Staff access only.</p>
        <label style={{ fontSize: 11, color: "rgba(244,246,249,0.5)", display: "block", marginBottom: 6 }}>Email</label>
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...input, marginBottom: 14 }} />
        <label style={{ fontSize: 11, color: "rgba(244,246,249,0.5)", display: "block", marginBottom: 6 }}>Password</label>
        <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
        {error && <div style={{ marginTop: 12, color: "#F87171", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={loading || !email || !password} style={{ width: "100%", marginTop: 18, padding: "14px 0", borderRadius: 12, background: "#C8A84B", border: "none", color: "#0B1C30", fontSize: 15, fontWeight: 700, opacity: loading || !email || !password ? 0.5 : 1, cursor: "pointer" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
