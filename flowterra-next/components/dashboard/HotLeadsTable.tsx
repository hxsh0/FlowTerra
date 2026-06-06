"use client";
import { useDashboard } from "@/lib/dashboard-context";
import type { HotLead } from "@/lib/types";

interface Props {
  compact?: boolean;
  leads?: HotLead[];
}

export function HotLeadsTable({ compact, leads: leadsProp }: Props) {
  const { hotLeads } = useDashboard();
  const leads = leadsProp ?? hotLeads;
  const rows = compact ? leads.slice(0, 6) : leads;

  return (
    <div className={`hot-leads ${compact ? "hot-leads--compact" : ""}`}>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Source</th>
            {!compact && <th>Stage</th>}
            <th>ICP</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((lead) => (
            <tr key={lead.id}>
              <td className="hl-co">{lead.company}</td>
              <td>
                <span className={`source-badge source-badge--${lead.source}`}>
                  {lead.source === "places" ? "Places" : "Scraper"}
                </span>
              </td>
              {!compact && <td>{lead.stage}</td>}
              <td>
                <div className="icp-cell">
                  <div className="icp-bar">
                    <i style={{ width: `${lead.icpScore}%` }} />
                  </div>
                  <span className="icp-score">{lead.icpScore}</span>
                </div>
              </td>
              <td>
                <span className={`hl-status hl-status--${lead.status}`}>{lead.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
