"use client";
import { useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useDashboard } from "@/lib/dashboard-context";
import type { HotLead, OutreachDraftResponse, OutreachSendResult } from "@/lib/types";

export default function OutreachAgentPage() {
  const { niche, hotLeads, updateLeads } = useDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<OutreachSendResult | null>(null);

  const emailable = hotLeads.filter((l) => l.email);
  const selected = hotLeads.find((l) => l.id === selectedId) ?? null;

  const selectLead = (lead: HotLead) => {
    setSelectedId(lead.id);
    setSubject("");
    setBodyHtml("");
    setDraftError(null);
    setSendResult(null);
  };

  const draftForSelected = async () => {
    if (!selected || drafting) return;
    setDrafting(true);
    setDraftError(null);

    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: selected, niche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Drafting failed");
      const draft = data as OutreachDraftResponse;
      setSubject(draft.subject);
      setBodyHtml(draft.bodyHtml);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Drafting failed");
    } finally {
      setDrafting(false);
    }
  };

  const sendToSelected = async () => {
    if (!selected || sending || !subject.trim() || !bodyHtml.trim()) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: selected, jurisdiction: niche.jurisdiction, subject, bodyHtml }),
      });
      const data = (await res.json()) as OutreachSendResult;
      setSendResult(data);
      if (data.status === "sent") {
        updateLeads([{ ...selected, stage: "Contacted" }]);
      }
    } catch (err) {
      setSendResult({ status: "error", reason: err instanceof Error ? err.message : "Send failed" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <DashboardTopbar title="Agent 2 — Outreach" />
      <div className="dash-content">
        <div className="dash-grid-2">
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Leads</h2>
              <span className="meta">{emailable.length} with an email on file</span>
            </div>
            {emailable.length === 0 ? (
              <p className="discovery-hint">No leads with an email yet — run Discovery and Enrichment first.</p>
            ) : (
              <div className="outreach-lead-list">
                {emailable.map((lead) => {
                  const eligible = lead.channelEligibility?.find((c) => c.channel === "email")?.eligible;
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      className={`outreach-lead-row ${selectedId === lead.id ? "active" : ""}`}
                      onClick={() => selectLead(lead)}
                    >
                      <span className="hl-co">{lead.company}</span>
                      <span className="outreach-lead-badges">
                        {lead.stage === "Contacted" && <span className="channel-badge channel-badge--eligible">Sent</span>}
                        <span className={`channel-badge ${eligible ? "channel-badge--eligible" : ""}`}>
                          {eligible ? "Email OK" : "Not eligible"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Draft &amp; send</h2>
              <span className="meta">{selected ? selected.company : "Select a lead"}</span>
            </div>
            {!selected ? (
              <p className="discovery-hint">Pick a lead on the left to draft an email.</p>
            ) : (
              <>
                <div className="discovery-actions">
                  <button type="button" className="btn btn-ghost" disabled={drafting} onClick={draftForSelected}>
                    {drafting ? "Drafting…" : "Draft with AI"}
                  </button>
                </div>
                {draftError && <p className="discovery-error">{draftError}</p>}

                <div className="niche-form" style={{ marginTop: 16 }}>
                  <label>
                    Subject
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </label>
                  <label>
                    Body (HTML)
                    <textarea rows={8} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
                  </label>
                </div>

                {bodyHtml && (
                  <div className="contract-doc outreach-preview" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                )}

                <div className="discovery-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={sending || !subject.trim() || !bodyHtml.trim()}
                    onClick={sendToSelected}
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
                {sendResult && (
                  <p className={sendResult.status === "sent" ? "booking-confirmed" : "discovery-error"}>
                    <strong>{sendResult.status}</strong> — {sendResult.reason}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
