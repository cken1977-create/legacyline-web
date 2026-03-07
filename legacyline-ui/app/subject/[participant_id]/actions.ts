"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://legacyline-core-production.up.railway.app").replace(/\/+$/, "");

async function apiJSON<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<T> {
  // Properly encode each segment of the path to handle special characters like dots
  const segments = path.split('/').map(segment => {
    // If the segment contains special characters, encode it
    if (segment.includes('ptc-') || segment.includes('.') || segment.includes('_')) {
      return encodeURIComponent(segment);
    }
    return segment;
  });
  
  const encodedPath = segments.join('/');
  const url = `${API_BASE}${encodedPath.startsWith("/") ? encodedPath : `/${encodedPath}`}`;
  
  console.log(`🌐 Fetching URL: ${url}`);

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
      // Log full error details
      console.error("❌ Full error response:", {
        status: res.status,
        statusText: res.statusText,
        body: text,
        url: url
      });
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

export async function getSubject(id: string) {
  try {
    console.log(`🔍 Fetching subject: ${id}`);
    return await apiJSON<any>(`/participants/${id}`, { method: "GET" });
  } catch (error) {
    console.error('❌ Failed to fetch subject:', error);
    throw error;
  }
}

export async function getConsent(id: string) {
  try {
    console.log(`🔍 Fetching consent for: ${id}`);
    return await apiJSON<any>(`/participants/${id}/consent`, { method: "GET" });
  } catch {
    console.log(`⚠️ No consent found for: ${id}, returning default`);
    return { status: "none", timeline: [] };
  }
}

export async function getReadiness(id: string) {
  try {
    console.log(`🔍 Fetching readiness for: ${id}`);
    return await apiJSON<any>(`/participants/${id}/readiness`, { method: "GET" });
  } catch {
    console.log(`⚠️ No readiness found for: ${id}, returning default`);
    return { readiness: null, timeline: [] };
  }
}

export async function getEvidenceEvents(id: string) {
  try {
    console.log(`🔍 Fetching evidence for: ${id}`);
    return await apiJSON<any>(`/participants/${id}/evidence`, { method: "GET" });
  } catch {
    console.log(`⚠️ No evidence found for: ${id}, returning default`);
    return { events: [], timeline: [] };
  }
}

export async function getStateHistory(id: string) {
  try {
    console.log(`🔍 Fetching state history for: ${id}`);
    return await apiJSON<any>(`/participants/${id}/state-history`, { method: "GET" });
  } catch {
    console.log(`⚠️ No state history found for: ${id}, returning default`);
    return { entries: [], timeline: [] };
  }
}

// -------------------- Actions --------------------

function mustSubjectId(formData: FormData) {
  const subjectId = String(formData.get("subjectId") || "").trim();
  console.log("🔍 Raw subjectId from form:", subjectId);
  if (!subjectId) throw new Error("Missing subjectId");
  return subjectId;
}

export async function createSubject(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");

  console.log("📝 Creating new subject:", { name, email, phone });

  try {
    const response = await apiJSON<any>("/participants", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
      }),
    });

    console.log("✅ Subject created successfully:", response);
    revalidatePath(`/subject/${response.id}`);
    redirect(`/subject/${response.id}`);
  } catch (error) {
    console.error("❌ Failed to create subject:", error);
    throw error;
  }
}

export async function grantConsent(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("🔵 Grant consent started for:", id);
    
    const payload = { 
      scope: "behavioral_readiness_v1",
      terms: "v1",
      reason: "Consent granted via UI"
    };
    console.log("📦 Grant consent payload:", payload);
    
    // Use the correct endpoint directly - no looping
    const result = await apiJSON(`/participants/${id}/consent`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    console.log(`✅ Grant consent successful:`, result);
    revalidatePath(`/subject/${id}`);
    return result;
    
  } catch (error) {
    console.error("🔥 Grant consent failed:", error);
    throw error;
  }
}

export async function revokeConsent(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("🔴 Revoke consent started for:", id);
    
    const payload = {
      reason: "Consent revoked via UI"
    };
    
    const result = await apiJSON(`/participants/${id}/consent`, {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
    
    console.log(`✅ Revoke consent successful:`, result);
    revalidatePath(`/subject/${id}`);
    return result;
    
  } catch (error) {
    console.error("🔥 Revoke consent failed:", error);
    throw error;
  }
}

export async function recomputeReadiness(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("🔄 Recompute readiness started for:", id);
    
    const result = await apiJSON(`/participants/${id}/readiness/compute`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    
    console.log(`✅ Recompute readiness successful:`, result);
    revalidatePath(`/subject/${id}`);
    return result;
    
  } catch (error) {
    console.error("🔥 Recompute readiness failed:", error);
    throw error;
  }
}

export async function addCheckIn(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("📝 Add check-in started for:", id);
    
    const payload = {
      type: "check_in",
      note: "Manual check-in via UI",
      timestamp: new Date().toISOString()
    };
    
    const result = await apiJSON(`/participants/${id}/evidence`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    console.log(`✅ Add check-in successful:`, result);
    revalidatePath(`/subject/${id}`);
    return result;
    
  } catch (error) {
    console.error("🔥 Add check-in failed:", error);
    throw error;
  }
                              }
