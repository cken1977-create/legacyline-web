export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://legacyline-core-production.up.railway.app";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // if API ever returns plain text
    return text as unknown as T;
  }
}
