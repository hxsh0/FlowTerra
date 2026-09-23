"use client";
import { useDashboard } from "@/lib/dashboard-context";
import type { Channel, HotLead } from "@/lib/types";

interface Props {
  compact?: boolean;
  leads?: HotLead[];
}

const CHANNEL_LABEL: Record<Channel, string> = { email: "Email", sms: "SMS", voice: "Call" };

export function HotLeadsTable({ compact, leads: leadsProp }: Props) {
  const { hotLeads } = useDashboard();
  const leads = leadsProp ?? hotLeads;
  const rows = compact ? leads.slice(0, 6) : leads;

  if (rows.length === 0) {
    return (
      <div className="hot-leads-empty">
        <p>No leads yet. Run Discovery to source your first batch.</p>
      </div>
    );
  }

  return (
    <div className={`hot-leads ${compact ? "hot-leads--compact" : ""}`}>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Source</th>
            {!compact && <th>Stage</th>}
            <th>ICP</th>
            {!compact && <th>Channels</th>}
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
              {!compact && (
                <td>
                  {lead.channelEligibility ? (
                    <div className="channel-badges" title={lead.channelEligibility.map((c) => `${CHANNEL_LABEL[c.channel]}: ${c.basis}`).join("\n")}>
                      {lead.channelEligibility.map((c) => (
                        <span
                          key={c.channel}
                          className={`channel-badge ${c.eligible ? "channel-badge--eligible" : ""}`}
                        >
                          {CHANNEL_LABEL[c.channel]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="channel-badge">—</span>
                  )}
                </td>
              )}
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
