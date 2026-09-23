"use client";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { HotLeadsTable } from "@/components/dashboard/HotLeadsTable";
import { NicheConfiguratorModal } from "@/components/dashboard/NicheConfiguratorModal";

export default function DashboardPage() {
  return (
    <>
      <DashboardTopbar title="Overview" />
      <div className="dash-content">
        <DashboardStatCards />
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Hot leads</h2>
            <span className="meta">ICP-scored accounts</span>
          </div>
          <HotLeadsTable />
        </section>
      </div>
      <NicheConfiguratorModal />
    </>
  );
}
