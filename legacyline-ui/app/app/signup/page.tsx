"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AppSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSignup() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/individual/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "email_exists" ? "An account with this email already exists." : "Signup failed. Please try again.");
        return;
      }
      const data = await res.json();
      localStorage.setItem("individual_token", data.token);
      localStorage.setItem("participant_id", data.participant_id);
      localStorage.setItem("user_first_name", data.first_name);
      localStorage.setItem("user_last_name", data.last_name);
      localStorage.setItem("user_email", data.email);
      router.push("/app");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = form.first_name && form.last_name && form.email && form.password;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0B1C30 0%, #1A3A5C 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "rgba(200,168,75,0.15)",
          border: "1px solid rgba(200,168,75,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#C8A84B" }}>L</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#F4F6F9" }}>Start Your Journey</div>
        <div style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", marginTop: 4 }}>
          Create your readiness profile
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 380,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: 28,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,246,249,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>First Name</label>
              <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", color: "#F4F6F9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,246,249,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Last Name</label>
              <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", color: "#F4F6F9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          {[
            { field: "email", label: "Email", type: "email", placeholder: "your@email.com" },
            { field: "phone", label: "Phone (optional)", type: "tel", placeholder: "(832) 555-0100" },
            { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,246,249,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={(e) => set(field, e.target.value)}
                placeholder={placeholder}
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "#F4F6F9", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#F87171", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading || !canSubmit}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: "#C8A84B", border: "none",
              color: "#0B1C30", fontSize: 15, fontWeight: 700,
              cursor: loading || !canSubmit ? "not-allowed" : "pointer",
              opacity: loading || !canSubmit ? 0.5 : 1, marginTop: 4,
            }}
          >
            {loading ? "Creating account..." : "Create My Account"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "rgba(244,246,249,0.4)" }}>
        Already have an account?{" "}
        <Link href="/app/login" style={{ color: "#C8A84B", fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
              }
