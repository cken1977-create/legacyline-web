"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type CreateParticipantRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type CreateParticipantResponse = {
  participant_id?: string;
  id?: string;
  subject_number?: number;
  status?: string;
  created_at?: string;
  registry_id?: string;
};

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

export default function IntakePage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateParticipantRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
      form.first_name.trim().length > 0 &&
      form.last_name.trim().length > 0 &&
      ((form.email ?? "").trim().length > 0 ||
        (form.phone ?? "").trim().length > 0);

  async function createSubject() {
    if (loading) return;

    if (!canSubmit) {
      setMessage("Enter first + last name and at least one contact method.");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateParticipantRequest = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() ? normalizePhone(form.phone) : "",
      };

      const data = await api<CreateParticipantResponse>("/participants", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const pid = data.participant_id || data.id;

      if (!pid) {
        setMessage(JSON.stringify(data, null, 2));
        return;
      }

      router.push(`/subject/${pid}`);
    } catch (err: any) {
      setMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold">Intake</h2>

        <div className="mt-6 grid gap-3">
          <input
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="rounded-xl bg-black/40 p-2"
          />

          <input
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="rounded-xl bg-black/40 p-2"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl bg-black/40 p-2"
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-xl bg-black/40 p-2"
          />
        </div>

        <button
          onClick={createSubject}
          disabled={loading}
          className="mt-6 rounded-xl bg-white px-4 py-2 text-black"
        >
          {loading ? "Creating..." : "Create Subject"}
        </button>

        {message && (
          <pre className="mt-4 text-xs text-green-300">
            {message}
          </pre>
        )}
      </div>
    </Shell>
  );
}
