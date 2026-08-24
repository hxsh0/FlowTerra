"use client";
import { ConsoleEmbedded } from "@/components/console/Console";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { HotLeadsTable } from "@/components/dashboard/HotLeadsTable";
import { NicheConfiguratorModal } from "@/components/dashboard/NicheConfiguratorModal";
import { ConversionBars } from "@/components/viz/ConversionBars";

export default function DashboardPage() {
  return (
    <>
      <DashboardTopbar title="Overview" />
      <div className="dash-content">
        <DashboardStatCards />
        <ConsoleEmbedded />
        <div className="dash-grid-2">
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Funnel</h2>
              <span className="meta">Stage conversion</span>
            </div>
            <ConversionBars />
          </section>
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Hot leads</h2>
              <span className="meta">ICP-scored accounts</span>
            </div>
            <HotLeadsTable />
          </section>
        </div>
      </div>
      <NicheConfiguratorModal />
    </>
  );
}
