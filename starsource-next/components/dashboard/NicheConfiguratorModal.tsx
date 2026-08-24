"use client";
import { useEffect, useState } from "react";
import { icpWeightSum } from "@/lib/data";
import { useDashboard } from "@/lib/dashboard-context";
import type { IcpCriterion, NicheConfig } from "@/lib/types";

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
  const valid = sum === 100;

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
            Industry
            <input
              value={draft.industry}
              onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
            />
          </label>
          <label>
            Location
            <input
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
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
        </div>
        <div className="niche-icp">
          <div className="niche-icp-head">
            <h3>ICP scoring weights</h3>
            <span className={valid ? "icp-sum ok" : "icp-sum err"}>Total: {sum}%</span>
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
