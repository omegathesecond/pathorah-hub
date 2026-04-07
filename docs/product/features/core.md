# Core Features

This is the high-level catalog of what Pathorah does. For deeper dives, follow the links to the dedicated feature pages.

## Warm Introduction Pathfinding

The primary feature. Given a source (the logged-in user) and a target (any User, Contact, Company, or Branch), Pathorah finds the N shortest weighted paths through the caller's professional network and ranks them by likeliness. See [Pathfinding Engine](/product/technical/pathfinding) for the algorithm.

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

## Contact Management

Users maintain an address book of Contacts — people who are not yet (or may never be) Pathorah users. Contacts participate in the graph exactly like Users; the only difference is they cannot log in. Employment, personal connections, and all graph edges apply equally. The `userLinkAdapter` bridges a Contact to its corresponding User node when the contact eventually signs up.

## The Network

The full conceptual model — personal plane vs. knowledge plane, ownership scope, edge kinds, growth loops — lives in [The Network](/product/features/network). Skim it before diving into pathfinding internals.

## Companies & Branches

Companies are first-class peer nodes since 2026-04-07. Users can declare employment at any company (creating it on the fly via free-text), companies can have branches with their own employee lists, and the eight company-to-company relationship types let pathfinding hop through partner / supplier / acquired / parent links. See [Companies & Branches](/product/features/companies) for the full user-facing guide.

## Representative Verification

Anyone can claim "I am the founder/principal of this company," but only verified claims earn structural-dominance scoring in pathfinding. The three-tier ladder (self-declared → email-verified → document-verified or vouched) is documented in [Representative Verification](/product/features/representative-verification).

## Knowledge Graph & AI Enrichment

Companies are tagged with industries, capabilities, products, markets, and certifications drawn from canonical taxonomies. The AI service (Gemini-backed) can suggest these and propose company-to-company relationships, with all suggestions surfacing as drafts that an admin reviews before they become real graph edges.

## Circles

Users group their personal contacts into Circles (Family, Investors, Eswatini Tech, etc.). Circles drive pathfinding scoping ("only paths through my Investors circle"), permission-style features for posts, and future scoped intro templates.

## Credits & Subscriptions

Path searches consume credits. Credit gates are enforced in middleware before the BFS engine runs. Subscription tiers control the monthly credit replenishment rate and the maximum path depth.