"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgentRoster } from "./AgentRoster";
import { Pipeline } from "./Pipeline";
import { ActivityStream } from "./ActivityStream";
import { MetricStrip } from "./MetricStrip";
import type { LogLine, LogSegment } from "@/lib/types";
import { pad2, rint } from "@/lib/data";
import { useInView } from "@/hooks/useInView";

let LOGUID = 1;
const MAX_LOGS = 16;

/**
 * The FlowTerra Console — the command-center centerpiece. Holds the shared
 * activity-log and revenue state; the Pipeline feeds both as deals move.
 */
export function Console() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.06 });
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

  // running clock
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

  // seed a couple of lines so the stream isn't empty on first paint
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
    addLog("probe", [
      { t: "text", v: "enriching org charts" },
    ]);
  }, [addLog]);

  return (
    <section className="console-stage" id="console">
      <div className="wrap-wide">
        <div className={`console reveal ${inView ? "in" : ""}`} ref={ref}>
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
              <button className="on">Pipeline</button>
              <button>Agents</button>
              <button>Forecast</button>
            </div>
            <div className="cons-clock">{clock}</div>
          </div>
          <div className="cons-body">
            <AgentRoster />
            <div className="cons-pane center">
              <div className="pane-head">
                <h4>Live pipeline</h4>
                <span className="meta">312 accounts in motion</span>
              </div>
              <Pipeline onLog={addLog} onWin={onWin} />
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
        </div>
      </div>
    </section>
  );
}
