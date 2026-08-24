"use client";
import { icpWeightSum } from "@/lib/data";
import { useDashboard } from "@/lib/dashboard-context";

export function IcpWeightEditor() {
  const { niche, setNiche } = useDashboard();
  const sum = icpWeightSum(niche.icpCriteria);
  const valid = sum === 100;

  const updateWeight = (id: string, weight: number) => {
    setNiche({
      ...niche,
      icpCriteria: niche.icpCriteria.map((c) => (c.id === id ? { ...c, weight } : c)),
    });
  };

  return (
    <div className="icp-editor">
      <div className="icp-editor-head">
        <h3>ICP criteria</h3>
        <span className={valid ? "icp-sum ok" : "icp-sum err"}>Total: {sum}%</span>
      </div>
      {niche.icpCriteria.map((c) => (
        <div className="icp-row" key={c.id}>
          <span>{c.label}</span>
          <input
            type="range"
            min={0}
            max={50}
            value={c.weight}
            onChange={(e) => updateWeight(c.id, Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={c.weight}
            onChange={(e) => updateWeight(c.id, Number(e.target.value) || 0)}
          />
          <span className="icp-pct">{c.weight}%</span>
        </div>
      ))}
      {!valid && (
        <p className="icp-hint">Weights must sum to exactly 100% before running discovery.</p>
      )}
    </div>
  );
}
