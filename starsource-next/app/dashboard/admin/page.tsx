"use client";
import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import type { AdminUsageResponse } from "@/lib/types";

const SERVICE_LABEL: Record<string, string> = {
  google_places: "Google Places",
  anthropic: "Anthropic",
  resend: "Resend",
};

function money(n: number): string {
  return n < 0.01 && n > 0 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminUsageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/usage");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load usage");
      setData(json as AdminUsageResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <DashboardTopbar title="Admin — API Usage" />
      <div className="dash-content">
        <p className="legal-warning">
          <strong>Visibility, not enforcement.</strong> This tracks calls this server has made since it last
          restarted — it does not stop spending. Set an actual hard spend cap in Google Cloud&rsquo;s
          Billing settings; this page just tells you what happened, in one place instead of three vendor
          consoles.
        </p>

        {error && <p className="discovery-error">{error}</p>}

        {data && (
          <>
            <div className="dash-stat-grid">
              {(["google_places", "anthropic", "resend"] as const).map((svc) => (
                <div className="dash-stat" key={svc}>
                  <div className="dash-stat-v">
                    <span className="accent">{money(data.summary[svc].estimatedCostUsd)}</span>
                  </div>
                  <div className="dash-stat-k">
                    {SERVICE_LABEL[svc]} — {data.summary[svc].calls} call{data.summary[svc].calls === 1 ? "" : "s"}
                  </div>
                </div>
              ))}
              <div className="dash-stat">
                <div className="dash-stat-v">
                  <span className="accent">{money(data.totalEstimatedCostUsd)}</span>
                </div>
                <div className="dash-stat-k">Total estimated spend</div>
              </div>
            </div>

            <section className="dash-panel" style={{ marginTop: 20 }}>
              <div className="dash-panel-head">
                <h2>Recent calls</h2>
                <span className="meta">Last {data.recent.length}</span>
              </div>
              {data.recent.length === 0 ? (
                <p className="discovery-hint">No API calls logged yet.</p>
              ) : (
                <div className="hot-leads">
                  <table>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Operation</th>
                        <th>When</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((e, i) => (
                        <tr key={i}>
                          <td className="hl-co">{SERVICE_LABEL[e.service] ?? e.service}</td>
                          <td>{e.operation}</td>
                          <td>{new Date(e.at).toLocaleString()}</td>
                          <td>
                            {money(e.estimatedCostUsd)}
                            {e.costBasis === "estimated" && <span className="channel-badge" style={{ marginLeft: 6 }}>est.</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
