"use client";

import { useState } from "react";
import Shell from "../_components/Shell";

export default function IntakePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createSubject() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://legacyline-core-production.up.railway.app/participants",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const text = await res.text(); // best for debugging + non-JSON errors

      if (!res.ok) {
        setMessage(`API ${res.status}: ${text || res.statusText}`);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setMessage(`API returned non-JSON:\n${text}`);
        return;
      }

      // Redirect to subject dashboard (the real flow)
      if (data?.participant_id) {
        window.location.assign(`/subject/${data.participant_id}`);
        return;
      }

      // Fallback: show response if no participant_id (shouldn't happen)
      setMessage(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setMessage(err?.message || "Error connecting to API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Intake</h2>

        <p className="mt-2 text-white/70">
          Create a subject record and start evidence collection.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Subject Creation</div>
            <div className="mt-2 text-sm text-white/65">
              Deterministic subject number + registry ID binding.
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Consent + Scope</div>
            <div className="mt-2 text-sm text-white/65">
              Consent-based behavioral data.
            </div>
          </div>
        </div>

        <button
          onClick={createSubject}
          disabled={loading}
          className="mt-7 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Subject"}
        </button>

        {message && (
          <pre className="mt-6 rounded-xl bg-black/40 p-4 text-xs text-green-300 whitespace-pre-wrap">
            {message}
          </pre>
        )}
      </div>
    </Shell>
  );
}
