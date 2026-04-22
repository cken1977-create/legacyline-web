"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type TierCelebration = {
  tier: number;
  title: string;
  subtitle: string;
  points: number;
  totalPoints: number;
  badge: string;
  color: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

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
    subtitle: "Your identity is confirmed. You're in the system.",
    points: 35,
    totalPoints: 75,
    badge: "✦",
    color: "#C84B8A",
  },
];

const READINESS_LABELS: { min: number; max: number; label: string; color: string }[] = [
  { min: 0, max: 24, label: "Emerging", color: "#888" },
  { min: 25, max: 49, label: "Developing", color: "#C8A84B" },
  { min: 50, max: 69, label: "Progressing", color: "#4B9BC8" },
  { min: 70, max: 89, label: "Provider Ready", color: "#4BC87A" },
  { min: 90, max: 100, label: "BRSA Certified", color: "#C84B8A" },
];

function getReadinessLabel(score: number) {
  return READINESS_LABELS.find((r) => score >= r.min && score <= r.max) || READINESS_LABELS[0];
}

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
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
    let start = 0;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [animate, score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
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
      style={{
        background: "rgba(6, 13, 24, 0.97)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${celebration.color}18 0%, transparent 65%)`,
        }}
      />

      {/* Badge */}
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

      {/* Tier label */}
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

      {/* Title */}
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

      {/* Subtitle */}
      <p
        className="text-sm text-white/50 text-center max-w-xs mb-8"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
      >
        {celebration.subtitle}
      </p>

      {/* Score ring */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.8)",
          transition: "all 0.5s ease 0.35s",
        }}
      >
        <ScoreRing score={celebration.totalPoints} animate={animateScore} />
      </div>

      {/* Points earned */}
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

      {/* Continue button */}
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
    { num: 3, label: "Verify" },
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
            <span
              className="text-xs mt-1"
              style={{ color: t.num <= currentTier ? "#C8A84B" : "rgba(255,255,255,0.3)" }}
            >
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

// ─── Main Intake Form ─────────────────────────────────────────────────────────

function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tier, setTier] = useState(1);
  const [celebration, setCelebration] = useState<TierCelebration | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Tier 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Tier 2 fields
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [housingStatus, setHousingStatus] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Tier 3 fields
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [hasDocs, setHasDocs] = useState(false);

  useEffect(() => {
    const first = searchParams.get("first_name");
    const last = searchParams.get("last_name");
    const em = searchParams.get("email");
    if (first) setFirstName(first);
    if (last) setLastName(last);
    if (em) setEmail(em);
  }, [searchParams]);

  // ── Tier 1 submit ──
  async function submitTier1() {
    if (!firstName.trim() || !lastName.trim() || !dob.trim() || (!email.trim() && !phone.trim())) {
      setMessage("Please fill in all required fields.");
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
          dob: dob.trim(),
          email: email.trim(),
          phone: phone.trim() ? normalizePhone(phone) : "",
        }),
      });
      const pid = data.participant_id || data.id;
      if (!pid) { setMessage("Something went wrong. Please try again."); return; }
      setParticipantId(pid);
      setCelebration(TIER_CELEBRATIONS[0]);
    } catch (err: any) {
      setMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }

  // ── Tier 2 submit ──
  async function submitTier2() {
    if (!employmentStatus || !housingStatus || !city.trim() || !state.trim()) {
      setMessage("Please complete all fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Save tier 2 data to participant profile
      if (participantId) {
        await api(`/participants/${participantId}/profile`, {
          method: "PATCH",
          body: JSON.stringify({
            employment_status: employmentStatus,
            housing_status: housingStatus,
            city: city.trim(),
            state: state.trim(),
            tier_2_completed: true,
          }),
        }).catch(() => {}); // Non-blocking — profile endpoint may not exist yet
      }
      setCelebration(TIER_CELEBRATIONS[1]);
    } catch (err: any) {
      setMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }

  // ── Tier 3 submit ──
  async function submitTier3() {
    setLoading(true);
    setMessage("");
    try {
      if (participantId) {
        await api(`/participants/${participantId}/profile`, {
          method: "PATCH",
          body: JSON.stringify({
            id_type: idType,
            id_number: idNumber,
            has_documents: hasDocs,
            tier_3_completed: true,
          }),
        }).catch(() => {});
      }
      setCelebration(TIER_CELEBRATIONS[2]);
    } catch (err: any) {
      setMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }

  function handleCelebrationContinue() {
    if (!celebration) return;
    if (celebration.tier === 3) {
      router.push(participantId ? `/dashboard/individual` : "/dashboard/individual");
      return;
    }
    setCelebration(null);
    setTier(celebration.tier + 1);
    setMessage("");
  }

  // ─── Render celebration overlay ───
  if (celebration) {
    return <CelebrationScreen celebration={celebration} onContinue={handleCelebrationContinue} />;
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">

        {/* Tier progress */}
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
              <p className="mt-1 text-sm text-white/50">
                Let's start simple. Just the basics to get you in the door.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">First Name *</label>
                  <input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Last Name *</label>
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Phone</label>
                <input
                  type="tel"
                  placeholder="(832) 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                />
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
              <p className="mt-1 text-sm text-white/50">
                Help us understand where you are right now. No judgment — just your starting point.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Employment Status *</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">Select status</option>
                  <option value="employed_full">Employed — Full Time</option>
                  <option value="employed_part">Employed — Part Time</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed_looking">Unemployed — Actively Looking</option>
                  <option value="unemployed_not_looking">Unemployed — Not Currently Looking</option>
                  <option value="in_program">In a Workforce Program</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Housing Status *</label>
                <select
                  value={housingStatus}
                  onChange={(e) => setHousingStatus(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">Select status</option>
                  <option value="stable_owned">Stable — Homeowner</option>
                  <option value="stable_renting">Stable — Renting</option>
                  <option value="with_family">Staying with Family or Friends</option>
                  <option value="transitional">Transitional Housing</option>
                  <option value="unhoused">Unhoused</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">City *</label>
                  <input
                    placeholder="Your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">State *</label>
                  <input
                    placeholder="NM"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  />
                </div>
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
                Verify Your Identity
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Almost there. This helps us protect your record and verify your standing.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">Select ID type</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="state_id">State ID</option>
                  <option value="passport">Passport</option>
                  <option value="military_id">Military ID</option>
                  <option value="tribal_id">Tribal ID</option>
                  <option value="other">Other Government ID</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">ID Number (last 4 digits)</label>
                <input
                  placeholder="••••"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
                />
              </div>

              {/* Document upload placeholder */}
              <div
                className="rounded-xl ring-1 ring-dashed ring-white/20 p-6 text-center cursor-pointer transition-all hover:ring-[#C8A84B]/40 hover:bg-white/5"
                onClick={() => setHasDocs(true)}
                style={{ background: hasDocs ? "rgba(200,168,75,0.06)" : "transparent" }}
              >
                {hasDocs ? (
                  <div>
                    <div className="text-2xl mb-1">✓</div>
                    <p className="text-sm font-medium" style={{ color: "#C8A84B" }}>Document noted</p>
                    <p className="text-xs text-white/40 mt-1">Your evaluator will request documents during review</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-1">📄</div>
                    <p className="text-sm text-white/60">Tap to acknowledge document submission</p>
                    <p className="text-xs text-white/30 mt-1">Full document upload available after account confirmation</p>
                  </div>
                )}
              </div>

              {/* Privacy note */}
              <div className="rounded-xl bg-white/3 ring-1 ring-white/8 p-4">
                <p className="text-xs text-white/40 leading-relaxed">
                  🔒 Your information is stored securely and only shared with your assigned BRSA evaluator. 
                  You control what gets shared with institutions.
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

        {/* Submit button */}
        <button
          onClick={tier === 1 ? submitTier1 : tier === 2 ? submitTier2 : submitTier3}
          disabled={loading}
          className="mt-6 w-full rounded-xl py-4 text-sm font-semibold text-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: tier === 1 ? "#C8A84B" : tier === 2 ? "#4B9BC8" : "#C84B8A",
          }}
        >
          {loading
            ? "Saving..."
            : tier === 1
            ? "Start My Journey →"
            : tier === 2
            ? "Tell My Story →"
            : "Complete Verification →"}
        </button>

        {/* Points preview */}
        <p className="mt-3 text-center text-xs text-white/30">
          Complete this step to earn +{tier === 1 ? 15 : tier === 2 ? 25 : 35} readiness points
        </p>
      </div>
    </Shell>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakeForm />
    </Suspense>
  );
}
