"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AgentRoster } from "./AgentRoster";
import { Pipeline } from "./Pipeline";
import { ActivityStream } from "./ActivityStream";
import { MetricStrip } from "./MetricStrip";
import type { LogLine, LogSegment } from "@/lib/types";
import { pad2, rint, STAGES } from "@/lib/data";
import { useInView } from "@/hooks/useInView";
import { useConsoleSimulation, useDashboard } from "@/lib/dashboard-context";

let LOGUID = 1;
const MAX_LOGS = 16;

type ConsoleTab = "pipeline" | "agents" | "forecast";

interface ConsoleFrameProps {
  clock: string;
  className?: string;
  children: ReactNode;
  tab?: ConsoleTab;
  onTabChange?: (tab: ConsoleTab) => void;
}

/** Window chrome: dots, title, tabs, clock. */
export function ConsoleFrame({
  clock,
  className = "",
  children,
  tab = "pipeline",
  onTabChange,
}: ConsoleFrameProps) {
  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "pipeline", label: "Pipeline" },
    { id: "agents", label: "Agents" },
    { id: "forecast", label: "Forecast" },
  ];

  return (
    <div className={`console ${className}`.trim()}>
      <div className="console-glow" />
      <div className="cons-bar">
        <div className="cons-dots">
          <i />
          <i />
          <i />
        </div>
        <div className="cons-title">
          FlowTerra Console <span className="live">LIVE</span>
        </div>
        <div className="cons-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "on" : ""}
              onClick={() => onTabChange?.(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="cons-clock">{clock}</div>
      </div>
      {children}
    </div>
  );
}

interface ConsoleBodyProps {
  logs: LogLine[];
  revenue: number;
  onLog: (agent: string, body: LogSegment[]) => void;
  onWin: (company: string) => void;
  onHotLead?: (company: string, stage: string) => void;
  tab?: ConsoleTab;
}

function ConsoleBody({ logs, revenue, onLog, onWin, onHotLead, tab = "pipeline" }: ConsoleBodyProps) {
  return (
    <div className="cons-body">
      <AgentRoster />
      <div className="cons-pane center">
        <div className="pane-head">
          <h4>{tab === "pipeline" ? "Live pipeline" : tab === "agents" ? "Agent fleet" : "Forecast"}</h4>
          <span className="meta">
            {tab === "pipeline" ? "312 accounts in motion" : tab === "agents" ? "5 agents active" : "Q3 commit view"}
          </span>
        </div>
        {tab === "pipeline" ? (
          <Pipeline onLog={onLog} onWin={onWin} onHotLead={onHotLead} />
        ) : tab === "agents" ? (
          <div className="console-placeholder">
            <p>Agent orchestration view — fleet status in left panel.</p>
          </div>
        ) : (
          <div className="console-placeholder">
            <p>Revenue forecast — Ledger agent updating commit weekly.</p>
          </div>
        )}
      </div>
      <div className="cons-pane right">
        <div className="pane-head">
          <h4>Activity stream</h4>
          <span className="meta">live</span>
        </div>
        <ActivityStream logs={logs} />
      </div>
      <MetricStrip revenue={revenue} />
    </div>
  );
}

function useMarketingSimulation() {
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
      setRevenue((r) => r + rint(8000, 52000));
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

/** Marketing home page console with reveal animation. */
export function Console() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.06 });
  const sim = useMarketingSimulation();

  return (
    <section className="console-stage" id="console">
      <div className="wrap-wide">
        <div className={`reveal ${inView ? "in" : ""}`} ref={ref}>
          <ConsoleFrame clock={sim.clock}>
            <ConsoleBody
              logs={sim.logs}
              revenue={sim.revenue}
              onLog={sim.addLog}
              onWin={sim.onWin}
            />
          </ConsoleFrame>
        </div>
      </div>
    </section>
  );
}

/** Dashboard-embedded console using shared context state. */
export function ConsoleEmbedded() {
  const { simulation, addHotLead, markLeadWon } = useDashboard();
  const { logs, revenue, clock, addLog, onWin } = simulation;
  const [tab, setTab] = useState<ConsoleTab>("pipeline");

  const handleWin = useCallback(
    (company: string) => {
      onWin(company);
      markLeadWon(company);
    },
    [onWin, markLeadWon]
  );

  const handleHotLead = useCallback(
    (company: string, stage: string) => {
      const score = 72 + ((company.length * 7) % 23);
      addHotLead({
        id: `hl-${company.replace(/\s/g, "-").toLowerCase()}`,
        company,
        icpScore: score,
        source: company.length % 2 === 0 ? "places" : "scraper",
        stage,
        status: "active",
      });
    },
    [addHotLead]
  );

  return (
    <ConsoleFrame clock={clock} className="console--app" tab={tab} onTabChange={setTab}>
      <ConsoleBody
        logs={logs}
        revenue={revenue}
        onLog={addLog}
        onWin={handleWin}
        onHotLead={handleHotLead}
        tab={tab}
      />
    </ConsoleFrame>
  );
}
