"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const STEPS = [
  "Organization",
  "Governance",
  "Staff",
  "Policy",
  "Financial",
  "Documents",
  "Review",
];

const inputClass =
  "w-full bg-white border border-[#e6dfd2] rounded-xl px-4 py-3 text-[#1A3A5C] placeholder-[#1A3A5C]/30 focus:outline-none focus:border-[#C8A84B] focus:ring-1 focus:ring-[#C8A84B] transition";
const selectClass =
  "w-full bg-white border border-[#e6dfd2] rounded-xl px-4 py-3 text-[#1A3A5C] focus:outline-none focus:border-[#C8A84B] focus:ring-1 focus:ring-[#C8A84B] transition appearance-none";
const labelClass =
  "block text-[#1A3A5C]/50 text-xs uppercase tracking-widest mb-2 font-medium";
const textareaClass =
  "w-full bg-white border border-[#e6dfd2] rounded-xl px-4 py-3 text-[#1A3A5C] placeholder-[#1A3A5C]/30 focus:outline-none focus:border-[#C8A84B] focus:ring-1 focus:ring-[#C8A84B] transition resize-none";

export default function OBRRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [obrSubjectId, setObrSubjectId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Step 0 — Organization Identity
    name: "",
    ein: "",
    legal_structure: "",
    founded_date: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    primary_contact: "",
    contact_email: "",
    contact_phone: "",
    // Step 1 — Governance
    leadership_composition: "",
    board_structure: "",
    decision_making_process: "",
    succession_plan: "",
    // Step 2 — Staff
    staff_count: "",
    turnover_rate: "",
    training_programs: "",
    behavioral_policy: "",
    // Step 3 — Policy & Compliance
    active_policies: "",
    last_audit_date: "",
    compliance_history: "",
    documentation_status: "",
    // Step 4 — Financial
    annual_budget: "",
    funding_sources: "",
    financial_reserves: "",
    sustainability_plan: "",
  });

  const [files, setFiles] = useState<{
    bylaws: File | null;
    org_chart: File | null;
    audit: File | null;
    policy_manual: File | null;
    strategic_plan: File | null;
  }>({
    bylaws: null,
    org_chart: null,
    audit: null,
    policy_manual: null,
    strategic_plan: null,
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function registerSubject() {
    if (!form.name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/obr/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          ein: form.ein,
          legal_structure: form.legal_structure,
          founded_date: form.founded_date,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          primary_contact: form.primary_contact,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      setObrSubjectId(data.obr_subject_id);
      setStep(1);
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitIntake() {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      // Governance
      fd.append("leadership_composition", form.leadership_composition);
      fd.append("board_structure", form.board_structure);
      fd.append("decision_making_process", form.decision_making_process);
      fd.append("succession_plan", form.succession_plan);
      // Staff
      fd.append("staff_count", form.staff_count);
      fd.append("turnover_rate", form.turnover_rate);
      fd.append("training_programs", form.training_programs);
      fd.append("behavioral_policy", form.behavioral_policy);
      // Policy
      fd.append("active_policies", form.active_policies);
      fd.append("last_audit_date", form.last_audit_date);
      fd.append("compliance_history", form.compliance_history);
      fd.append("documentation_status", form.documentation_status);
      // Financial
      fd.append("annual_budget", form.annual_budget);
      fd.append("funding_sources", form.funding_sources);
      fd.append("financial_reserves", form.financial_reserves);
      fd.append("sustainability_plan", form.sustainability_plan);
      // Documents
      if (files.bylaws) fd.append("bylaws", files.bylaws);
      if (files.org_chart) fd.append("org_chart", files.org_chart);
      if (files.audit) fd.append("audit", files.audit);
      if (files.policy_manual) fd.append("policy_manual", files.policy_manual);
      if (files.strategic_plan) fd.append("strategic_plan", files.strategic_plan);

      const res = await fetch(`${API}/obr/subjects/${obrSubjectId}/intake`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Intake submission failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#C8A84B]/20 border-2 border-[#C8A84B] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#C8A84B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#1A3A5C] text-2xl font-bold mb-3">OBR Intake Submitted</h2>
          <div className="w-12 h-[2px] bg-[#C8A84B] mx-auto mb-4" />
          <p className="text-[#1A3A5C]/60 leading-relaxed mb-6">
            {form.name} has been registered as an OBR subject. A BRSA-certified OBR evaluator will review your submission.
          </p>
          <div className="rounded-2xl bg-[#1A3A5C]/5 p-4 text-left mb-6">
            <div className="text-xs text-[#1A3A5C]/40 uppercase tracking-widest mb-1">OBR Subject ID</div>
            <div className="font-mono text-sm text-[#1A3A5C] break-all">{obrSubjectId}</div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-[#1A3A5C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0B1C30] transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1A3A5C]">

      {/* Header */}
      <div className="bg-[#1A3A5C] border-b-4 border-[#C8A84B] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-lg leading-none">LEGACYLINE</div>
          <div className="text-white/40 text-xs">OBR — Organizational Behavioral Readiness</div>
        </div>
        <div className="text-white/50 text-sm">Track II Assessment</div>
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

        {/* Step 0 — Organization Identity */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 01</div>
              <h2 className="text-2xl font-bold mb-1">Organization Identity</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Register your organization as an OBR subject for behavioral readiness evaluation.</p>
            </div>
            <div>
              <label className={labelClass}>Organization Name *</label>
              <input className={inputClass} placeholder="Full legal name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>EIN (Tax ID)</label>
              <input className={inputClass} placeholder="XX-XXXXXXX" value={form.ein} onChange={(e) => set("ein", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Legal Structure</label>
              <select className={selectClass} value={form.legal_structure} onChange={(e) => set("legal_structure", e.target.value)}>
                <option value="">Select one</option>
                <option value="nonprofit_501c3">Nonprofit 501(c)(3)</option>
                <option value="nonprofit_other">Nonprofit Other</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="government">Government Entity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Year Founded</label>
              <input className={inputClass} placeholder="2015" value={form.founded_date} onChange={(e) => set("founded_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Street Address</label>
              <input className={inputClass} placeholder="123 Main St" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} placeholder="Albuquerque" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputClass} placeholder="NM" value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>ZIP Code</label>
              <input className={inputClass} placeholder="87101" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </div>
            <div className="border-t border-[#e6dfd2] pt-5">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-4">Primary Contact</div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input className={inputClass} placeholder="Full name" value={form.primary_contact} onChange={(e) => set("primary_contact", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" className={inputClass} placeholder="contact@org.org" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input type="tel" className={inputClass} placeholder="(505) 555-0100" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
                </div>
              </div>
            </div>
            {error && <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-sm text-red-600">{error}</div>}
            <button
              onClick={registerSubject}
              disabled={loading || !form.name.trim()}
              className="w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] disabled:opacity-50 transition"
            >
              {loading ? "Registering..." : "Register Organization →"}
            </button>
          </div>
        )}

        {/* Step 1 — Governance */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 02</div>
              <h2 className="text-2xl font-bold mb-1">Governance & Leadership</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Describe your organization's leadership structure and governance model.</p>
            </div>
            <div>
              <label className={labelClass}>Leadership Composition</label>
              <textarea rows={3} className={textareaClass} placeholder="Describe executive leadership team, titles, and tenure..." value={form.leadership_composition} onChange={(e) => set("leadership_composition", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Board Structure</label>
              <textarea rows={3} className={textareaClass} placeholder="Board size, composition, meeting frequency..." value={form.board_structure} onChange={(e) => set("board_structure", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Decision-Making Process</label>
              <textarea rows={3} className={textareaClass} placeholder="How are major decisions made? Who has authority?" value={form.decision_making_process} onChange={(e) => set("decision_making_process", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Succession Plan</label>
              <textarea rows={3} className={textareaClass} placeholder="What happens if key leadership departs?" value={form.succession_plan} onChange={(e) => set("succession_plan", e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button onClick={() => setStep(2)} className="flex-2 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] transition">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Staff */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 03</div>
              <h2 className="text-2xl font-bold mb-1">Staff Behavioral Readiness</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Staff patterns are a primary indicator of organizational behavioral readiness.</p>
            </div>
            <div>
              <label className={labelClass}>Total Staff Count</label>
              <input className={inputClass} placeholder="Full-time + part-time" value={form.staff_count} onChange={(e) => set("staff_count", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Annual Turnover Rate</label>
              <input className={inputClass} placeholder="e.g. 15% annually" value={form.turnover_rate} onChange={(e) => set("turnover_rate", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Training Programs</label>
              <textarea rows={3} className={textareaClass} placeholder="What training do staff receive? How often?" value={form.training_programs} onChange={(e) => set("training_programs", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Behavioral Policy Documentation</label>
              <textarea rows={3} className={textareaClass} placeholder="Code of conduct, performance management, HR policies..." value={form.behavioral_policy} onChange={(e) => set("behavioral_policy", e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button onClick={() => setStep(3)} className="flex-2 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] transition">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Policy & Compliance */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 04</div>
              <h2 className="text-2xl font-bold mb-1">Policy & Compliance</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Documentation and compliance posture are measurable indicators of organizational readiness.</p>
            </div>
            <div>
              <label className={labelClass}>Active Policies</label>
              <textarea rows={3} className={textareaClass} placeholder="List active organizational policies..." value={form.active_policies} onChange={(e) => set("active_policies", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last Audit Date</label>
              <input type="date" className={inputClass} value={form.last_audit_date} onChange={(e) => set("last_audit_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Compliance History</label>
              <textarea rows={3} className={textareaClass} placeholder="Any compliance issues, violations, or findings in the past 3 years..." value={form.compliance_history} onChange={(e) => set("compliance_history", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Documentation Status</label>
              <select className={selectClass} value={form.documentation_status} onChange={(e) => set("documentation_status", e.target.value)}>
                <option value="">Select one</option>
                <option value="fully_documented">Fully Documented</option>
                <option value="partially_documented">Partially Documented</option>
                <option value="in_progress">Documentation In Progress</option>
                <option value="minimal">Minimal Documentation</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button onClick={() => setStep(4)} className="flex-2 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] transition">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Financial */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 05</div>
              <h2 className="text-2xl font-bold mb-1">Financial Health</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Financial sustainability is a core component of organizational behavioral readiness.</p>
            </div>
            <div>
              <label className={labelClass}>Annual Operating Budget</label>
              <input className={inputClass} placeholder="$0.00" value={form.annual_budget} onChange={(e) => set("annual_budget", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Primary Funding Sources</label>
              <textarea rows={3} className={textareaClass} placeholder="Grants, contracts, earned revenue, donations..." value={form.funding_sources} onChange={(e) => set("funding_sources", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Financial Reserves</label>
              <input className={inputClass} placeholder="Months of operating reserves" value={form.financial_reserves} onChange={(e) => set("financial_reserves", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Sustainability Plan</label>
              <textarea rows={3} className={textareaClass} placeholder="How does the organization plan to sustain operations?" value={form.sustainability_plan} onChange={(e) => set("sustainability_plan", e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button onClick={() => setStep(5)} className="flex-2 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] transition">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 5 — Documents */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 06</div>
              <h2 className="text-2xl font-bold mb-1">Document Upload</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Upload your organizational documents. All files are encrypted and stored securely.</p>
            </div>
            {[
              { key: "bylaws", label: "Bylaws or Operating Agreement", hint: "Current version of organizational bylaws" },
              { key: "org_chart", label: "Organizational Chart", hint: "Current org chart showing leadership and staff" },
              { key: "audit", label: "Most Recent Audit", hint: "Financial audit or review from last 2 years" },
              { key: "policy_manual", label: "Policy Manual", hint: "Staff handbook or policy documentation" },
              { key: "strategic_plan", label: "Strategic Plan", hint: "Current strategic or operational plan" },
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
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button onClick={() => setStep(6)} className="flex-2 w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] transition">Review →</button>
            </div>
          </div>
        )}

        {/* Step 6 — Review */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="mb-8">
              <div className="text-xs text-[#C8A84B] tracking-widest uppercase font-semibold mb-2">Step 07</div>
              <h2 className="text-2xl font-bold mb-1">Review & Submit</h2>
              <div className="w-10 h-[2px] bg-[#C8A84B] mb-3" />
              <p className="text-[#1A3A5C]/50 text-sm">Review your submission before sending to BRSA for OBR evaluation.</p>
            </div>

            {[
              { label: "Organization", value: form.name },
              { label: "EIN", value: form.ein || "Not provided" },
              { label: "Legal Structure", value: form.legal_structure || "Not provided" },
              { label: "Location", value: form.city && form.state ? `${form.city}, ${form.state}` : "Not provided" },
              { label: "Primary Contact", value: form.primary_contact || "Not provided" },
              { label: "Staff Count", value: form.staff_count || "Not provided" },
              { label: "Annual Budget", value: form.annual_budget || "Not provided" },
              { label: "Documentation Status", value: form.documentation_status || "Not provided" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-[#e6dfd2]">
                <span className="text-xs text-[#1A3A5C]/40 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-medium text-[#1A3A5C]">{value}</span>
              </div>
            ))}

            <div className="rounded-2xl bg-[#1A3A5C]/5 p-4 mt-4">
              <div className="text-xs text-[#1A3A5C]/40 uppercase tracking-widest mb-2">Documents Attached</div>
              {Object.entries(files).map(([key, file]) => (
                <div key={key} className="flex justify-between text-sm py-1">
                  <span className="text-[#1A3A5C]/50 capitalize">{key.replace(/_/g, " ")}</span>
                  <span className={file ? "text-[#C8A84B] font-medium" : "text-[#1A3A5C]/25"}>
                    {file ? "✓ Attached" : "Not uploaded"}
                  </span>
                </div>
              ))}
            </div>

            {error && <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-sm text-red-600">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setStep(5)} className="flex-1 rounded-xl border border-[#1A3A5C]/20 py-3 text-sm font-semibold text-[#1A3A5C]/60 hover:bg-[#1A3A5C]/5 transition">← Back</button>
              <button
                onClick={submitIntake}
                disabled={loading}
                className="flex-2 w-full rounded-xl bg-[#1A3A5C] py-3 text-sm font-semibold text-white hover:bg-[#0B1C30] disabled:opacity-50 transition"
              >
                {loading ? "Submitting..." : "Submit to BRSA for OBR Evaluation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
              }
