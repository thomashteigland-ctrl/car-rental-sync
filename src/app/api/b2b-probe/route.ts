import { fetchViaFixie, requireProbeSecret } from "@/lib/fixie";

export const runtime = "nodejs";

/**
 * Smoke-test the partner API once your Fixie IPs are allowlisted.
 *
 * curl -H "x-sync-secret: YOUR_SECRET" \
 *   "https://YOUR_DEPLOYMENT/api/b2b-probe?path=/api/customers"
 */
export async function GET(req: Request) {
  const denied = requireProbeSecret(req);
  if (denied) return denied;

  const base = process.env.B2B_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return Response.json(
      {
        error: "B2B_BASE_URL not set",
        hint: "Set it in Vercel env after you have the API base URL from the docs.",
      },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/api/customers";
  const target = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const apiKey = process.env.B2B_API_KEY?.trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  try {
    const res = await fetchViaFixie(target, { headers });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* keep raw */
    }
    return Response.json({
      ok: res.ok,
      status: res.status,
      target,
      body: json ?? text.slice(0, 4000),
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        target,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
