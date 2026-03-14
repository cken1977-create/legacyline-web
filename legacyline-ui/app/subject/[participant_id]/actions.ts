"use server";

import { revalidatePath } from "next/cache";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://legacyline-core-production.up.railway.app").replace(/\/+$/, "");

async function apiJSON<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<T> {
  const segments = path.split('/').map(segment => {
    if (segment.includes('ptc-') || segment.includes('.') || segment.includes('_')) {
      return encodeURIComponent(segment);
    }
    return segment;
  });

  const encodedPath = segments.join('/');
  const url = `${API_BASE}${encodedPath.startsWith("/") ? encodedPath : `/${encodedPath}`}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`API ${res.status} @ ${url}: ${text || res.statusText}`);
    if (!text) return {} as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } finally {
    clearTimeout(timeout);
  }
}

// -------------------- Loaders --------------------

export async function getSubject(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}`, { method: "GET" });
  } catch {
    return null;
  }
}

export async function getConsent(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}/consent`, { method: "GET" });
  } catch {
    return { status: "none", timeline: [] };
  }
}

export async function getReadiness(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}/readiness`, { method: "GET" });
  } catch {
    return { readiness: null, timeline: [] };
  }
}

export async function getEvidenceEvents(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}/evidence`, { method: "GET" });
  } catch {
    return { events: [], timeline: [] };
  }
}

export async function getStateHistory(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}/state-history`, { method: "GET" });
  } catch {
    return { entries: [], timeline: [] };
  }
}

// -------------------- Actions --------------------

function mustSubjectId(formData: FormData) {
  const subjectId = String(formData.get("subjectId") || "").trim();
  if (!subjectId) throw new Error("Missing subjectId");
  return subjectId;
}

export async function transitionState(id: string, to: string, reason: string) {
  const result = await apiJSON<any>(`/participants/${id}/state`, {
    method: "POST",
    body: JSON.stringify({ to, reason }),
  });
  revalidatePath(`/subject/${id}`);
  return result;
}

export async function grantConsent(formData: FormData) {
  const id = mustSubjectId(formData);
  const result = await apiJSON(`/participants/${id}/consent`, {
    method: "POST",
    body: JSON.stringify({
      scope: "behavioral_readiness_v1",
      terms: "v1",
      reason: "Consent granted via UI",
    }),
  });
  revalidatePath(`/subject/${id}`);
  return result;
}

export async function revokeConsent(formData: FormData) {
  const id = mustSubjectId(formData);
  const result = await apiJSON(`/participants/${id}/consent`, {
    method: "DELETE",
    body: JSON.stringify({ reason: "Consent revoked via UI" }),
  });
  revalidatePath(`/subject/${id}`);
  return result;
}

export async function recomputeReadiness(formData: FormData) {
  const id = mustSubjectId(formData);
  const result = await apiJSON(`/participants/${id}/readiness/compute`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  revalidatePath(`/subject/${id}`);
  return result;
}

export async function addCheckIn(formData: FormData) {
  const id = mustSubjectId(formData);
  const result = await apiJSON(`/participants/${id}/evidence`, {
    method: "POST",
    body: JSON.stringify({
      type: "check_in",
      note: "Manual check-in via UI",
      timestamp: new Date().toISOString(),
    }),
  });
  revalidatePath(`/subject/${id}`);
  return result;
}
