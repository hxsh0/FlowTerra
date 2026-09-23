"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useDashboard } from "@/lib/dashboard-context";

export default function BookingAgentPage() {
  const { niche, setNicheModalOpen } = useDashboard();
  const [lastBooked, setLastBooked] = useState<string | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.event === "calendly.event_scheduled") {
        setLastBooked(new Date().toLocaleTimeString());
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <DashboardTopbar title="Agent 3 — Booking" />
      <div className="dash-content">
        {!niche.calendlyLink ? (
          <div className="dash-empty">
            <h2>No Calendly link configured yet</h2>
            <p>Add your Calendly scheduling link in niche settings to turn this on — outreach emails will also start linking straight to it once it's set.</p>
            <button type="button" className="btn btn-primary" onClick={() => setNicheModalOpen(true)}>
              Configure niche
            </button>
          </div>
        ) : (
          <>
            {lastBooked && (
              <p className="booking-confirmed">
                <strong>Meeting booked</strong> — detected at {lastBooked}. Matching this to a specific lead
                automatically needs a paid Calendly plan (webhooks/API) — for now, mark the right lead as won
                manually in your leads list.
              </p>
            )}
            <section className="dash-panel">
              <div className="dash-panel-head">
                <h2>Live booking</h2>
                <span className="meta">{niche.calendlyLink}</span>
              </div>
              <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
              <div
                className="calendly-inline-widget"
                data-url={niche.calendlyLink}
                style={{ minWidth: "320px", height: "700px" }}
              />
            </section>
          </>
        )}
        <p className="discovery-hint" style={{ marginTop: 20 }}>
          <Link href="/dashboard">← Back to overview</Link>
        </p>
      </div>
    </>
  );
}
