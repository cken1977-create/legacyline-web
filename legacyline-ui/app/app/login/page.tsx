"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AppLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/individual/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Invalid email or password.");
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0B1C30 0%, #1A3A5C 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "rgba(200,168,75,0.15)",
          border: "1px solid rgba(200,168,75,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#C8A84B" }}>L</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#F4F6F9", letterSpacing: "-0.5px" }}>
          Legacyline
        </div>
        <div style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", marginTop: 4 }}>
          Your Readiness Journey
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 380,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: 28,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F4F6F9", marginBottom: 6 }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", marginBottom: 24 }}>
          Sign in to check your readiness score
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,246,249,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "12px 16px",
                color: "#F4F6F9", fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,246,249,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "12px 16px",
                color: "#F4F6F9", fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#F87171", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: "#C8A84B", border: "none",
              color: "#0B1C30", fontSize: 15, fontWeight: 700,
              cursor: loading || !email || !password ? "not-allowed" : "pointer",
              opacity: loading || !email || !password ? 0.5 : 1,
              marginTop: 4,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "rgba(244,246,249,0.4)" }}>
        Don't have an account?{" "}
        <Link href="/app/signup" style={{ color: "#C8A84B", fontWeight: 600 }}>
          Create one
        </Link>
      </p>
    </div>
  );
                }
