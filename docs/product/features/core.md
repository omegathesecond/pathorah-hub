# Core Features

## Warm Introduction Pathfinding

The primary feature. Given a source (the logged-in user) and a target (any User, Contact, Company, or Branch), Pathorah finds the N shortest weighted paths through the caller's professional network and ranks them by likeliness.

### How a Path is Scored

Each edge in a path has a weight on the 0–100 scale. The overall path likeliness is derived from the product of edge weights (via `GraphUtils.calculatePathLikeliness`), which means a single weak edge tanks the whole path score.

Edge weights by kind:

| Edge Kind | Formula | Range |
|-----------|---------|-------|
| `personal-contact` | warmth-decay × trust × recency via `GraphUtils` | 0–100 |
| `employment` | base (current/past tenure) + seniority lift + admin bonus, capped at 90 for unverified | 0–90 (regular), 95–100 (verified rep) |
| `company-rel` | type base × strength × recency multiplier | 0–100 |
| `knowledge` | raw weight × confidence | 0–100 |

### Target Types

`POST /api/paths/find` accepts:

- `targetUserId` / `targetContactId` — legacy person targets
- `targetType` + `targetId` — polymorphic targets including Company and Branch
- `allowTransitNodeTypes` — which node types may appear as intermediate hops

## Introduction Requests

Once a path is found, the user can send an introduction request along the chain. Each intermediary is notified via WhatsApp (Omevision shared notification service) and can accept or decline.

## Credits & Subscriptions

Path searches consume credits. Credit gates are enforced in middleware before the BFS engine runs. Subscription tiers control the monthly credit replenishment rate and the maximum path depth.

## Contact Management

Users maintain an address book of Contacts — people who are not yet (or may never be) Pathorah users. Contacts participate in the graph exactly like Users; the only difference is they cannot log in. Employment, personal connections, and all graph edges apply equally.