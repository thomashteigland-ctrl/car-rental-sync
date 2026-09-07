import { fetchViaFixie, requireProbeSecret } from "@/lib/fixie";

export const runtime = "nodejs";

/**
 * Returns the public IP Fixie uses for outbound calls.
 * Send those IP(s) from the Fixie dashboard to the API provider for allowlisting.
 *
 * curl -H "x-sync-secret: YOUR_SECRET" https://YOUR_DEPLOYMENT/api/egress-ip
 */
export async function GET(req: Request) {
  const denied = requireProbeSecret(req);
  if (denied) return denied;

  if (!process.env.FIXIE_URL?.trim()) {
    return Response.json(
      {
        error: "FIXIE_URL missing",
        hint: "Add the Fixie Vercel integration, create a proxy, redeploy.",
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetchViaFixie("https://api.ipify.org?format=json");
    const body = (await res.json()) as { ip?: string };
    return Response.json({
      ok: true,
      egressIp: body.ip ?? null,
      note: "Allowlist BOTH static IPs shown in the Fixie proxy Details panel (Fixie often has two).",
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
