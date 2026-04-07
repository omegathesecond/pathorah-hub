# Development Overview

## Active Repositories

| Repo | Language / Framework | Purpose |
|------|---------------------|---------|
| `pathorah-api` | TypeScript / Express | REST API, pathfinding engine, auth, credits |
| `pathorah-dashboard` | TypeScript / React | Web dashboard, admin tools |
| `pathorah-ai` | Python / FastAPI | AI enrichment via Gemini |
| Mobile | Flutter | iOS & Android apps |

All API and AI service repos are deployed to Cloud Run (GCP). Dashboard repos are deployed to Cloudflare Pages.

## Current Status

As of **2026-04-07**, two major features have shipped:

1. **Heterogeneous Graph** — Companies, Branches, and the full knowledge graph are live. The pathfinding monolith has been refactored into a clean adapter/core/scoring architecture.

2. **Tiered Representative Verification** — The self-declaration exploit is closed. 19/19 regression tests passing.

## Links

- [Changelog](/development/changelog)
- [Current Sprint](/development/current/)
- [Pathfinding Engine Technical Docs](/product/technical/pathfinding)
- [API Reference](/product/technical/api)