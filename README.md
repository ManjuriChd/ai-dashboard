# AI Market Intelligence Dashboard

Enterprise-grade dashboard for AI model market intelligence, built with **Vue 3** (Composition API), **Vite**, **Pinia**, **Tailwind CSS**, and **Chart.js**.

## Features

- **Live metrics**: Animated counters for Live Model Count and Total Global Users, updated by a mock real-time stream (polling every 5–10 seconds).
- **Popular models of 2026**: Section with model–company mapping (e.g. Gemini 3 → Google, GPT-5 → OpenAI) and a bar chart of popularity scores.
- **Usage by team**: Doughnut chart for usage segmentation (Software Engineering, Data Analytics, Creative Arts, Legal, **Other** for remaining teams/professionals).
- **Model explorer**: Expandable table with filters by Company and Capability; **Export to CSV** for the current list; each row shows Launched Date, Developer, Capabilities, and Limitations (context window, latency, compute cost).
- **Live data**: **Real WebSocket** connection to a mock server (`npm run dev:ws`) for live updates; falls back to polling if the server is not running.
- **New launch toast**: When the stream injects a “new model”, a toast notification appears and auto-dismisses after 5 seconds.
- **Cyber theme**: Dark background `#081738`, slate-100 text, accent `#00d4aa`.
- **Accessibility**: Charts have `aria-label`s, layout is responsive (mobile-first), focus states and semantic structure for screen readers.

## Tech stack

- **Vue 3** (Composition API) + **Vite**
- **Pinia** for state
- **Tailwind CSS** for styling
- **Chart.js** + **vue-chartjs** for visualizations
- **Vue Router** for routing

## Project structure

- `/src/components` – Sidebar, Header, MetricCards, PopularModels, UsageByTeam, **IndustryImpact**, ModelExplorer, NewLaunchToast
- `/src/store/marketStore.ts` – Pinia store (metrics, models, team usage, filters, toast)
- `/src/services/dataStream.ts` – WebSocket client (with polling fallback) for live metrics, team usage, and models
- `/server/ws-server.mjs` – Mock WebSocket server (run with `npm run dev:ws`)
- `/src/types/market.ts` – Shared types (AIModel, Company, Capability, etc.)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Optional – WebSocket live updates:** In a second terminal run `npm run dev:ws` to start the mock WebSocket server on `ws://localhost:3001`. The dashboard will use it for real-time updates; without it, the app falls back to client-side polling.

## Build

```bash
npm run build
npm run preview
```

## License

MIT
