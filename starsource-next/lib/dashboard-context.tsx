"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_NICHE } from "@/lib/data";
import type { HotLead, NicheConfig } from "@/lib/types";

interface DashboardContextValue {
  niche: NicheConfig;
  setNiche: (next: NicheConfig) => void;
  hotLeads: HotLead[];
  mergeDiscoveryLeads: (leads: HotLead[]) => void;
  updateLeads: (leads: HotLead[]) => void;
  nicheModalOpen: boolean;
  setNicheModalOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [niche, setNiche] = useState<NicheConfig>(DEFAULT_NICHE);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [nicheModalOpen, setNicheModalOpen] = useState(false);

  const mergeDiscoveryLeads = useCallback((leads: HotLead[]) => {
    setHotLeads((prev) => {
      const existing = new Set(prev.map((l) => l.company));
      const fresh = leads.filter((l) => !existing.has(l.company));
      return [...fresh, ...prev].slice(0, 20);
    });
  }, []);

  /** Replaces leads in place by id — used to write enrichment results back. */
  const updateLeads = useCallback((leads: HotLead[]) => {
    setHotLeads((prev) => {
      const byId = new Map(leads.map((l) => [l.id, l]));
      return prev.map((l) => byId.get(l.id) ?? l);
    });
  }, []);

  const value = useMemo(
    () => ({
      niche,
      setNiche,
      hotLeads,
      mergeDiscoveryLeads,
      updateLeads,
      nicheModalOpen,
      setNicheModalOpen,
    }),
    [niche, hotLeads, mergeDiscoveryLeads, updateLeads, nicheModalOpen]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
