// ============================================================
// FlowTerra — shared data + generators
// ============================================================
import type { Agent, LogSegment, Stage } from "./types";

export const AGENTS: Agent[] = [
  {
    id: "SCOUT",
    name: "Scout",
    abbr: "SC",
    role: "sourcing",
    throughput: 62,
    status: "working",
    tasks: [
      "scoring 1.4k intent signals",
      "scanning 4 ICP segments",
      "sourcing net-new accounts",
      "qualifying inbound spillover",
    ],
  },
  {
    id: "PROBE",
    name: "Probe",
    abbr: "PR",
    role: "research",
    throughput: 48,
    status: "working",
    tasks: [
      "enriching org charts",
      "mapping decision-makers",
      "parsing recent 10-Ks",
      "verifying contact data",
    ],
  },
  {
    id: "RELAY",
    name: "Relay",
    abbr: "RL",
    role: "outreach",
    throughput: 37,
    status: "working",
    tasks: [
      "personalizing openers",
      "drafting sequences",
      "optimizing send windows",
      "warming new domains",
    ],
  },
  {
    id: "ECHO",
    name: "Echo",
    abbr: "EC",
    role: "replies",
    throughput: 21,
    status: "ok",
    tasks: [
      "booking discovery calls",
      "triaging 38 replies",
      "handling objections",
      "routing to closers",
    ],
  },
  {
    id: "LEDGER",
    name: "Ledger",
    abbr: "LG",
    role: "forecast",
    throughput: 14,
    status: "working",
    tasks: [
      "scoring deal health",
      "forecasting Q3 bookings",
      "attributing pipeline",
      "flagging at-risk deals",
    ],
  },
];

export const STAGES: Stage[] = [
  { key: "sourced", name: "Sourced", count: 128, agent: "scout" },
  { key: "engaged", name: "Engaged", count: 86, agent: "relay" },
  { key: "replied", name: "Replied", count: 41, agent: "echo" },
  { key: "meeting", name: "Meeting", count: 23, agent: "echo" },
  { key: "won", name: "Won", count: 12, agent: "ledger" },
];

/** Agent that "owns" each stage by index — used to tag prospect cards. */
export const STAGE_AGENT = ["scout", "relay", "echo", "echo", "ledger"];

const CO_BASE = [
  "Northwind", "Acme", "Vertex", "Lumen", "Halcyon", "Cobalt", "Meridian",
  "Atlas", "Polaris", "Onyx", "Kestrel", "Sable", "Quanta", "Forge", "Nimbus",
  "Beacon", "Ironclad", "Verde", "Stratos", "Cinder", "Helix", "Apex",
  "Solstice", "Tessel", "Brightline", "Cardinal",
];
const CO_SUFFIX = [
  "Labs", "Systems", "Logistics", "Health", "Capital", "Robotics", "Cloud",
  "AI", "Group", "Foods", "Energy",
];

export const rint = (a: number, b: number) =>
  Math.floor(a + Math.random() * (b - a + 1));
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const pad2 = (n: number) => String(n).padStart(2, "0");

export const newCompany = () => `${pick(CO_BASE)} ${pick(CO_SUFFIX)}`;
export const initials = (s: string) =>
  s.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/** Activity-stream line templates → segments + emitting agent. */
export const STREAM_TEMPLATES: ((co: string) => {
  agent: string;
  body: LogSegment[];
})[] = [
  (co) => ({ agent: "probe", body: [{ t: "text", v: "enriched " }, { t: "strong", v: co }, { t: "text", v: " — found " }, { t: "pos", v: "3" }, { t: "text", v: " decision-makers" }] }),
  (co) => ({ agent: "relay", body: [{ t: "text", v: "sent personalized opener to " }, { t: "strong", v: co }] }),
  (co) => ({ agent: "echo", body: [{ t: "strong", v: co }, { t: "text", v: " replied — intent " }, { t: "pos", v: "high" }, { t: "text", v: ", booking call" }] }),
  (co) => ({ agent: "scout", body: [{ t: "text", v: "scored " }, { t: "strong", v: co }, { t: "text", v: " — ICP match " }, { t: "pos", v: "94%" }] }),
  (co) => ({ agent: "echo", body: [{ t: "text", v: "meeting confirmed with " }, { t: "strong", v: co }, { t: "text", v: " for Thu 14:00" }] }),
  () => ({ agent: "relay", body: [{ t: "text", v: "A/B opener lifted reply rate " }, { t: "pos", v: "+6.2%" }] }),
  (co) => ({ agent: "ledger", body: [{ t: "text", v: "forecast updated — " }, { t: "strong", v: co }, { t: "text", v: " added to commit" }] }),
  (co) => ({ agent: "probe", body: [{ t: "text", v: "flagged " }, { t: "strong", v: co }, { t: "text", v: " — funding round detected" }] }),
  () => ({ agent: "scout", body: [{ t: "text", v: "sourced " }, { t: "pos", v: "12" }, { t: "text", v: " net-new accounts in SMB-West" }] }),
];

export const STAT_LINE = [
  { value: 148, prefix: "$", suffix: "M", dec: 0, label: "Pipeline generated /quarter" },
  { value: 2400, prefix: "", suffix: "", dec: 0, label: "Meetings booked /month" },
  { value: 11.4, prefix: "", suffix: "%", dec: 1, label: "Average reply rate" },
  { value: 9600, prefix: "", suffix: "", dec: 0, label: "SDR-hours automated /week" },
];

export const DEFAULT_ICP_CRITERIA = [
  { id: "size", label: "Business size", weight: 20 },
  { id: "location", label: "Location fit", weight: 20 },
  { id: "reviews", label: "Review volume", weight: 15 },
  { id: "presence", label: "Online presence", weight: 15 },
  { id: "industry", label: "Industry relevance", weight: 20 },
  { id: "contact", label: "Contact availability", weight: 10 },
];

export const DEFAULT_NICHE = {
  industry: "B2B SaaS",
  location: "Austin, TX",
  radiusKm: 50,
  icpCriteria: DEFAULT_ICP_CRITERIA,
};

export const HOT_LEADS = [
  { id: "hl-1", company: "Onyx Capital", icpScore: 94, source: "places" as const, stage: "Replied", status: "active" as const },
  { id: "hl-2", company: "Forge AI", icpScore: 91, source: "places" as const, stage: "Meeting", status: "active" as const },
  { id: "hl-3", company: "Meridian Group", icpScore: 88, source: "scraper" as const, stage: "Engaged", status: "active" as const },
  { id: "hl-4", company: "Polaris Energy", icpScore: 86, source: "places" as const, stage: "Sourced", status: "active" as const },
  { id: "hl-5", company: "Halcyon AI", icpScore: 84, source: "scraper" as const, stage: "Engaged", status: "active" as const },
  { id: "hl-6", company: "Quanta Systems", icpScore: 82, source: "places" as const, stage: "Sourced", status: "active" as const },
  { id: "hl-7", company: "Beacon Labs", icpScore: 79, source: "scraper" as const, stage: "Sourced", status: "nurture" as const },
  { id: "hl-8", company: "Ironclad Group", icpScore: 76, source: "places" as const, stage: "Won", status: "won" as const },
];

export const DISCOVERY_SEED_LEADS = [
  { id: "ds-1", company: "Stratos Cloud", icpScore: 92, source: "places" as const, stage: "Scored", status: "active" as const },
  { id: "ds-2", company: "Solstice Health", icpScore: 89, source: "places" as const, stage: "Scored", status: "active" as const },
  { id: "ds-3", company: "Brightline Ops", icpScore: 85, source: "scraper" as const, stage: "Scored", status: "active" as const },
  { id: "ds-4", company: "Cardinal Logistics", icpScore: 81, source: "scraper" as const, stage: "Scored", status: "active" as const },
  { id: "ds-5", company: "Tessel Analytics", icpScore: 78, source: "places" as const, stage: "Scored", status: "active" as const },
];

export const DASHBOARD_STATS = [
  { value: 847, prefix: "", suffix: "", dec: 0, label: "Leads scraped today" },
  { value: 73, prefix: "", suffix: "%", dec: 0, label: "ICP pass rate" },
  { value: 18, prefix: "", suffix: "", dec: 0, label: "Meetings booked" },
  { value: 4.2, prefix: "$", suffix: "M", dec: 1, label: "Pipeline value" },
];

export const icpWeightSum = (criteria: { weight: number }[]) =>
  criteria.reduce((n, c) => n + c.weight, 0);
