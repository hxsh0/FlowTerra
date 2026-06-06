"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_NICHE, DISCOVERY_SEED_LEADS, HOT_LEADS, pad2 } from "@/lib/data";
import type { HotLead, LogLine, LogSegment, NicheConfig } from "@/lib/types";

let LOGUID = 1;
const MAX_LOGS = 16;

interface ConsoleSimulation {
  logs: LogLine[];
  revenue: number;
  clock: string;
  addLog: (agent: string, body: LogSegment[]) => void;
  onWin: (company: string) => void;
}

interface DashboardContextValue {
  niche: NicheConfig;
  setNiche: (next: NicheConfig) => void;
  hotLeads: HotLead[];
  addHotLead: (lead: HotLead) => void;
  mergeDiscoveryLeads: () => void;
  markLeadWon: (company: string) => void;
  nicheModalOpen: boolean;
  setNicheModalOpen: (open: boolean) => void;
  simulation: ConsoleSimulation;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function useConsoleSimulationInternal(): ConsoleSimulation {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [revenue, setRevenue] = useState(4218600);
  const [clock, setClock] = useState("--:--:--");

  const addLog = useCallback((agent: string, body: LogSegment[]) => {
    const d = new Date();
    const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    setLogs((prev) => [{ uid: LOGUID++, time, agent, body }, ...prev].slice(0, MAX_LOGS));
  }, []);

  const onWin = useCallback(
    (co: string) => {
      setRevenue((r) => r + Math.floor(8000 + Math.random() * 44000));
      addLog("ledger", [
        { t: "text", v: "closed " },
        { t: "strong", v: co },
        { t: "text", v: " — " },
        { t: "pos", v: "won" },
        { t: "text", v: ", added to revenue" },
      ]);
    },
    [addLog]
  );

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const off = d.getTimezoneOffset();
      setClock(
        `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} · UTC${
          off <= 0 ? "+" : "-"
        }${pad2(Math.abs(off / 60))}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    addLog("scout", [
      { t: "text", v: "scored " },
      { t: "strong", v: "Meridian Capital" },
      { t: "text", v: " — ICP match " },
      { t: "pos", v: "94%" },
    ]);
    addLog("probe", [{ t: "text", v: "enriching org charts" }]);
  }, [addLog]);

  return { logs, revenue, clock, addLog, onWin };
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const simulation = useConsoleSimulationInternal();
  const [niche, setNiche] = useState<NicheConfig>(DEFAULT_NICHE);
  const [hotLeads, setHotLeads] = useState<HotLead[]>(HOT_LEADS);
  const [nicheModalOpen, setNicheModalOpen] = useState(false);

  const addHotLead = useCallback((lead: HotLead) => {
    setHotLeads((prev) => {
      if (prev.some((l) => l.company === lead.company)) return prev;
      return [lead, ...prev].slice(0, 20);
    });
  }, []);

  const markLeadWon = useCallback((company: string) => {
    setHotLeads((prev) =>
      prev.map((l) =>
        l.company === company ? { ...l, stage: "Won", status: "won" as const } : l
      )
    );
  }, []);

  const mergeDiscoveryLeads = useCallback(() => {
    setHotLeads((prev) => {
      const existing = new Set(prev.map((l) => l.company));
      const fresh = DISCOVERY_SEED_LEADS.filter((l) => !existing.has(l.company));
      return [...fresh, ...prev].slice(0, 20);
    });
  }, []);

  const value = useMemo(
    () => ({
      niche,
      setNiche,
      hotLeads,
      addHotLead,
      mergeDiscoveryLeads,
      markLeadWon,
      nicheModalOpen,
      setNicheModalOpen,
      simulation,
    }),
    [
      niche,
      hotLeads,
      addHotLead,
      mergeDiscoveryLeads,
      markLeadWon,
      nicheModalOpen,
      simulation,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function useConsoleSimulation() {
  return useDashboard().simulation;
}
