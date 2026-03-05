export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://legacyline-core-production.up.railway.app").replace(/\/$/, "");

type ApiError = {
  status: number;
  body: string;
  url: string;
};

export async function api<T>(
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
      const err: ApiError = { status: res.status, body: text || res.statusText, url };
      throw new Error(`API ${err.status} @ ${err.url}: ${err.body}`);
    }

    // Empty response
    if (!text) return {} as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      // If API ever returns plain text
      return text as unknown as T;
    }
  } catch (e: any) {
    // This is where CORS / network / DNS / timeout shows up
    if (e?.name === "AbortError") {
      throw new Error(`API TIMEOUT after ${timeoutMs}ms @ ${url}`);
    }
    throw new Error(`NETWORK ERROR @ ${url}: ${e?.message || String(e)}`);
  } finally {
    clearTimeout(timeout);
  }
}
