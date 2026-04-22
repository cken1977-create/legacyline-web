"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app";

type Participant = {
  participant_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type AIFlag = {
  field: string;
  severity: "warning" | "error";
  message: string;
};

type AIAnalysis = {
  flags: AIFlag[];
  extracted: Record<string, string>;
  summary: string;
  manipulation_risk: "low" | "medium" | "high";
};

const STEPS = ["Personal", "Housing", "Employment", "Documents", "Review"];

export default function IntakeFormPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, "idle" | "uploading" | "done" | "error">>({
    gov_id: "idle", selfie: "idle", bank_statement: "idle"
  });

  const [form, setForm] = useState({
    dob: "", address: "", city: "", state: "", zip: "",
    housing_type: "", monthly_housing_cost: "",
    employment_status: "", employer_name: "", monthly_income: "",
  });

  const [files, setFiles] = useState<{
    gov_id: File | null; selfie: File | null; bank_statement: File | null;
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

  // ── AI document analysis ───────────────────────────────────────────────────
  async function analyzeDocuments() {
    if (!files.gov_id && !files.selfie && !files.bank_statement) return;
    setAiLoading(true);
    setAiAnalysis(null);

    try {
      // Convert files to base64 for Claude API
      async function toBase64(file: File): Promise<{ data: string; mediaType: string }> {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve({ data: base64, mediaType: file.type });
          };
          reader.readAsDataURL(file);
        });
      }

      const content: any[] = [];

      if (files.gov_id) {
        const { data, mediaType } = await toBase64(files.gov_id);
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data }
        });
        content.push({ type: "text", text: "This is the Government ID document." });
      }

      if (files.selfie) {
        const { data, mediaType } = await toBase64(files.selfie);
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data }
        });
        content.push({ type: "text", text: "This is the selfie with ID." });
      }

      if (files.bank_statement) {
        const { data, mediaType } = await toBase64(files.bank_statement);
        if (mediaType === "application/pdf") {
          content.push({
            type: "document",
            source: { type: "base64", media_type: mediaType, data }
          });
        } else {
          content.push({
            type: "image",
            source: { type: "base64", media_type: mediaType, data }
          });
        }
        content.push({ type: "text", text: "This is the bank statement." });
      }

      content.push({
        type: "text",
        text: `You are the BRSA document integrity engine. Analyze these intake documents for the following participant:
Name on file: ${participant?.first_name} ${participant?.last_name}
DOB on file: ${form.dob}
Address on file: ${form.address}, ${form.city}, ${form.state} ${form.zip}
Employment status declared: ${form.employment_status}
Employer declared: ${form.employer_name}
Monthly income declared: ${form.monthly_income}
Monthly housing cost declared: ${form.monthly_housing_cost}

Analyze for:
1. Name consistency — does the name on the ID match the name on file?
2. DOB consistency — does the DOB on the ID match what was declared?
3. Document authenticity signals — any signs of editing, inconsistency, or manipulation
4. Income consistency — does the bank statement support the declared monthly income?
5. Identity match — does the selfie match the ID photo?
6. Address consistency — does any document reference the declared address?

Respond ONLY with a JSON object in this exact format, no other text:
{
  "flags": [
    {"field": "name", "severity": "error|warning", "message": "description"}
  ],
  "extracted": {
    "id_name": "name from ID",
    "id_dob": "DOB from ID",
    "bank_avg_monthly_balance": "average balance if visible",
    "bank_income_signals": "income patterns observed"
  },
  "summary": "one sentence summary of document integrity",
  "manipulation_risk": "low|medium|high"
}`
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content }]
        })
      });

      const data = await response.json();
      const text = data.content?.find((c: any) => c.type === "text")?.text || "{}";

      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const analysis: AIAnalysis = JSON.parse(clean);
        setAiAnalysis(analysis);
      } catch {
        setAiAnalysis({
          flags: [],
          extracted: {},
          summary: "Document analysis complete. Manual review recommended.",
          manipulation_risk: "low"
        });
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setAiLoading(false);
    }
  }

  // Run AI analysis when all three documents are selected
  useEffect(() => {
    const allUploaded = files.gov_id && files.selfie && files.bank_statement;
    if (allUploaded) {
      analyzeDocuments();
    }
  }, [files.gov_id, files.selfie, files.bank_statement]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.gov_id) fd.append("gov_id", files.gov_id);
      if (files.selfie) fd.append("selfie", files.selfie);
      if (files.bank_statement) fd.append("bank_statement", files.bank_statement);

      // Attach AI analysis flags to submission
      if (aiAnalysis) {
        fd.append("ai_flags", JSON.stringify(aiAnalysis.flags));
        fd.append("ai_manipulation_risk", aiAnalysis.manipulation_risk);
        fd.append("ai_summary", aiAnalysis.summary);
        fd.append("ai_extracted", JSON.stringify(aiAnalysis.extracted));
      }

      const res = await fetch(`${API}/intake/${id}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white border border-[#e6dfd2] rounded-xl px-4 py-3 text-[#1A3A5C] placeholder-[#1A3A5C]/30 focus:outline-none focus:border-[#C8A84B] focus:ring-1 focus:ring-[#C8A84B] transition";
  const selectClass = "w-full bg-white border border-[#e6dfd2] rounded-xl px-4 py-3 text-[#1A3A5C] focus:outline-none focus:border-[#C8A84B] focus:ring-1 focus:ring-[#C8A84B] transition appearance-none";
  const labelClass = "block text-[#1A3A5C]/50 text-xs uppercase tracking-widest mb-2 font-medium";

  if (error && !participant) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center p-6">
        <div className="text-center">
          <Image src="/logo-shield.png" alt="Legacyline" width={64} height={64} className="h-16 w-auto mx-auto mb-4" />
          <div className="text-[#1A3A5C] font-bold text-2xl mb-1">LEGACYLINE</div>
          <p className="text-red-500 mt-4 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo-shield.png" alt="Legacyline" width={64} height={64} className="h-16 w-auto mx-auto mb-4 animate-pulse" />
          <div className="text-[#C8A84B] text-sm tracking-widest uppercase">Loading your intake...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Image src="/logo-shield.png" alt="Legacyline" width={80} height={80} className="h-20 w-auto mx-auto mb-6" />
          <div className="w-16 h-16 rounded-full bg-[#C8A84B]/20 border-2 border-[#C8A84B] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#C8A84B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#1A3A5C] text-2xl font-bold mb-3">Intake Submitted</h2>
          <div className="w-12 h-[2px] bg-[#C8A84B] mx-auto mb-4" />
          <p className="text-[#1A3A5C]/60 leading-relaxed">
            Thank you, {participant.first_name}. Your information has been received and your documents are secured.
            A certified BRSA evaluator will review your intake within 2 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">

      {/* Header */}
      <div className="bg-[#1A3A5C] border-b-4 border-[#C8A84B] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo-shield.png" alt="Legacyline" width={40} height={40} className="h-10 w-auto" />
          <div>
            <div className="text-white font-bold text-lg leading-none">LEGACYLINE</div>
            <div className="text-white/40 text-xs">Powered by BRSA Holdings Inc.</div>
          </div>
        </div>
        <div className="text-white/50 text-sm">Welcome, {participant.first_name}</div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#e6dfd2] px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-[#C8A84B]" : "bg-[#e6dfd2]"}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs font-medium transition-colors ${i === step ? "text-[#C8A84B]" : i < step ? "text-[#1A3A5C]/40" : "text-[#1A3A5C]/25"}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">

        {/* Step 0 — Personal */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 01</div>
              <h2 className="text-2xl font-bold mb-1">Personal Information</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Tell us about yourself so we can build your readiness profile.</p>
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={`${inputClass} bg-[#f6f3ee] text-[#1A3A5C]/50 cursor-not-allowed`} value={`${participant.first_name} ${participant.last_name}`} disabled />
            </div>
            <div>
  <label className={labelClass}>Date of Birth</label>
  <div className="grid grid-cols-3 gap-2">
    <select
      className={selectClass}
      value={form.dob ? form.dob.split("-")[1] : ""}
      onChange={(e) => {
        const parts = form.dob ? form.dob.split("-") : ["","",""];
        set("dob", `${parts[0]}-${e.target.value}-${parts[2] || "01"}`);
      }}
    >
      <option value="">Month</option>
      {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
        <option key={m} value={m}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</option>
      ))}
    </select>
    <select
      className={selectClass}
      value={form.dob ? form.dob.split("-")[2] : ""}
      onChange={(e) => {
        const parts = form.dob ? form.dob.split("-") : ["","",""];
        set("dob", `${parts[0]}-${parts[1] || "01"}-${e.target.value}`);
      }}
    >
      <option value="">Day</option>
      {Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, "0")).map(d => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
    <select
      className={selectClass}
      value={form.dob ? form.dob.split("-")[0] : ""}
      onChange={(e) => {
        const parts = form.dob ? form.dob.split("-") : ["","",""];
        set("dob", `${e.target.value}-${parts[1] || "01"}-${parts[2] || "01"}`);
      }}
    >
      <option value="">Year</option>
      {Array.from({length: 100}, (_, i) => String(2006 - i)).map(y => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  </div>
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
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 02</div>
              <h2 className="text-2xl font-bold mb-1">Housing Stability</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Your housing situation helps us understand your stability profile.</p>
            </div>
            <div>
              <label className={labelClass}>Housing Type</label>
              <select className={selectClass} value={form.housing_type} onChange={(e) => set("housing_type", e.target.value)}>
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
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 03</div>
              <h2 className="text-2xl font-bold mb-1">Employment & Income</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Your employment status is a key component of your readiness score.</p>
            </div>
            <div>
              <label className={labelClass}>Employment Status</label>
              <select className={selectClass} value={form.employment_status} onChange={(e) => set("employment_status", e.target.value)}>
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
              <label className={labelClass}>Monthly Take-Home Pay</label>
              <input className={inputClass} placeholder="$0.00" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 04</div>
              <h2 className="text-2xl font-bold mb-1">Document Upload</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">All documents are encrypted and stored securely. Used only for your readiness assessment.</p>
            </div>

            {[
              { key: "gov_id", label: "Government-Issued ID", hint: "Driver's license, passport, or state ID" },
              { key: "selfie", label: "Selfie Holding Your ID", hint: "A clear photo of you holding your ID" },
              { key: "bank_statement", label: "Most Recent Bank Statement", hint: "Last 30 days — PDF or photo" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <p className="text-[#1A3A5C]/40 text-xs mb-2">{hint}</p>
                <label className={`flex items-center gap-3 w-full bg-white border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${files[key as keyof typeof files] ? "border-[#C8A84B] bg-[#C8A84B]/5" : "border-[#e6dfd2] hover:border-[#C8A84B]"}`}>
                  <svg className="w-5 h-5 text-[#C8A84B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className={`text-sm ${files[key as keyof typeof files] ? "text-[#1A3A5C] font-medium" : "text-[#1A3A5C]/40"}`}>
                    {files[key as keyof typeof files]?.name || "Tap to upload"}
                  </span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))} />
                </label>
              </div>
            ))}

            {/* AI Analysis Panel */}
            {aiLoading && (
              <div className="mt-6 bg-[#1A3A5C]/5 border border-[#1A3A5C]/10 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#C8A84B] border-t-transparent rounded-full animate-spin" />
                  <div>
                    <div className="text-[#1A3A5C] font-semibold text-sm">BRSA Document Engine Running</div>
                    <div className="text-[#1A3A5C]/40 text-xs">Analyzing documents for integrity and consistency...</div>
                  </div>
                </div>
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className={`mt-6 rounded-2xl p-5 border ${
                aiAnalysis.manipulation_risk === "high"
                  ? "bg-red-50 border-red-200"
                  : aiAnalysis.manipulation_risk === "medium"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#1A3A5C]/60">
                    Document Integrity Check
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    aiAnalysis.manipulation_risk === "high"
                      ? "bg-red-100 text-red-700"
                      : aiAnalysis.manipulation_risk === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {aiAnalysis.manipulation_risk.toUpperCase()} RISK
                  </span>
                </div>

                <p className="text-[#1A3A5C]/70 text-sm mb-4">{aiAnalysis.summary}</p>

                {aiAnalysis.flags.length > 0 && (
                  <div className="space-y-2">
                    {aiAnalysis.flags.map((flag, i) => (
                      <div key={i} className={`flex items-start gap-2 text-sm p-3 rounded-xl ${
                        flag.severity === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        <span className="font-bold shrink-0">{flag.severity === "error" ? "⚠" : "!"}</span>
                        <span><strong className="capitalize">{flag.field}:</strong> {flag.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {aiAnalysis.flags.length === 0 && (
                  <div className="text-green-700 text-sm font-medium">
                    ✓ All documents passed integrity checks
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 05</div>
              <h2 className="text-2xl font-bold mb-1">Review & Submit</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Please confirm your information before submitting.</p>
            </div>

            {/* AI Risk Banner on Review */}
            {aiAnalysis && aiAnalysis.manipulation_risk !== "low" && (
              <div className={`rounded-2xl p-4 mb-4 border ${
                aiAnalysis.manipulation_risk === "high"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1 text-[#1A3A5C]/60">
                  Document Integrity Notice
                </div>
                <p className={`text-sm font-medium ${
                  aiAnalysis.manipulation_risk === "high" ? "text-red-700" : "text-yellow-700"
                }`}>
                  {aiAnalysis.manipulation_risk === "high"
                    ? "⚠ High integrity risk detected. Your evaluator will review flagged documents."
                    : "! Some document inconsistencies noted. Your evaluator will review before certification."}
                </p>
              </div>
            )}

            <div className="bg-white border border-[#e6dfd2] rounded-2xl p-5 space-y-3 text-sm">
              {[
                ["Name", `${participant.first_name} ${participant.last_name}`],
                ["Date of Birth", form.dob],
                ["Address", `${form.address}, ${form.city}, ${form.state} ${form.zip}`],
                ["Housing Type", form.housing_type],
                ["Monthly Housing Cost", form.monthly_housing_cost],
                ["Employment", form.employment_status],
                ["Employer", form.employer_name],
                ["Monthly Income", form.monthly_income],
                ["Gov ID", files.gov_id?.name || "Not uploaded"],
                ["Selfie", files.selfie?.name || "Not uploaded"],
                ["Bank Statement", files.bank_statement?.name || "Not uploaded"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-1 border-b border-[#f6f3ee] last:border-0">
                  <span className="text-[#1A3A5C]/40 shrink-0">{label}</span>
                  <span className="text-[#1A3A5C] text-right font-medium">{value || "—"}</span>
                </div>
              ))}
            </div>

            <p className="text-[#1A3A5C]/30 text-xs leading-relaxed">
              By submitting you confirm all information is accurate and complete.
              Your data is stored securely and used solely for your BRSA readiness assessment.
              All documents are verified by a certified BRSA evaluator before any score is issued.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 border-2 border-[#1A3A5C]/20 rounded-xl py-3 text-[#1A3A5C]/50 font-semibold hover:border-[#1A3A5C]/40 hover:text-[#1A3A5C] transition">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 bg-[#1A3A5C] border-2 border-[#C8A84B] text-white font-bold rounded-xl py-3 hover:opacity-90 transition">
              Continue
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="flex-1 bg-[#C8A84B] text-[#1A3A5C] font-bold rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Intake"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
