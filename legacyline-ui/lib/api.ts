const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app"
).replace(/\/+$/, "");

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

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
