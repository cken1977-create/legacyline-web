"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateParticipantResponse = {
  participant_id?: string;
  id?: string;
};

type TierCelebration = {
  tier: number;
  title: string;
  subtitle: string;
  points: number;
  totalPoints: number;
  badge: string;
  color: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_CELEBRATIONS: TierCelebration[] = [
  {
    tier: 1,
    title: "Journey Started",
    subtitle: "You've taken the first step. Your readiness story begins now.",
    points: 15,
    totalPoints: 15,
    badge: "🌱",
    color: "#C8A84B",
  },
  {
    tier: 2,
    title: "Story Told",
    subtitle: "Your background is documented. Every step counts.",
    points: 25,
    totalPoints: 40,
    badge: "📖",
    color: "#4B9BC8",
  },
  {
    tier: 3,
    title: "Verified & Ready",
    subtitle: "Your documents are secured. A certified evaluator will review your intake.",
    points: 35,
    totalPoints: 75,
    badge: "✦",
    color: "#C84B8A",
  },
];

const READINESS_LABELS = [
  { min: 0,  max: 24,  label: "Emerging",      color: "#888" },
  { min: 25, max: 49,  label: "Developing",    color: "#C8A84B" },
  { min: 50, max: 69,  label: "Progressing",   color: "#4B9BC8" },
  { min: 70, max: 89,  label: "Provider Ready", color: "#4BC87A" },
  { min: 90, max: 100, label: "BRSA Certified", color: "#C84B8A" },
];

function getReadinessLabel(score: number) {
  return READINESS_LABELS.find((r) => score >= r.min && score <= r.max) || READINESS_LABELS[0];
}

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

// ─── HEIC → JPEG conversion ───────────────────────────────────────────────────
// Uses browser-native canvas — no library needed.
// Falls back to original file if conversion fails or file is not HEIC.

async function normalizeImageFile(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const converted = new File(
            [blob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" }
          );
          resolve(converted);
        },
        "image/jpeg",
        0.88
      );
    });
  } catch {
    // createImageBitmap may not support HEIC on all browsers — fall back to original
    return file;
  }
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const label = getReadinessLabel(displayed);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    if (!animate) return;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [animate, score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={label.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {displayed}
        </span>
        <span className="text-xs font-medium mt-0.5" style={{ color: label.color }}>
          {label.label}
        </span>
      </div>
    </div>
  );
}

// ─── Celebration Screen ───────────────────────────────────────────────────────

function CelebrationScreen({
  celebration,
  onContinue,
}: {
  celebration: TierCelebration;
  onContinue: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setAnimateScore(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(6, 13, 24, 0.97)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${celebration.color}18 0%, transparent 65%)` }}
      />

      <div
        className="text-6xl mb-6"
        style={{
          transform: visible ? "scale(1) translateY(0)" : "scale(0.4) translateY(20px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {celebration.badge}
      </div>

      <div
        className="text-xs font-semibold tracking-widest uppercase mb-2"
        style={{
          color: celebration.color,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.4s ease 0.15s",
        }}
      >
        Tier {celebration.tier} Complete
      </div>

      <h1
        className="text-3xl font-bold text-white text-center mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.4s ease 0.2s",
        }}
      >
        {celebration.title}
      </h1>

      <p
        className="text-sm text-white/50 text-center max-w-xs mb-8"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}
      >
        {celebration.subtitle}
      </p>

      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.8)", transition: "all 0.5s ease 0.35s" }}>
        <ScoreRing score={celebration.totalPoints} animate={animateScore} />
      </div>

      <div
        className="mt-4 mb-8 px-4 py-2 rounded-full text-sm font-semibold"
        style={{
          background: `${celebration.color}18`,
          border: `1px solid ${celebration.color}40`,
          color: celebration.color,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.5s",
        }}
      >
        +{celebration.points} pts earned
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs rounded-2xl py-4 text-sm font-semibold text-black transition-all active:scale-95"
        style={{
          background: celebration.color,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.4s ease 0.6s, background 0.2s",
        }}
      >
        {celebration.tier < 3 ? "Continue to Next Step →" : "View My Dashboard →"}
      </button>
    </div>
  );
}

// ─── Tier Progress Bar ────────────────────────────────────────────────────────

function TierProgress({ currentTier }: { currentTier: number }) {
  const tiers = [
    { num: 1, label: "Welcome" },
    { num: 2, label: "Your Story" },
    { num: 3, label: "Documents" },
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-1">
      {tiers.map((t, i) => (
        <div key={t.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: t.num < currentTier ? "#C8A84B" : t.num === currentTier ? "rgba(200,168,75,0.2)" : "rgba(255,255,255,0.05)",
                border: t.num <= currentTier ? "2px solid #C8A84B" : "2px solid rgba(255,255,255,0.1)",
                color: t.num <= currentTier ? (t.num < currentTier ? "#000" : "#C8A84B") : "rgba(255,255,255,0.3)",
              }}
            >
              {t.num < currentTier ? "✓" : t.num}
            </div>
            <span className="text-xs mt-1" style={{ color: t.num <= currentTier ? "#C8A84B" : "rgba(255,255,255,0.3)" }}>
              {t.label}
            </span>
          </div>
          {i < tiers.length - 1 && (
            <div
              className="flex-1 h-px mx-2 mb-4 transition-all duration-500"
              style={{ background: t.num < currentTier ? "#C8A84B" : "rgba(255,255,255,0.1)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── File Upload Row ──────────────────────────────────────────────────────────

function FileUploadRow({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/60">{label}</label>
      <p className="text-white/30 text-xs mb-2">{hint}</p>
      <label
        className="flex items-center gap-3 w-full rounded-xl px-4 py-4 cursor-pointer transition-all"
        style={{
          background: file ? "rgba(200,168,75,0.08)" : "rgba(0,0,0,0.2)",
          border: file ? "1.5px solid rgba(200,168,75,0.5)" : "1.5px dashed rgba(255,255,255,0.15)",
        }}
      >
        <span className="text-xl shrink-0">{file ? "✓" : "📎"}</span>
        <span className="text-sm" style={{ color: file ? "#C8A84B" : "rgba(255,255,255,0.35)" }}>
          {file ? file.name : "Tap to upload"}
        </span>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,application/pdf,image/heic,image/heif,.heic,.heif"
          onChange={async (e) => {
            const raw = e.target.files?.[0] || null;
            if (!raw) { onChange(null); return; }
            const normalized = await normalizeImageFile(raw);
            onChange(normalized);
          }}
        />
      </label>
    </div>
  );
}

// ─── Main Intake Form ─────────────────────────────────────────────────────────

function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tier, setTier] = useState(1);
  const [celebration, setCelebration] = useState<TierCelebration | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Tier 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Tier 2
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [housingType, setHousingType] = useState("");
  const [monthlyHousingCost, setMonthlyHousingCost] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  // Tier 3
  const [govId, setGovId] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);

  useEffect(() => {
    const first = searchParams.get("first_name");
    const last = searchParams.get("last_name");
    const em = searchParams.get("email");
    if (first) setFirstName(first);
    if (last) setLastName(last);
    if (em) setEmail(em);
  }, [searchParams]);

  function buildDob() {
    if (!dobYear || !dobMonth || !dobDay) return "";
    return `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}`;
  }

  // ── Tier 1 ──
  async function submitTier1() {
    if (!firstName.trim() || !lastName.trim() || !dobYear || !dobMonth || !dobDay) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setMessage("Please provide at least an email or phone number.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const data = await api<CreateParticipantResponse>("/participants", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dob: buildDob(),
          email: email.trim(),
          phone: phone.trim() ? normalizePhone(phone) : "",
        }),
      });
      const pid = data.participant_id || data.id;
      if (!pid) { setMessage("Something went wrong. Please try again."); return; }
      setParticipantId(pid);
      sessionStorage.setItem("ll_intake_pid", pid);
      setCelebration(TIER_CELEBRATIONS[0]);
    } catch (err: any) {
      setMessage(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Tier 2 ──
  async function submitTier2() {
    if (!address.trim() || !city.trim() || !stateVal.trim() || !zip.trim()) {
      setMessage("Please complete your address.");
      return;
    }
    if (!housingType || !employmentStatus) {
      setMessage("Please select your housing and employment status.");
      return;
    }
    setMessage("");
    setCelebration(TIER_CELEBRATIONS[1]);
  }

  // ── Tier 3 ──
  async function submitTier3() {
    if (!govId) {
      setMessage("Please upload a government-issued ID to continue.");
      return;
    }
    const pid = participantId || sessionStorage.getItem("ll_intake_pid");
if (!pid) {
  setMessage("Session error. Please start over.");
  return;
}
    setLoading(true);
    setMessage("Connecting...");
    try {
      const fd = new FormData();
      fd.append("dob", buildDob());
      fd.append("address", address.trim());
      fd.append("city", city.trim());
      fd.append("state", stateVal.trim().toUpperCase());
      fd.append("zip", zip.trim());
      fd.append("housing_type", housingType);
      fd.append("monthly_housing_cost", monthlyHousingCost.trim());
      fd.append("employment_status", employmentStatus);
      fd.append("employer_name", employerName.trim());
      fd.append("monthly_income", monthlyIncome.trim());
      fd.append("gov_id", govId);
      if (selfie) fd.append("selfie", selfie);
      if (bankStatement) fd.append("bank_statement", bankStatement);

      const res = await fetch(`${API}/intake/${pid}`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Submission failed. Please try again.");
      }

      setCelebration(TIER_CELEBRATIONS[2]);
    } catch (err: any) {
      setMessage(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCelebrationContinue() {
    if (!celebration) return;
    if (celebration.tier === 3) {
      // Route to participant-specific dashboard
      const pid = participantId || sessionStorage.getItem("ll_intake_pid");
      router.push(pid ? `/dashboard/individual/${pid}` : "/dashboard/individual");
      return;
    }
    setCelebration(null);
    setTier(celebration.tier + 1);
    setMessage("");
  }

  if (celebration) {
    return <CelebrationScreen celebration={celebration} onContinue={handleCelebrationContinue} />;
  }

  const selectStyle = { background: "rgba(0,0,0,0.3)", colorScheme: "dark" as const };
  const inputClass = "w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60";
  const selectClass = "w-full rounded-xl px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60";
  const labelClass = "mb-1.5 block text-xs font-medium text-white/60";

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <TierProgress currentTier={tier} />

        {/* ── TIER 1 ── */}
        {tier === 1 && (
          <div>
            <div className="mb-6">
              <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#C8A84B" }}>
                Step 1 of 3 · +15 pts
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Welcome to Legacyline
              </h2>
              <p className="mt-1 text-sm text-white/50">Let's start simple. Just the basics to get you in the door.</p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Date of Birth *</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className={selectClass} style={selectStyle}>
                    <option value="">Month</option>
                    {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
                      <option key={m} value={m}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</option>
                    ))}
                  </select>
                  <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className={selectClass} style={selectStyle}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className={selectClass} style={selectStyle}>
                    <option value="">Year</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className={selectClass} style={selectStyle}>
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => String(2006 - i)).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" placeholder="(832) 555-0100" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* ── TIER 2 ── */}
        {tier === 2 && (
          <div>
            <div className="mb-6">
              <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#4B9BC8" }}>
                Step 2 of 3 · +25 pts
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Tell Us Your Story
              </h2>
              <p className="mt-1 text-sm text-white/50">Where you are right now. No judgment — just your starting point.</p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Street Address *</label>
                <input placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City *</label>
                  <input placeholder="Albuquerque" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input placeholder="NM" value={stateVal} onChange={(e) => setStateVal(e.target.value)} maxLength={2} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>ZIP Code *</label>
                <input placeholder="87102" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={10} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Housing Type *</label>
                <select value={housingType} onChange={(e) => setHousingType(e.target.value)} className={selectClass} style={selectStyle}>
                  <option value="">Select status</option>
                  <option value="own">Own</option>
                  <option value="rent">Renting</option>
                  <option value="with_family">Staying with Family or Friends</option>
                  <option value="transitional">Transitional Housing</option>
                  <option value="unhoused">Unhoused</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Monthly Rent or Mortgage</label>
                <input placeholder="$0.00" value={monthlyHousingCost} onChange={(e) => setMonthlyHousingCost(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Employment Status *</label>
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} className={selectClass} style={selectStyle}>
                  <option value="">Select status</option>
                  <option value="employed_full">Employed — Full Time</option>
                  <option value="employed_part">Employed — Part Time</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed_looking">Unemployed — Actively Looking</option>
                  <option value="unemployed_not_looking">Unemployed — Not Currently Looking</option>
                  <option value="in_program">In a Workforce Program</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Employer Name (if applicable)</label>
                <input placeholder="Company name" value={employerName} onChange={(e) => setEmployerName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Monthly Take-Home Pay</label>
                <input placeholder="$0.00" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* ── TIER 3 ── */}
        {tier === 3 && (
          <div>
            <div className="mb-6">
              <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#C84B8A" }}>
                Step 3 of 3 · +35 pts
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Secure Your Record
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Upload your documents. Encrypted and only reviewed by your assigned BRSA evaluator.
              </p>
            </div>

            <div className="grid gap-5">
              <FileUploadRow
                label="Government-Issued ID *"
                hint="Driver's license, passport, state ID, or tribal ID"
                file={govId}
                onChange={setGovId}
              />
              <FileUploadRow
                label="Selfie Holding Your ID"
                hint="A clear photo of you holding your ID"
                file={selfie}
                onChange={setSelfie}
              />
              <FileUploadRow
                label="Most Recent Bank Statement"
                hint="Last 30 days — PDF or photo"
                file={bankStatement}
                onChange={setBankStatement}
              />

              <div className="rounded-xl p-4 ring-1 ring-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#C84B8A" }}>
                  What happens next
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Your documents are encrypted and stored securely",
                    "A certified BRSA evaluator reviews your intake within 2 business days",
                    "You'll receive a confirmation once review is complete",
                    "You control what is shared with any institution",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                      <span style={{ color: "#C84B8A" }}>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4 ring-1 ring-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs text-white/35 leading-relaxed">
                  🔒 By submitting you confirm all information is accurate. Your data is stored securely and used solely for your BRSA readiness assessment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {message && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={tier === 1 ? submitTier1 : tier === 2 ? submitTier2 : submitTier3}
          disabled={loading}
          className="mt-6 w-full rounded-xl py-4 text-sm font-semibold text-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: tier === 1 ? "#C8A84B" : tier === 2 ? "#4B9BC8" : "#C84B8A" }}
        >
          {loading
            ? "Saving..."
            : tier === 1
            ? "Start My Journey →"
            : tier === 2
            ? "Tell My Story →"
            : "Submit & Secure My Record →"}
        </button>

        <p className="mt-3 text-center text-xs text-white/30">
          Complete this step to earn +{tier === 1 ? 15 : tier === 2 ? 25 : 35} readiness points
        </p>
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
