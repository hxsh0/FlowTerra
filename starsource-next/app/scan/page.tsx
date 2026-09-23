"use client";
import { useState } from "react";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PlaceAutocompleteField } from "@/components/dashboard/PlaceAutocompleteField";
import type { Channel, HotLead, ScanResponse } from "@/lib/types";

const CHANNEL_LABEL: Record<Channel, string> = { email: "Email", sms: "SMS", voice: "Call" };

export default function ScanPage() {
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, industry, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setResult(data as ScanResponse);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setStatus("error");
    }
  };

  return (
    <>
      <Backdrop />
      <Nav />
      <main>
        <section className="section scan-hero">
          <div className="wrap-narrow">
            <span className="eyebrow">Free market scan</span>
            <h1 style={{ marginTop: 18 }}>
              See who&rsquo;s <em className="accent-em">actually</em> worth talking to.
            </h1>
            <p className="lede" style={{ marginTop: 16 }}>
              Tell us who you serve and where — we&rsquo;ll run a real scan of your market and
              show you a sample of what we find. One free scan per email.
            </p>
          </div>

          {status !== "done" && (
            <form onSubmit={submit} className="scan-form">
              <div className="scan-form-row">
                <label>
                  Industry you sell to
                  <input
                    required
                    placeholder="e.g. dental practices"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </label>
                <label>
                  Location
                  <PlaceAutocompleteField
                    required
                    placeholder="e.g. Austin, TX"
                    value={location}
                    onChange={setLocation}
                  />
                </label>
              </div>
              <label>
                Your email
                <input
                  type="email"
                  required
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Scanning your market…" : "Run my free scan"}
              </button>
              {error && <p className="discovery-error">{error}</p>}
            </form>
          )}

          {status === "done" && result && (
            <div className="scan-results">
              <p className="scan-summary">
                Found <strong>{result.totalFound}</strong> matching businesses. Showing your top{" "}
                <strong>{result.leads.length}</strong>.
              </p>
              <div className="scan-lead-list">
                {result.leads.map((lead) => (
                  <ScanLeadCard key={lead.id} lead={lead} />
                ))}
              </div>
              {result.totalFound > result.leads.length && (
                <p className="scan-more">
                  {result.totalFound - result.leads.length} more identified — the full list, live
                  outreach, and booked meetings are what StarSource runs for clients.
                </p>
              )}
              <a className="btn btn-primary" href="/login" style={{ marginTop: 24 }}>
                Talk to us about running this for real
              </a>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ScanLeadCard({ lead }: { lead: HotLead }) {
  return (
    <div className="scan-lead-card">
      <div className="scan-lead-top">
        <span className="hl-co">{lead.company}</span>
        <div className="icp-cell">
          <div className="icp-bar">
            <i style={{ width: `${lead.icpScore}%` }} />
          </div>
          <span className="icp-score">{lead.icpScore}</span>
        </div>
      </div>
      {lead.address && <p className="scan-lead-address">{lead.address}</p>}
      {lead.channelEligibility && (
        <div className="channel-badges">
          {lead.channelEligibility.map((c) => (
            <span key={c.channel} className={`channel-badge ${c.eligible ? "channel-badge--eligible" : ""}`}>
              {CHANNEL_LABEL[c.channel]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
