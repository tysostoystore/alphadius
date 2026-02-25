# ALPHADIUS — Predictive A&R Terminal

> **Discover artists before they blow up.**

ALPHADIUS scans the [Audius](https://audius.co) decentralized music platform and surfaces emerging artists using a proprietary **Alpha Score** — a signal inspired by financial alpha that identifies talent the market has yet to price in.

---

## What is the Alpha Score?

```
α = log₁₀(Plays/(Followers+100)+1) × log₁₀(Plays+1) × 10 × [1 + log(1+Δ%/10)]
```

The formula rewards two types of artists:

- **💎 Hidden Gems** — high play counts relative to their social footprint (market undervalues them)
- **⚡ Breaking Artists** — significant 24h stream velocity (momentum signal)

Ghost accounts and bots can't game it: the formula requires *both* real listeners and an undervalued ratio.

---

## Features

| Feature | Description |
|---|---|
| 🔭 **Discovery Constellation** | Scatter plot: X=Stream Count, Y=Undervaluation, Size=Alpha |
| ⚡ **Alpha Feed** | Live-ranked table with filter, search, and multi-column sort |
| 💎 **Live Pulse** | Alert feed surfacing velocity events and hidden gems |
| 🎵 **Artist Detail** | Inline track playback + full stat breakdown |
| 🔄 **Daily Refresh** | GitHub Actions ingests fresh data every 24h |
| 🎯 **Genre Filter** | Drill down by genre across the full dataset |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Astro](https://astro.build) + React islands |
| Styling | Tailwind CSS v4 |
| Database | SQLite (better-sqlite3) |
| Data Source | [Audius API](https://audius.co/api) |
| Deployment | Vercel |
| CI/CD | GitHub Actions (daily cron) |
| Runtime | Bun |

---

## Architecture

```
Audius API ──→ scripts/ingest.ts ──→ SQLite DB ──→ /api/alpha-feed ──→ React UI
                      ↑
          GitHub Actions (daily, UTC 03:00)
```

### Ingestion Pipeline

1. **Fetch** — pulls trending artists + top tracks from Audius API
2. **Enrich** — matches artist coins from the Audius native token index
3. **Snapshot** — stores timestamped play counts for delta computation
4. **Score** — computes Alpha Score for all artists (including backfill of existing DB)
5. **Commit** — pushes updated SQLite DB back to repo → Vercel auto-deploys

---

## Running Locally

```bash
# Install dependencies
bun install

# Populate the database (requires internet access)
bun run scripts/ingest.ts

# Start dev server
bun run dev
# → http://localhost:4321
```

---

## Alpha Score Formula — Deep Dive

The formula has three multiplicative components:

| Component | Signal | Formula |
|---|---|---|
| **Undervaluation** | Plays vs followers | `log₁₀(plays/(followers+100) + 1)` |
| **Credibility** | Scale filter | `log₁₀(plays + 1)` |
| **Momentum Boost** | 24h growth | `1 + log(1 + Δ%/10)` |

- Base score with **0% growth** → momentum multiplier = ×1.0 (gems aren't penalized)
- At **+42% growth** → ×2.7 boost
- At **+100% growth** → ×3.4 boost

---

*Data refreshes daily via GitHub Actions. Not financial advice. Alpha scores are experimental discovery signals, not guarantees of commercial success.*
