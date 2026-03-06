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
  console.log("🔍 Raw subjectId from form:", subjectId); // Add this to debug
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
    console.log("🔍 Encoded ID:", encodeURIComponent(id)); // Add this to debug
    
    const payload = { 
      scope: "standard",
      participant_id: id,
      granted_at: new Date().toISOString()
    };
    console.log("📦 Payload:", payload);
    
    // Try these endpoints in order
    const endpoints = [
      `/participants/${id}/consent`,
      `/participants/${id}/grant-consent`,
      `/participants/${id}/consent/grant`,
      `/consent/${id}`
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const result = await apiJSON(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        
        console.log(`✅ Success with endpoint: ${endpoint}`, result);
        revalidatePath(`/subject/${id}`);
        return result;
      } catch (e) {
        console.log(`❌ Endpoint ${endpoint} failed:`, e instanceof Error ? e.message : e);
        lastError = e;
      }
    }
    
    console.error("💥 All endpoints failed");
    throw lastError || new Error("No consent endpoint found");
    
  } catch (error) {
    console.error("🔥 Grant consent failed:", error);
    throw error;
  }
}

export async function revokeConsent(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("🔴 Revoke consent started for:", id);
    
    const endpoints = [
      `/participants/${id}/consent`,
      `/participants/${id}/revoke-consent`,
      `/participants/${id}/consent/revoke`,
      `/consent/${id}`
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying revoke endpoint: ${endpoint}`);
        const result = await apiJSON(endpoint, {
          method: "DELETE",
        });
        
        console.log(`✅ Success revoking with endpoint: ${endpoint}`, result);
        revalidatePath(`/subject/${id}`);
        return result;
      } catch (e) {
        console.log(`❌ Endpoint ${endpoint} failed:`, e instanceof Error ? e.message : e);
        lastError = e;
      }
    }
    
    throw lastError || new Error("No revoke endpoint found");
  } catch (error) {
    console.error("🔥 Revoke consent failed:", error);
    throw error;
  }
}

export async function recomputeReadiness(formData: FormData) {
  const id = mustSubjectId(formData);

  try {
    console.log("🔄 Recompute readiness started for:", id);
    
    const endpoints = [
      `/participants/${id}/compute-readiness`,
      `/participants/${id}/readiness/compute`,
      `/readiness/${id}/compute`
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying recompute endpoint: ${endpoint}`);
        const result = await apiJSON(endpoint, {
          method: "POST",
          body: JSON.stringify({}),
        });
        
        console.log(`✅ Success recomputing with endpoint: ${endpoint}`, result);
        revalidatePath(`/subject/${id}`);
        return result;
      } catch (e) {
        console.log(`❌ Endpoint ${endpoint} failed:`, e instanceof Error ? e.message : e);
        lastError = e;
      }
    }
    
    throw lastError || new Error("No recompute endpoint found");
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
      note: "manual check-in",
      timestamp: new Date().toISOString()
    };
    
    const endpoints = [
      `/participants/${id}/evidence`,
      `/participants/${id}/check-in`,
      `/evidence/${id}`,
      `/participants/${id}/add-checkin`
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying check-in endpoint: ${endpoint}`);
        const result = await apiJSON(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        
        console.log(`✅ Success adding check-in with endpoint: ${endpoint}`, result);
        revalidatePath(`/subject/${id}`);
        return result;
      } catch (e) {
        console.log(`❌ Endpoint ${endpoint} failed:`, e instanceof Error ? e.message : e);
        lastError = e;
      }
    }
    
    throw lastError || new Error("No check-in endpoint found");
  } catch (error) {
    console.error("🔥 Add check-in failed:", error);
    throw error;
  }
}
