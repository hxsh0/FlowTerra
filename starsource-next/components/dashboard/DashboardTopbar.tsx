"use client";
import { useDashboard } from "@/lib/dashboard-context";

interface Props {
  title: string;
}

export function DashboardTopbar({ title }: Props) {
  const { niche, setNicheModalOpen } = useDashboard();

  return (
    <header className="dash-topbar">
      <div>
        <h1 className="dash-title">{title}</h1>
        <div className="dash-niche-chip">
          {niche.industry} · {niche.location} · {niche.radiusKm}km
        </div>
      </div>
      <div className="dash-topbar-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNicheModalOpen(true)}>
          Configure niche
        </button>
        <div className="dash-avatar" title="Account">
          FM
        </div>
      </div>
    </header>
  );
}
