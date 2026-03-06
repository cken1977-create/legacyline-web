"use server";

import { revalidatePath } from "next/cache";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://legacyline-core-production.up.railway.app").replace(/\/$/, "");

async function apiJSON<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

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

    if (!res.ok) {
      throw new Error(`API ${res.status} @ ${url}: ${text || res.statusText}`);
    }

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

// Helper to convert frontend ID format to backend ID format
function toBackendId(id: string): string {
  // Convert ptc- to pict- and . to ,
  return id.replace('ptc-', 'pict-').replace('.', ',');
}

// -------------------- Loaders --------------------

export async function getSubject(id: string) {
  const backendId = toBackendId(id);
  return apiJSON<any>(`/participants/${backendId}`, { method: "GET" });
}

export async function getConsent(id: string) {
  const backendId = toBackendId(id);
  try {
    return await apiJSON<any>(`/participants/${backendId}/consent`, { method: "GET" });
  } catch {
    return { status: "none", timeline: [] };
  }
}

export async function getReadiness(id: string) {
  const backendId = toBackendId(id);
  try {
    return await apiJSON<any>(`/participants/${backendId}/readiness`, { method: "GET" });
  } catch {
    return { readiness: null, timeline: [] };
  }
}

export async function getEvidenceEvents(id: string) {
  const backendId = toBackendId(id);
  try {
    return await apiJSON<any>(`/participants/${backendId}/evidence`, { method: "GET" });
  } catch {
    return { events: [], timeline: [] };
  }
}

export async function getStateHistory(id: string) {
  const backendId = toBackendId(id);
  try {
    return await apiJSON<any>(`/participants/${backendId}/state-history`, { method: "GET" });
  } catch {
    return { entries: [], timeline: [] };
  }
}

// -------------------- Actions (REAL server actions) --------------------
// These MUST accept FormData.

function mustSubjectId(formData: FormData) {
  const subjectId = String(formData.get("subjectId") || "").trim();
  if (!subjectId) throw new Error("Missing subjectId");
  return subjectId;
}

export async function grantConsent(formData: FormData) {
  const id = mustSubjectId(formData);
  const backendId = toBackendId(id);

  await apiJSON(`/participants/${backendId}/consent`, {
    method: "POST",
    body: JSON.stringify({ scope: "standard" }),
  });

  revalidatePath(`/subject/${id}`);
}

export async function revokeConsent(formData: FormData) {
  const id = mustSubjectId(formData);
  const backendId = toBackendId(id);

  await apiJSON(`/participants/${backendId}/consent`, {
    method: "DELETE",
  });

  revalidatePath(`/subject/${id}`);
}

export async function recomputeReadiness(formData: FormData) {
  const id = mustSubjectId(formData);
  const backendId = toBackendId(id);

  await apiJSON(`/participants/${backendId}/compute-readiness`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  revalidatePath(`/subject/${id}`);
}

export async function addCheckIn(formData: FormData) {
  const id = mustSubjectId(formData);
  const backendId = toBackendId(id);

  await apiJSON(`/participants/${backendId}/evidence`, {
    method: "POST",
    body: JSON.stringify({
      type: "check_in",
      note: "manual check-in",
    }),
  });

  revalidatePath(`/subject/${id}`);
      }
