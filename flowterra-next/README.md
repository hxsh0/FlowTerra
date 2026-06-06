# FlowTerra — Autonomous Revenue OS

The marketing site for **FlowTerra**, a fictional autonomous revenue operating
system. Built with **Next.js (App Router) + TypeScript**, dark-mode first, with a
live "mission control" command center: prospects flow through the pipeline pushed
by autonomous agents, an activity stream ticks in real time, revenue climbs as
deals close, and charts redraw frame-by-frame.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm run start   # production
```

Requires Node 18.17+ (Next.js 14).

## Design system

| Token group | Notes |
|---|---|
| **Canvas** | Near-black layered surfaces (`--bg-0` → `--bg-3`), hairline borders at 6–16% white. No pure black/white. |
| **Signal color** | A single accent (`--accent`, default orange `#f97316`) reserved for *live* states, agents, and data. Everything else is monochrome. |
| **Type** | [Geist](https://vercel.com/font) for prose, **Geist Mono** for all data, labels, timestamps and IDs. |
| **Motion** | The whole console breathes — pipeline tokens flow, the stream ticks, charts tween, counters animate in. Respects a global motion toggle. |

The visual system is driven entirely by CSS custom properties keyed off three
`<html>` attributes — `data-style`, `data-density`, `data-motion` — plus the
`--accent` variable. The floating **Customize** control (bottom-right) flips these
live and persists the choice to `localStorage`.

### Three visual directions

- **`signal`** — the default. Orange-on-near-black, Geist, balanced density.
- **`mono`** — terminal/dense. Mono-forward headings, tighter spacing, sharper radii.
- **`editorial`** — spacious. Oversized display type, warmer canvas, generous whitespace.

## Project structure

```
app/
  layout.tsx          Root layout — fonts, <VisualProvider>, <html> defaults
  page.tsx            Page composition (server component)
  globals.css         Full design system + component styles
lib/
  types.ts            Domain + visual-settings types
  data.ts             Agents, stages, companies, stream templates, helpers
  visual.tsx          VisualProvider context + useVisual / useMotion hooks
hooks/
  useInView.ts        Fire-once IntersectionObserver
  useCountUp.ts       Eased number count-up
components/
  Nav, Hero, StatLine, AgentsWorkflow, Features, CTA, Footer, Backdrop, Reveal
  StyleSwitcher.tsx   Live visual-system control
  console/
    Console.tsx       Centerpiece — owns shared log + revenue state
    AgentRoster.tsx   Live agent fleet (rotating tasks, drifting throughput)
    Pipeline.tsx      The pipeline simulation (tokens flow, flying dots, counts)
    ActivityStream.tsx
    MetricStrip.tsx
  viz/
    LiveAreaChart.tsx Self-tweening live area chart (no charting deps)
    Gauge.tsx         Radial win-rate gauge
    Sparkline.tsx     Draw-in sparkline
    ConversionBars.tsx
    DataViz.tsx       "Mission control" data section
```

## How the live data works

There are **no real APIs** — every number is a self-contained client-side
simulation, so the page is fully static-exportable and has zero backend
dependencies:

- **`Pipeline`** runs the loop. On each tick it either advances a prospect to the
  next stage (with a flying-dot animation + count flash), sources a new one, or
  retires a closed deal. Movements are reported up to **`Console`** via
  `onLog` / `onWin`, which feed the shared activity stream and revenue counter.
- **`LiveAreaChart`** keeps a rolling window of points and tweens to a freshly
  appended value every ~1.3s with `requestAnimationFrame`.
- All loops read a `motionRef` so the **Live motion** toggle pauses everything at
  once (and honors users who prefer reduced motion via the CSS `data-motion` hook).

To wire real data, replace the generators in `Pipeline`/`Console` with your CRM
feed (poll or websocket) and keep the same component props.
