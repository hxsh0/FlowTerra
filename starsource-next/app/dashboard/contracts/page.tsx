"use client";
import { useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useDashboard } from "@/lib/dashboard-context";
import type { ContractDraftResponse } from "@/lib/types";

export default function ContractsPage() {
  const { niche } = useDashboard();
  const [providerName, setProviderName] = useState(niche.clientName);
  const [providerAddress, setProviderAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContractDraftResponse | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/contracts/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerName, providerAddress, customerName, customerAddress, dealDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Contract drafting failed");
      setResult(data as ContractDraftResponse);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contract drafting failed");
      setStatus("error");
    }
  };

  return (
    <>
      <DashboardTopbar title="Contracts" />
      <div className="dash-content">
        <p className="legal-warning">
          <strong>Not legal advice.</strong> This drafts a starting-point document from what you describe below —
          it is not reviewed by a lawyer and is not ready to send or sign. Have a licensed attorney in your
          jurisdiction review any draft before it goes anywhere near a real deal.
        </p>

        <div className="dash-grid-2">
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Deal details</h2>
              <span className="meta">Service agreement draft</span>
            </div>
            <form onSubmit={submit} className="niche-form">
              <label>
                Your business name
                <input required value={providerName} onChange={(e) => setProviderName(e.target.value)} />
              </label>
              <label>
                Your business address
                <input required value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} />
              </label>
              <label>
                Customer&rsquo;s business name
                <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </label>
              <label>
                Customer&rsquo;s business address
                <input required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </label>
              <label>
                What&rsquo;s the deal?
                <textarea
                  required
                  rows={5}
                  placeholder="e.g. Commercial cleaning services, 3x/week, $2,400/month, 12-month term, net-30 payment, either party can terminate with 30 days notice."
                  value={dealDescription}
                  onChange={(e) => setDealDescription(e.target.value)}
                />
              </label>
              <div className="discovery-actions">
                <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? "Drafting…" : "Generate draft"}
                </button>
              </div>
            </form>
            {error && <p className="discovery-error">{error}</p>}
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Draft</h2>
              <span className="meta">{result ? result.title : "Nothing generated yet"}</span>
            </div>
            {result ? (
              <div className="contract-doc" dangerouslySetInnerHTML={{ __html: result.bodyHtml }} />
            ) : (
              <p className="discovery-hint">Fill in the deal details and generate a draft to see it here.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
