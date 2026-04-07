# Product Roadmap

## Development Timeline

| Period | Focus | Status |
|--------|-------|--------|
| Q4 2025 | Core pathfinding engine (person-only BFS), auth, credits, subscriptions | Completed |
| Q1 2026 | Heterogeneous graph (Companies, Branches, Employment), pathfinding refactor | Completed |
| Q1 2026 | Tiered representative verification (security fix) | Completed |
| Q2 2026 | Mobile app polish, advanced analytics, circle features | In Progress |
| Q3 2026 | Public API / partner integrations, enterprise billing | Planned |

## Milestones

### Completed

- **2026-04-07** — Tiered representative verification shipped. 19/19 regression tests passing. Closes self-declaration score inflation exploit.
- **2026-04-07** — Heterogeneous graph launched. Companies + Branches as first-class graph nodes. `pathfindingService.ts` refactored from 1,400-line monolith into adapter/core/scoring modules.
- **2026-04-07** — AI enrichment expanded to `POST /enrich/company`. Per-node-type Gemini prompt renderer covers user, contact, company, and branch.
- **2026-Q1** — Polymorphic unified search (`GET /api/search`) returning Users, Contacts, Companies, and Branches from a single query.
- **2026-Q1** — `companyService.resolveOrCreate()` — free-text company names auto-normalize (strips Pty/Ltd/Inc/Corp/SA etc.), deduplicate by domain then slug, and create on the fly.
- **2025-Q4** — Core warm-introduction pathfinding with person-only BFS, warmth/trust/recency scoring, credit gates, subscription tiers.

### In Progress

- Mobile app introduction request flow with company target support
- Circle features — group pathfinding, shared network view
- Advanced analytics dashboard — path success rates, network growth metrics

### Planned

- Public partner API with rate-limited keys
- Bulk CSV import for contacts with company normalization
- Enterprise SSO and team billing
- Graph export (Gephi, Neo4j-compatible formats)