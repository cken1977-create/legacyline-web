"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

// -------------------- Loaders --------------------
// Use the ID exactly as provided - NO CONVERSION

export async function getSubject(id: string) {
  try {
    return await apiJSON<any>(`/participants/${id}`, { method: "GET" });
  } catch (error) {
    console.error('Failed to fetch subject:', error);
    throw error;
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

export async function createSubject(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");

  try {
    const response = await apiJSON<any>("/participants", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
      }),
    });

    // Use the ID exactly as the API returns it
    revalidatePath(`/subject/${response.id}`);
    redirect(`/subject/${response.id}`);
  } catch (error) {
    console.error("Failed to create subject:", error);
    throw error;
  }
}

export async function grantConsent(formData: FormData) {
  const id = mustSubjectId(formData);

  await apiJSON(`/participants/${id}/consent`, {
    method: "POST",
    body: JSON.stringify({ scope: "standard" }),
  });

  revalidatePath(`/subject/${id}`);
}

export async function revokeConsent(formData: FormData) {
  const id = mustSubjectId(formData);

  await apiJSON(`/participants/${id}/consent`, {
    method: "DELETE",
  });

  revalidatePath(`/subject/${id}`);
}

export async function recomputeReadiness(formData: FormData) {
  const id = mustSubjectId(formData);

  await apiJSON(`/participants/${id}/compute-readiness`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  revalidatePath(`/subject/${id}`);
}

export async function addCheckIn(formData: FormData) {
  const id = mustSubjectId(formData);

  await apiJSON(`/participants/${id}/evidence`, {
    method: "POST",
    body: JSON.stringify({
      type: "check_in",
      note: "manual check-in",
    }),
  });

  revalidatePath(`/subject/${id}`);
}
