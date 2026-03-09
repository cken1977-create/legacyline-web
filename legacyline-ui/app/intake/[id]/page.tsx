"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app";

type Participant = {
  participant_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

const STEPS = ["Personal", "Housing", "Employment", "Documents", "Review"];

export default function IntakeFormPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    dob: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    housing_type: "",
    monthly_housing_cost: "",
    employment_status: "",
    employer_name: "",
    monthly_income: "",
  });

  const [files, setFiles] = useState<{
    gov_id: File | null;
    selfie: File | null;
    bank_statement: File | null;
  }>({ gov_id: null, selfie: null, bank_statement: null });

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/intake/${id}`)
      .then((r) => r.json())
      .then(setParticipant)
      .catch(() => setError("Unable to load your intake. Please check your link."));
  }, [id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.gov_id) fd.append("gov_id", files.gov_id);
      if (files.selfie) fd.append("selfie", files.selfie);
      if (files.bank_statement) fd.append("bank_statement", files.bank_statement);

      const res = await fetch(`${API}/intake/${id}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (error && !participant) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-[#C8A84B] text-4xl font-bold mb-2">Legacyline</div>
          <p className="text-red-400 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-[#C8A84B] text-lg animate-pulse">Loading your intake...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-[#C8A84B] text-4xl font-bold mb-2">Legacyline</div>
          <div className="w-16 h-16 rounded-full bg-[#C8A84B]/20 flex items-center justify-center mx-auto mt-8 mb-6">
            <svg className="w-8 h-8 text-[#C8A84B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Intake Submitted</h2>
          <p className="text-white/60">Thank you, {participant.first_name}. Your information has been received. An evaluator will review your intake and reach out within 2 business days.</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C8A84B] transition";
  const labelClass = "block text-white/50 text-xs uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="bg-[#1A3A5C] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[#C8A84B] font-bold text-xl">Legacyline</div>
          <div className="text-white/40 text-xs">Powered by BRSA Holdings Inc.</div>
        </div>
        <div className="text-white/40 text-sm">Welcome, {participant.first_name}</div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-all ${i <= step ? "bg-[#C8A84B]" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? "text-[#C8A84B]" : ""}>{s}</span>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Step 0 — Personal */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">Personal Information</h2>
              <p className="text-white/40 text-sm">Tell us about yourself so we can build your readiness profile.</p>
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={`${participant.first_name} ${participant.last_name}`} disabled />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" className={inputClass} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Street Address</label>
              <input className={inputClass} placeholder="123 Main St" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} placeholder="Houston" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputClass} placeholder="TX" value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>ZIP Code</label>
              <input className={inputClass} placeholder="77001" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 1 — Housing */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">Housing Stability</h2>
              <p className="text-white/40 text-sm">Your housing situation helps us understand your stability profile.</p>
            </div>
            <div>
              <label className={labelClass}>Housing Type</label>
              <select className={inputClass} value={form.housing_type} onChange={(e) => set("housing_type", e.target.value)}>
                <option value="" disabled>Select one</option>
                <option value="own">Own</option>
                <option value="rent">Rent</option>
                <option value="family">Living with family</option>
                <option value="transitional">Transitional housing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Monthly Rent or Mortgage</label>
              <input className={inputClass} placeholder="$0.00" value={form.monthly_housing_cost} onChange={(e) => set("monthly_housing_cost", e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2 — Employment */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">Employment & Income</h2>
              <p className="text-white/40 text-sm">Your employment status is a key component of your readiness score.</p>
            </div>
            <div>
              <label className={labelClass}>Employment Status</label>
              <select className={inputClass} value={form.employment_status} onChange={(e) => set("employment_status", e.target.value)}>
                <option value="" disabled>Select one</option>
                <option value="employed_full">Employed — Full Time</option>
                <option value="employed_part">Employed — Part Time</option>
                <option value="self_employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Employer Name (if applicable)</label>
              <input className={inputClass} placeholder="Company name" value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Monthly Income</label>
              <input className={inputClass} placeholder="$0.00" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">Document Upload</h2>
              <p className="text-white/40 text-sm">All documents are encrypted and used only for your readiness assessment.</p>
            </div>
            {[
              { key: "gov_id", label: "Government-Issued ID", hint: "Driver's license, passport, or state ID" },
              { key: "selfie", label: "Selfie Holding Your ID", hint: "A clear photo of you holding your ID" },
              { key: "bank_statement", label: "Most Recent Bank Statement", hint: "Last 30 days" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <p className="text-white/30 text-xs mb-2">{hint}</p>
                <label className="flex items-center gap-3 w-full bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-4 cursor-pointer hover:border-[#C8A84B] transition">
                  <svg className="w-5 h-5 text-[#C8A84B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-white/40 text-sm">
                    {files[key as keyof typeof files]?.name || "Tap to upload"}
                  </span>
                  <input type="file" className="hidden" accept="image/*,.pdf"
                    onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))} />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">Review & Submit</h2>
              <p className="text-white/40 text-sm">Please confirm your information before submitting.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-3 text-sm">
              {[
                ["Name", `${participant.first_name} ${participant.last_name}`],
                ["Date of Birth", form.dob],
                ["Address", `${form.address}, ${form.city}, ${form.state} ${form.zip}`],
                ["Housing", form.housing_type],
                ["Monthly Housing Cost", form.monthly_housing_cost],
                ["Employment", form.employment_status],
                ["Employer", form.employer_name],
                ["Monthly Income", form.monthly_income],
                ["Gov ID", files.gov_id?.name || "Not uploaded"],
                ["Selfie", files.selfie?.name || "Not uploaded"],
                ["Bank Statement", files.bank_statement?.name || "Not uploaded"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white text-right">{value || "—"}</span>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs">By submitting you confirm all information is accurate. Your data is confidential and used solely for your BRSA readiness assessment.</p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 border border-white/20 rounded-xl py-3 text-white/60 hover:text-white hover:border-white/40 transition">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 bg-[#C8A84B] text-[#0a0f1e] font-bold rounded-xl py-3 hover:bg-[#d4b55a] transition">
              Continue
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="flex-1 bg-[#C8A84B] text-[#0a0f1e] font-bold rounded-xl py-3 hover:bg-[#d4b55a] transition disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Intake"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
        }
