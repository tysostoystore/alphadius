# ALPHADIUS ✦ Predictive A&R Terminal

ALPHADIUS is an early-discovery music terminal built to identify undervalued artists before they hit the mainstream. By monitoring raw usage metrics and cross-referencing them against social momentum, ALPHADIUS surfaces high-velocity creators in real-time.

## Features

- **Constellation Map**: A dynamic, interactive scatter plot visualization mapping artists by Streams vs Followers, sized by Alpha Score.
- **Alpha Table**: A dense, sortable data terminal displaying real-time metrics, streaming delta percentages, and calculated Alpha Scores.
- **Live Pulse**: A real-time event feed surfacing high-velocity artists, hidden gems, and market opportunities.
- **Predictive Scoring**: Custom algorithms that calculate a proprietary "Alpha" rating by weighing engagement ratios against historical momentum.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) for fast, hybrid rendering.
- **UI & Components**: React, Tailwind CSS, Lucide Icons.
- **Data Visualization**: Recharts, React Zoom Pan Pinch.
- **Database**: local SQLite (`better-sqlite3`) serving as a fast, read-only data layer in production.

## Deployment (Vercel) & Zero-Cost Automation

This project is highly optimized for serverless deployments like **Vercel** running entirely on a free tier.

Since Vercel environments are serverless, the local SQLite database (`audius_alpha.db`) acts as a highly-performant, read-only data snapshot in production. 

### Automated Daily Updates (GitHub Actions)
To keep the data fresh without paying for external databases (like Postgres or Turso), this repository utilizes **GitHub Actions**:
1. Every 24 hours (or manually triggered), a GitHub Action spins up.
2. It runs `bun run scripts/ingest.ts` to scrape the Audius API and build a fresh `audius_alpha.db`.
3. The Action automatically commits and pushes the updated `.db` file to the `main` branch.
4. **Vercel** detects the push and automatically triggers a new deployment with the latest fresh data.

**Zero Cost. Zero Maintenance.** Ensure that `audius_alpha.db` is whitelisted (not ignored) in your `.gitignore` so the Action can push it.

### Local Development

If you want to run it locally before deploying:
```bash
bun install
bun run dev
```

## Architecture & Data Flow

- The backend ingestion pipeline (`scripts/ingest.ts`) fetches raw data across discovery nodes, processing the data to ensure accuracy and limit spam.
- Cross-sectional snapshots are stored dynamically into the SQLite layer.
- Alpha Scores are regenerated continuously on the frontend APIs (`src/pages/api/alpha-feed.ts`), parsing data against the ranking formulas in `src/lib/scoring.ts` to surface the top moving artists.

## Disclaimer

This project is an experimental data analysis tool. It provides analytics based purely on public API data.
