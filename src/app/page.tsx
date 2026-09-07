export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 640 }}>
      <h1>Car rental sync</h1>
      <p>
        Serverless worker for partner B2B APIs via Fixie (static outbound IP).
        No public UI — use the probe routes with <code>x-sync-secret</code>.
      </p>
      <ul>
        <li>
          <code>GET /api/egress-ip</code> — confirm Fixie egress IP
        </li>
        <li>
          <code>GET /api/b2b-probe?path=/api/customers</code> — hit partner API
          once allowlisted
        </li>
      </ul>
    </main>
  );
}
