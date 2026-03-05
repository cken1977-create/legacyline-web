"use server";

// --- Loaders ----------------------------------------------------

export async function getSubject(id: string) {
  return { id, label: `Subject ${id}` };
}

export async function getConsent(id: string) {
  return {
    status: "none",
    timeline: [],
  };
}

export async function getReadiness(id: string) {
  return {
    readiness: null,
    timeline: [],
  };
}

export async function getEvidenceEvents(id: string) {
  return {
    events: [],
    timeline: [],
  };
}

export async function getStateHistory(id: string) {
  return {
    entries: [],
    timeline: [],
  };
}

// --- Actions ----------------------------------------------------

export async function grantConsent(id: string) {
  console.log("grantConsent", id);
}

export async function revokeConsent(id: string) {
  console.log("revokeConsent", id);
}

export async function recomputeReadiness(id: string) {
  console.log("recomputeReadiness", id);
}

export async function addCheckIn(id: string) {
  console.log("addCheckIn", id);
}
