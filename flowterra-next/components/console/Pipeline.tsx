"use client";
import { useEffect, useRef, useState } from "react";
import {
  STAGES,
  STAGE_AGENT,
  newCompany,
  initials,
  rint,
  pick,
  STREAM_TEMPLATES,
} from "@/lib/data";
import type { LogSegment, Prospect } from "@/lib/types";
import { useMotion } from "@/lib/visual";

interface StageState {
  key: string;
  name: string;
  count: number;
  tokens: Prospect[];
}

let UID = 1;
const SEED = [5, 4, 4, 3, 2];
const CAP = 5;

function makeProspect(value?: number, hot?: boolean, company?: string): Prospect {
  return {
    uid: UID++,
    company: company ?? newCompany(),
    value: value || rint(12, 184),
    hot: !!hot,
  };
}

interface Props {
  onLog: (agent: string, body: LogSegment[]) => void;
  onWin: (company: string) => void;
}

/**
 * The live pipeline board. Owns the simulation: prospects flow stage→stage,
 * a flying dot animates each hand-off, counts flash, and movement is reported
 * upward via onLog / onWin so the activity stream + revenue stay in sync.
 */
export function Pipeline({ onLog, onWin }: Props) {
  const motion = useMotion();
  const motionRef = useRef(motion);
  motionRef.current = motion;

  const [stages, setStages] = useState<StageState[]>(() =>
    STAGES.map((s, i) => ({
      key: s.key,
      name: s.name,
      count: s.count,
      tokens: Array.from({ length: SEED[i] }, () => makeProspect()),
    }))
  );
  const [flash, setFlash] = useState<Record<number, boolean>>({});

  const stagesRef = useRef(stages);
  stagesRef.current = stages;
  const pipeRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cbRef = useRef<Props>({ onLog, onWin });
  cbRef.current = { onLog, onWin };

  const doFlash = (idx: number) => {
    setFlash((f) => ({ ...f, [idx]: true }));
    setTimeout(() => setFlash((f) => ({ ...f, [idx]: false })), 600);
  };

  const flyDot = (fromIdx: number, toIdx: number) => {
    if (!motionRef.current) return;
    const pipe = pipeRef.current;
    const a = stageRefs.current[fromIdx];
    const b = stageRefs.current[toIdx];
    if (!pipe || !a || !b) return;
    const rr = pipe.getBoundingClientRect();
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "flow-dot";
    const x0 = ra.right - rr.left - 6;
    const y0 = ra.top - rr.top + ra.height / 2;
    const x1 = rb.left - rr.left + 6;
    const y1 = rb.top - rr.top + rb.height / 2;
    dot.style.left = `${x0}px`;
    dot.style.top = `${y0}px`;
    pipe.appendChild(dot);
    dot
      .animate(
        [
          { transform: "translate(0,0)", opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { opacity: 1, offset: 0.8 },
          { transform: `translate(${x1 - x0}px, ${y1 - y0}px)`, opacity: 0 },
        ],
        { duration: 620, easing: "cubic-bezier(.4,0,.2,1)" }
      )
      .addEventListener("finish", () => dot.remove());
  };

  const advance = () => {
    const prev = stagesRef.current;
    const candidates = prev
      .slice(0, 4)
      .map((s, i) => ({ s, i }))
      .filter((x) => x.s.tokens.length > 0);
    if (!candidates.length) return;
    const { s: from, i: idx } = pick(candidates);
    const tok = from.tokens[from.tokens.length - 1];

    // mark leaving for exit animation
    setStages((p) =>
      p.map((s, i) =>
        i === idx
          ? { ...s, tokens: s.tokens.map((t) => (t.uid === tok.uid ? { ...t, leaving: true } : t)) }
          : s
      )
    );
    flyDot(idx, idx + 1);
    doFlash(idx);

    window.setTimeout(() => {
      setStages((p) =>
        p.map((s, i) => {
          if (i === idx) {
            return {
              ...s,
              tokens: s.tokens.filter((t) => t.uid !== tok.uid),
              count: Math.max(0, s.count - 1),
            };
          }
          if (i === idx + 1) {
            const nt = makeProspect(tok.value, idx >= 1, tok.company);
            const tokens = [nt, ...s.tokens];
            if (tokens.length > CAP) tokens.pop();
            return { ...s, tokens, count: s.count + 1 };
          }
          return s;
        })
      );
      doFlash(idx + 1);
      if (idx + 1 === STAGES.length - 1) {
        cbRef.current.onWin(tok.company);
      } else {
        const tpl = pick(STREAM_TEMPLATES)(tok.company);
        cbRef.current.onLog(tpl.agent, tpl.body);
      }
    }, 470);
  };

  const spawn = () => {
    const co = newCompany();
    setStages((p) =>
      p.map((s, i) =>
        i === 0
          ? { ...s, tokens: [makeProspect(0, false, co), ...s.tokens].slice(0, CAP), count: s.count + 1 }
          : s
      )
    );
    doFlash(0);
    cbRef.current.onLog("scout", [
      { t: "text", v: "sourced " },
      { t: "strong", v: co },
      { t: "text", v: " — added to pipeline" },
    ]);
  };

  const wonDecay = () => {
    setStages((p) =>
      p.map((s, i) =>
        i === STAGES.length - 1 && s.tokens.length > 1 ? { ...s, tokens: s.tokens.slice(0, -1) } : s
      )
    );
  };

  // simulation loop + independent chatter
  useEffect(() => {
    let alive = true;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!alive) return;
      if (motionRef.current) {
        const r = Math.random();
        if (r < 0.62) advance();
        else if (r < 0.86) spawn();
        else wonDecay();
      }
      t1 = setTimeout(loop, rint(850, 1700));
    };
    const chatter = () => {
      if (!alive) return;
      if (motionRef.current && Math.random() < 0.7) {
        const tpl = pick(STREAM_TEMPLATES)(newCompany());
        cbRef.current.onLog(tpl.agent, tpl.body);
      }
      t2 = setTimeout(chatter, rint(1500, 2800));
    };
    t1 = setTimeout(loop, 900);
    t2 = setTimeout(chatter, 1400);
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pipe" id="pipe" ref={pipeRef}>
      <div className="pipe-stages">
        {stages.map((s, i) => (
          <div
            className="stage"
            key={s.key}
            data-count={s.count}
            ref={(el) => {
              stageRefs.current[i] = el;
            }}
          >
            <div className="stage-head">
              <span className="stage-name">{s.name}</span>
              <span className={`stage-count ${flash[i] ? "flash" : ""}`}>{s.count}</span>
            </div>
            <div className="stage-track">
              {s.tokens.map((t) => (
                <div
                  className={`tok ${t.hot ? "hot" : ""} ${t.leaving ? "leaving" : ""}`}
                  key={t.uid}
                >
                  <span className="tok-ava">{initials(t.company)}</span>
                  <div className="tok-body">
                    <div className="tok-co">{t.company}</div>
                    <div className="tok-sub">
                      <span className="tok-agent">{STAGE_AGENT[i]}</span>
                      <span className="dot" />
                      <span className="tok-val">${t.value}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
