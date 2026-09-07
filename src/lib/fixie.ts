import { ProxyAgent, fetch as undiciFetch } from "undici";

/** Node runtime required — Edge cannot use HTTP proxies. */
export const runtime = "nodejs";

export function requireProbeSecret(req: Request): Response | null {
  const expected = process.env.SYNC_PROBE_SECRET?.trim();
  if (!expected) {
    return Response.json(
      { error: "SYNC_PROBE_SECRET is not configured" },
      { status: 500 },
    );
  }
  const got = req.headers.get("x-sync-secret")?.trim();
  if (got !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function fixieAgent(): ProxyAgent {
  const url = process.env.FIXIE_URL?.trim();
  if (!url) {
    throw new Error("FIXIE_URL is not configured");
  }
  return new ProxyAgent(url);
}

export async function fetchViaFixie(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const agent = fixieAgent();
  const res = await undiciFetch(url, {
    ...init,
    dispatcher: agent,
  } as Parameters<typeof undiciFetch>[1]);
  return res as unknown as Response;
}
