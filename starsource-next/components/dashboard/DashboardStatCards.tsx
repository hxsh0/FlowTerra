"use client";
import { useDashboard } from "@/lib/dashboard-context";

export function DashboardStatCards() {
  const { hotLeads } = useDashboard();

  const total = hotLeads.length;
  const withEmail = hotLeads.filter((l) => l.email).length;
  const avgIcp = total > 0 ? Math.round(hotLeads.reduce((sum, l) => sum + l.icpScore, 0) / total) : null;
  const won = hotLeads.filter((l) => l.status === "won").length;

  const stats: { value: string; label: string }[] = [
    { value: String(total), label: "Leads sourced" },
    { value: avgIcp === null ? "—" : `${avgIcp}`, label: "Average ICP score" },
    { value: String(withEmail), label: "Contacts with email" },
    { value: String(won), label: "Deals won" },
  ];

  return (
    <div className="dash-stat-grid">
      {stats.map((s) => (
        <div className="dash-stat" key={s.label}>
          <div className="dash-stat-v">
            <span className="accent">{s.value}</span>
          </div>
          <div className="dash-stat-k">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
