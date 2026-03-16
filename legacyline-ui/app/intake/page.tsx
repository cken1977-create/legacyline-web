"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type CreateParticipantRequest = {
  first_name: string;
  last_name: string;
  dob: string;
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

function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<CreateParticipantRequest>({
    first_name: "",
    last_name: "",
    dob: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const first = searchParams.get("first_name");
    const last = searchParams.get("last_name");
    const em = searchParams.get("email");
    if (first || last || em) {
      setForm((prev) => ({
        ...prev,
        first_name: first || prev.first_name,
        last_name: last || prev.last_name,
        email: em || prev.email,
      }));
    }
  }, [searchParams]);

  const canSubmit =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.dob.trim().length > 0 &&
    ((form.email ?? "").trim().length > 0 ||
      (form.phone ?? "").trim().length > 0);

  async function createSubject() {
    if (loading) return;
    if (!canSubmit) {
      setMessage("Enter first name, last name, date of birth, and at least one contact method.");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateParticipantRequest = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        dob: form.dob.trim(),
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

      router.push(`/intake/${pid}`);
    } catch (err: any) {
      setMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Begin Your Intake</h2>
        <p className="mt-2 text-sm text-white/60">
          Enter your information to get started with your readiness assessment.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">First Name</label>
              <input
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Last Name</label>
              <input
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Phone</label>
            <input
              type="tel"
              placeholder="(832) 555-0100"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
            />
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-sm text-red-300">
            {message}
          </div>
        )}

        <button
          onClick={createSubject}
          disabled={loading || !canSubmit}
          className="mt-6 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Getting started..." : "Begin My Intake"}
        </button>
      </div>
    </Shell>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakeForm />
    </Suspense>
  );
              }
