// P1: all browser API calls go through the same-origin BFF (/api/core), which
// attaches the bearer token from an httpOnly cookie.
const API_BASE = "/api/core";

export interface TrainingModule {
  module_id: string;
  title: string;
  description: string;
  video_url: string | null;
  seq: number;
  passing_score: number;
}

export interface ModuleProgress {
  module_id: string;
  title: string;
  seq: number;
  status: "locked" | "unlocked" | "passed" | "failed";
  score: number | null;
  attempts: number;
  unlocked_at: string | null;
  completed_at: string | null;
}

export interface Evaluator {
  evaluator_id: string;
  full_name: string;
  email: string;
  status: string;
  certified: boolean;
  certified_at: string | null;
  created_at: string;
  organization: string;
}

export interface EvaluatorProgress {
  evaluator_id: string;
  total: number;
  progress: ModuleProgress[];
}

export interface AttemptResult {
  evaluator_id: string;
  module_id: string;
  score: number;
  passing: number;
  passed: boolean;
  status: string;
}

// Phase S: tokens issued by legacyline-core. Staff (evaluator) token wins over
// an individual token if both exist in this browser.
export const STAFF_TOKEN_KEY = "staff_token";
export const STAFF_EMAIL_KEY = "staff_email";

// P1: tokens are no longer readable by page code. authHeaders() is kept so
// existing call sites compile; the BFF adds Authorization server-side.
export function authHeaders(): Record<string, string> {
  return {};
}

// Drop bearer tokens left in localStorage by pre-P1 builds.
if (typeof window !== "undefined") {
  for (const k of ["individual_token", "org_token", STAFF_TOKEN_KEY]) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* storage disabled */
    }
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export const apiMethods = {
  getModules: () => api<TrainingModule[]>("/training/modules"),

  createEvaluator: (data: {
    full_name: string;
    email: string;
    organization: string;
  }) =>
    api<Evaluator>("/evaluators", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  lookupByEmail: (email: string) =>
    api<Evaluator>(
      `/evaluators/lookup?email=${encodeURIComponent(email)}`
    ),

  getProgress: (evaluatorId: string) =>
    api<EvaluatorProgress>(`/evaluators/${evaluatorId}/progress`),

  submitAttempt: (
    evaluatorId: string,
    moduleId: string,
    score: number
  ) =>
    api<AttemptResult>(
      `/evaluators/${evaluatorId}/progress/${moduleId}/attempt`,
      { method: "POST", body: JSON.stringify({ score }) }
    ),
};
