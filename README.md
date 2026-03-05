# OSINT Dashboard

Real-time OSINT monitoring dashboard that aggregates RSS feeds from multiple sources into a unified, scannable feed.

## Features

- **Multi-source aggregation** — News, Reddit, social, and alert feeds in one place
- **Keyword highlighting** — Configurable keyword alerts with visual highlighting
- **Source management** — Add/remove/toggle sources, stored in localStorage
- **Filtering** — By source type, time range, and search query
- **Dark theme** — Easy on the eyes for extended monitoring
- **Mobile responsive** — Collapsible sidebar, works on any device
- **Auto-refresh** — Updates every 5 minutes
- **CORS proxy** — Built-in API route for RSS fetching

## Pre-configured Sources

- Al Jazeera, BBC Middle East, Reuters
- Reddit: r/worldnews, r/MiddleEast, r/dubai, r/iran
- Liveuamap Middle East

## Quick Start

```bash
pnpm install
pnpm dev
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nikkaroraa/osint-dashboard)

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- TypeScript
- No external dependencies for RSS parsing
