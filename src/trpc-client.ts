/**
 * Lightweight HTTP wrapper for calling tRPC procedures without the tRPC client.
 */

let sessionToken = process.env.KAMELEON_SESSION_TOKEN || "";
const baseUrl = (process.env.KAMELEON_BASE_URL || "https://my.kameleonlabs.ai").replace(/\/$/, "");
const tenantSlug = process.env.KAMELEON_TENANT_SLUG || "";

export function setSessionToken(token: string) {
  sessionToken = token;
}

export function getSessionToken() {
  return sessionToken;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionToken) h["Authorization"] = `Bearer ${sessionToken}`;
  if (tenantSlug) h["X-Tenant-Slug"] = tenantSlug;
  return h;
}

export async function trpcQuery<T = unknown>(procedure: string, input?: unknown): Promise<T> {
  let url = `${baseUrl}/api/trpc/${procedure}`;
  if (input !== undefined && input !== null) {
    url += `?input=${encodeURIComponent(JSON.stringify(input))}`;
  }
  const res = await fetch(url, { method: "GET", headers: headers() });
  const body = await res.json() as any;
  if (body?.error || body?.result?.error) {
    const err = body.error || body.result.error;
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }
  return (body?.result?.data ?? body) as T;
}

export async function trpcMutation<T = unknown>(procedure: string, input?: unknown): Promise<T> {
  const url = `${baseUrl}/api/trpc/${procedure}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: input !== undefined ? JSON.stringify(input) : undefined,
  });
  const body = await res.json() as any;
  if (body?.error || body?.result?.error) {
    const err = body.error || body.result.error;
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }
  return (body?.result?.data ?? body) as T;
}
