"use client";
import { useCallback, useState } from "react";
import { icpWeightSum } from "@/lib/data";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { AgentScrapeProgress } from "@/components/dashboard/AgentScrapeProgress";
import { HotLeadsTable } from "@/components/dashboard/HotLeadsTable";
import { IcpWeightEditor } from "@/components/dashboard/IcpWeightEditor";
import type { DiscoveryResponse, HotLead, LeadSource } from "@/lib/types";

export default function DiscoveryAgentPage() {
  const { niche, mergeDiscoveryLeads } = useDashboard();
  const [source, setSource] = useState<LeadSource>("places");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingLeads, setPendingLeads] = useState<HotLead[]>([]);
  const [lastRunCount, setLastRunCount] = useState<number | null>(null);

  const valid = icpWeightSum(niche.icpCriteria) === 100;

  const onFinished = useCallback(() => {
    mergeDiscoveryLeads(pendingLeads);
    setLastRunCount(pendingLeads.length);
    setRunning(false);
    setDone(false);
  }, [mergeDiscoveryLeads, pendingLeads]);

  const runDiscovery = async () => {
    if (!valid || running) return;
    setRunning(true);
    setDone(false);
    setError(null);
    setLastRunCount(null);

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Discovery run failed");
      setPendingLeads((data as DiscoveryResponse).leads);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discovery run failed");
      setRunning(false);
    }
  };

  return (
    <>
      <DashboardTopbar title="Agent 1 — Discovery" />
      <div className="dash-content">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Lead source</h2>
            <span className="meta">Dual-source discovery</span>
          </div>
          <div className="source-toggle">
            <button
              type="button"
              className={source === "places" ? "on" : ""}
              onClick={() => setSource("places")}
            >
              Google Places
              <small>Primary</small>
            </button>
            <button
              type="button"
              className={source === "scraper" ? "on" : ""}
              onClick={() => setSource("scraper")}
            >
              Web scraper
              <small>Not yet built</small>
            </button>
          </div>
          <p className="discovery-hint">
            Targeting <strong>{niche.industry}</strong> within {niche.radiusKm}km of{" "}
            <strong>{niche.location}</strong> via {source === "places" ? "Places API" : "scraper"}.
          </p>
        </section>

        <div className="dash-grid-2">
          <section className="dash-panel">
            <IcpWeightEditor />
            <div className="discovery-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!valid || running}
                onClick={runDiscovery}
              >
                Run discovery
              </button>
            </div>
            {error && <p className="discovery-error">{error}</p>}
            {!error && !running && lastRunCount !== null && (
              <p className="discovery-hint">
                Last run sourced <strong>{lastRunCount}</strong> lead{lastRunCount === 1 ? "" : "s"}.
              </p>
            )}
            <AgentScrapeProgress running={running} done={done} onFinished={onFinished} />
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Results</h2>
              <span className="meta">Latest scored leads</span>
            </div>
            <HotLeadsTable compact />
          </section>
        </div>
      </div>
    </>
  );
}
