"use client";
import { useEffect, useState } from "react";
import { B2B_INDUSTRIES, icpWeightSum } from "@/lib/data";
import { useDashboard } from "@/lib/dashboard-context";
import { PlaceAutocompleteField } from "@/components/dashboard/PlaceAutocompleteField";
import type { IcpCriterion, Jurisdiction, NicheConfig } from "@/lib/types";

const JURISDICTIONS: { id: Jurisdiction; label: string }[] = [
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
  { id: "UK", label: "United Kingdom" },
];

function cloneNiche(n: NicheConfig): NicheConfig {
  return {
    ...n,
    icpCriteria: n.icpCriteria.map((c) => ({ ...c })),
  };
}

export function NicheConfiguratorModal() {
  const { niche, setNiche, nicheModalOpen, setNicheModalOpen } = useDashboard();
  const [draft, setDraft] = useState<NicheConfig>(() => cloneNiche(niche));

  useEffect(() => {
    if (nicheModalOpen) setDraft(cloneNiche(niche));
  }, [nicheModalOpen, niche]);

  if (!nicheModalOpen) return null;

  const sum = icpWeightSum(draft.icpCriteria);
  const valid = sum > 0;

  const updateCriterion = (id: string, weight: number) => {
    setDraft((d) => ({
      ...d,
      icpCriteria: d.icpCriteria.map((c) => (c.id === id ? { ...c, weight } : c)),
    }));
  };

  const save = () => {
    if (!valid) return;
    setNiche(cloneNiche(draft));
    setNicheModalOpen(false);
  };

  return (
    <div className="niche-modal-backdrop" onClick={() => setNicheModalOpen(false)}>
      <div className="niche-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="niche-modal-head">
          <h2>Configure niche</h2>
          <button type="button" className="niche-modal-close" onClick={() => setNicheModalOpen(false)}>
            ×
          </button>
        </div>
        <div className="niche-form">
          <label>
            Your business name
            <input
              value={draft.clientName}
              onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
            />
          </label>
          <label>
            What you offer prospects
            <textarea
              rows={3}
              value={draft.clientOffer}
              onChange={(e) => setDraft((d) => ({ ...d, clientOffer: e.target.value }))}
            />
          </label>
          <label>
            Your Calendly link (optional)
            <input
              type="url"
              placeholder="https://calendly.com/your-business/intro-call"
              value={draft.calendlyLink ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, calendlyLink: e.target.value || undefined }))}
            />
          </label>
          <label>
            Industry
            <input
              list="industry-suggestions"
              placeholder="Pick a suggestion or type your own"
              value={draft.industry}
              onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
            />
            <datalist id="industry-suggestions">
              {B2B_INDUSTRIES.map((group) => (
                <optgroup key={group.sector} label={group.sector}>
                  {group.industries.map((ind) => (
                    <option key={ind} value={ind} />
                  ))}
                </optgroup>
              ))}
            </datalist>
          </label>
          <label>
            Location
            <PlaceAutocompleteField
              value={draft.location}
              onChange={(location) => setDraft((d) => ({ ...d, location }))}
              placeholder="City, region, or address"
            />
          </label>
          <label>
            Radius (km)
            <input
              type="number"
              min={5}
              max={500}
              value={draft.radiusKm}
              onChange={(e) => setDraft((d) => ({ ...d, radiusKm: Number(e.target.value) || 0 }))}
            />
          </label>
          <label>
            Market
            <select
              value={draft.jurisdiction}
              onChange={(e) => setDraft((d) => ({ ...d, jurisdiction: e.target.value as Jurisdiction }))}
            >
              {JURISDICTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="discovery-hint">
          Outreach eligibility per channel is computed against this market's rules
          (CASL in Canada, PECR/UK GDPR in the UK, CAN-SPAM/TCPA in the US) — not legal advice, verify with counsel.
        </p>
        <div className="niche-icp">
          <div className="niche-icp-head">
            <h3>ICP scoring weights</h3>
            <span className={valid ? "icp-sum ok" : "icp-sum err"}>
              Relative weights: {sum}
              {!valid && " — set at least one above zero"}
            </span>
          </div>
          {draft.icpCriteria.map((c: IcpCriterion) => (
            <div className="icp-row" key={c.id}>
              <span>{c.label}</span>
              <input
                type="range"
                min={0}
                max={50}
                value={c.weight}
                onChange={(e) => updateCriterion(c.id, Number(e.target.value))}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={c.weight}
                onChange={(e) => updateCriterion(c.id, Number(e.target.value) || 0)}
              />
              <span className="icp-pct">{c.weight}%</span>
            </div>
          ))}
        </div>
        <div className="niche-modal-foot">
          <button type="button" className="btn btn-ghost" onClick={() => setNicheModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!valid} onClick={save}>
            Save niche
          </button>
        </div>
      </div>
    </div>
  );
}
