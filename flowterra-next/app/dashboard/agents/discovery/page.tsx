"use client";
import { useCallback, useState } from "react";
import { icpWeightSum } from "@/lib/data";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { AgentScrapeProgress } from "@/components/dashboard/AgentScrapeProgress";
import { HotLeadsTable } from "@/components/dashboard/HotLeadsTable";
import { IcpWeightEditor } from "@/components/dashboard/IcpWeightEditor";
import type { LeadSource } from "@/lib/types";

export default function DiscoveryAgentPage() {
  const { niche, mergeDiscoveryLeads } = useDashboard();
  const [source, setSource] = useState<LeadSource>("places");
  const [running, setRunning] = useState(false);

  const valid = icpWeightSum(niche.icpCriteria) === 100;

  const onComplete = useCallback(() => {
    mergeDiscoveryLeads();
    setRunning(false);
  }, [mergeDiscoveryLeads]);

  const runDiscovery = () => {
    if (!valid || running) return;
    setRunning(true);
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
              <small>Fallback</small>
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
            <AgentScrapeProgress running={running} onComplete={onComplete} />
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
