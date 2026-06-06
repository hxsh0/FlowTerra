"use client";
import { useEffect, useState } from "react";
import { AGENTS, pick, rint } from "@/lib/data";
import type { Agent } from "@/lib/types";
import { useMotion } from "@/lib/visual";

export function AgentRoster() {
  return (
    <div className="cons-pane left">
      <div className="pane-head">
        <h4>Agent fleet</h4>
        <span className="meta">5 active</span>
      </div>
      {AGENTS.map((a) => (
        <AgentRow key={a.id} agent={a} />
      ))}
      <RosterMeter />
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const motion = useMotion();
  const [task, setTask] = useState(agent.tasks[0]);
  const [fade, setFade] = useState(false);
  const [thru, setThru] = useState(agent.throughput);

  // rotate the live task line
  useEffect(() => {
    let alive = true;
    let to: ReturnType<typeof setTimeout>;
    const run = () => {
      if (!alive) return;
      if (motion) {
        setFade(true);
        setTimeout(() => {
          setTask(pick(agent.tasks));
          setFade(false);
        }, 220);
      }
      to = setTimeout(run, rint(3600, 6200));
    };
    to = setTimeout(run, rint(1500, 4000));
    return () => {
      alive = false;
      clearTimeout(to);
    };
  }, [motion, agent.tasks]);

  // drift throughput
  useEffect(() => {
    const id = setInterval(() => {
      if (motion) setThru((v) => Math.max(4, v + rint(-3, 5)));
    }, rint(2000, 3500));
    return () => clearInterval(id);
  }, [motion]);

  return (
    <div className="agent" data-agent={agent.id}>
      <div className="ag-ava">
        {agent.abbr}
        <span className={`stat ${agent.status}`} />
      </div>
      <div className="ag-info">
        <div className="ag-name">
          {agent.name} <span className="role">/ {agent.role}</span>
        </div>
        <div className="ag-task" style={{ opacity: fade ? 0 : 1, transition: "opacity .22s" }}>
          {task}
        </div>
      </div>
      <div className="ag-thru">
        /min
        <br />
        <b>{thru}</b>
      </div>
    </div>
  );
}

function RosterMeter() {
  const motion = useMotion();
  const [v, setV] = useState(94);
  useEffect(() => {
    const id = setInterval(() => {
      if (motion) setV(rint(82, 99));
    }, 2600);
    return () => clearInterval(id);
  }, [motion]);
  return (
    <div className="roster-foot">
      <div className="meter-row">
        <span>Fleet utilization</span>
        <span>{v}%</span>
      </div>
      <div className="meter">
        <i style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
