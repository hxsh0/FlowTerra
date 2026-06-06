// ============================================================
// FlowTerra — domain types
// ============================================================

export type AgentId = "SCOUT" | "PROBE" | "RELAY" | "ECHO" | "LEDGER";

export type AgentStatus = "working" | "idle" | "ok";

export interface Agent {
  id: AgentId;
  /** Display name, e.g. "Scout" */
  name: string;
  /** Short avatar initials, e.g. "SC" */
  abbr: string;
  /** Pipeline role, e.g. "sourcing" */
  role: string;
  /** Rotating task strings shown live in the roster */
  tasks: string[];
  /** Seed throughput shown as "/min" */
  throughput: number;
  status: AgentStatus;
}

/** A single prospect/account moving through the pipeline. */
export interface Prospect {
  uid: number;
  company: string;
  /** Deal value in thousands of USD */
  value: number;
  /** Whether the card is rendered with the "hot" highlight */
  hot: boolean;
  /** Set true the moment before removal so the exit animation can play */
  leaving?: boolean;
}

export interface Stage {
  key: string;
  name: string;
  /** Headline logical count (independent of the visible sample) */
  count: number;
  /** Agent that owns this stage, lower-cased id used as a tag */
  agent: string;
}

export interface LogLine {
  uid: number;
  time: string;
  agent: string;
  /** Inner HTML-free segments; rendering builds the markup */
  body: LogSegment[];
}

export type LogSegment =
  | { t: "text"; v: string }
  | { t: "strong"; v: string }
  | { t: "pos"; v: string };

// ---- Tweakable visual system ----
export type StyleName = "signal" | "mono" | "editorial";
export type Density = "compact" | "regular" | "comfy";

export interface VisualSettings {
  style: StyleName;
  accent: string;
  density: Density;
  motion: boolean;
}
