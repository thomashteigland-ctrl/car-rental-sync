# Car rental sync (Fixie + Vercel)

Small **serverless** worker that calls partner B2B APIs through **[Fixie](https://usefixie.com/)** so traffic leaves from a **fixed IP** the provider can allowlist.

The Vite admin stays on Vercel as-is. This app only does outbound sync / probes.

## 1. Create the GitHub repo + Vercel project

From this folder:

```powershell
git init
git add .
git commit -m "Scaffold Fixie-backed B2B sync worker."
# create repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USER/car-rental-sync.git
git push -u origin main
```

In Vercel: **Add New Project** → import `car-rental-sync` → deploy.

Set env var **`SYNC_PROBE_SECRET`** (Production + Preview) to a long random string.

## 2. Add Fixie (this is the IP you send them)

1. Open the [Fixie Vercel integration](https://vercel.com/integrations/fixie) → **Add Integration**.
2. Select the **`car-rental-sync`** project (not admin — admin has no Node server).
3. In the Fixie dashboard, **Configure** → create an **HTTP proxy**.
4. Connect that proxy to **Production** (and Preview if you want).
5. Confirm Vercel now has **`FIXIE_URL`** under Project → Settings → Environment Variables.
6. **Redeploy** so the build/runtime picks it up.

### Copy IPs for allowlisting

In Fixie → your proxy → **Details**: copy **both** static outbound IPs (Fixie usually shows two).

Send those IPs to the API contact. Ask them to allowlist both for:

`https://func-fjeltsp-b2b-api-prod.azurewebsites.net` (or whatever base URL the docs use).

## 3. Verify egress

After redeploy:

```powershell
curl.exe -H "x-sync-secret: YOUR_SECRET" https://YOUR-SYNC-APP.vercel.app/api/egress-ip
```

You should see `{ "ok": true, "egressIp": "…" }` matching one of the Fixie IPs.

## 4. After they allowlist you

1. Set `B2B_BASE_URL` (and `B2B_API_KEY` if needed) in Vercel.
2. Redeploy.
3. Probe:

```powershell
curl.exe -H "x-sync-secret: YOUR_SECRET" "https://YOUR-SYNC-APP.vercel.app/api/b2b-probe?path=/api/customers"
```

If you still get `403 Ip Forbidden`, the allowlist is not active yet or they used the wrong IPs.

## Local dev (optional)

```powershell
copy .env.example .env.local
# paste FIXIE_URL + SYNC_PROBE_SECRET from Vercel / Fixie
npm install
npm run dev
```

```powershell
curl.exe -H "x-sync-secret: YOUR_SECRET" http://localhost:3002/api/egress-ip
```

## Important

- Use **Node.js** routes only (`runtime = "nodejs"`). Edge cannot use Fixie HTTP proxy.
- Never call the partner API from the **browser** / admin SPA — that would use the user’s IP, not Fixie.
- Upload the API docs in chat when ready; we will map endpoints into Supabase next.
