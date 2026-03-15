"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IndividualLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login/individual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard/individual");
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <span className="text-2xl font-semibold tracking-tight text-white">L</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Legacyline</h1>
          <p className="mt-1 text-sm text-white/50">Individual Portal</p>
        </div>

        <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <h2 className="text-lg font-semibold text-white">Individual Login</h2>
          <p className="mt-1 text-sm text-white/50">
            Sign in to view your documents and progress tracking.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
              />
            </div>

            <div>
             <label className="mb-1.5 block text-xs font-medium text-white/60">
              Password
            </label>
             <div className="relative">
              <input
               type={showPassword ? "text" : "password"}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
                required
               className="w-full rounded-xl bg-black/30 px-4 py-3 pr-20 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
             />
              <button
               type="button"
               onClick={() => setShowPassword((prev) => !prev)}
               className="absolute inset-y-0 right-2 px-2 text-sm font-medium text-[#C8A84B]"
            >
             {showPassword ? "Hide" : "Show"}
            </button>
           </div>
          </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C8A84B] py-3 text-sm font-semibold text-black hover:bg-[#dcc47a] disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Legacyline · Powered by BRSA doctrine
        </p>
      </div>
    </div>
  );
}
