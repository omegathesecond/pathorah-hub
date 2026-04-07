# Pathorah — Product Overview

Pathorah is a professional networking platform built around the concept of warm introductions. Where LinkedIn shows you who someone knows, Pathorah shows you the shortest verified path from you to anyone you need to reach — through people and organizations you already have relationships with.

## Core Concept

A cold email has a low response rate. An introduction from a trusted mutual contact has a dramatically higher one. Pathorah makes finding that introduction chain fast and trustworthy by modeling your professional world as a graph and running pathfinding algorithms across it.

## What Makes Pathorah Different

| Feature | Traditional Platforms | Pathorah |
|---------|----------------------|----------|
| Graph nodes | People only | People + Companies + Branches |
| Path logic | Degree-of-separation counting | Weighted BFS with warmth, trust, recency, tenure, seniority |
| Company identity | Free-text fields | Canonical Company records with dedup, verified representatives |
| Trust signals | Follower counts | Tiered verification: email domain, document review, peer vouching |
| AI assistance | Profile suggestions | Full entity enrichment via Gemini across 8 relationship types |

## Products

| Repo | Purpose |
|------|---------|
| `pathorah-api` | Express / TypeScript REST API — graph engine, auth, subscriptions, credits |
| `pathorah-dashboard` | React web dashboard — graph explorer, company management, admin tools |
| `pathorah-ai` | Python / FastAPI AI service — Gemini enrichment for users, contacts, companies, branches |
| Mobile app | Flutter — end-user path discovery on iOS and Android |

## Key Differentiators as of April 2026

- **Heterogeneous pathfinding** — a path can traverse User → Employment → Company → CompanyRelationship → Company → Employment → User, or any combination. Adding a new entity type later requires one new adapter, zero BFS changes.
- **REPRESENTS / REPRESENTED_BY edges** — reaching a founder IS structurally equivalent to reaching the company itself, but only after verified tier 1 or 2 status. Tier 0 (self-declared) cannot abuse this.
- **Backfill continuity** — existing free-text `company` strings on User/Contact rows were normalized and clustered into canonical Company records, so no historical context was lost in the migration.