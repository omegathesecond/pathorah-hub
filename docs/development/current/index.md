# Current Sprint

**Week of 2026-04-07**

## Just Shipped

Both items below are committed and pushed to `main` across all three repos.

### 1. Heterogeneous Graph — Companies, Branches & Knowledge Graph

**API commits**: 2ed33de  
**Dashboard commit**: 2cf1476  
**AI service commit**: f1547b9

**Status**: Complete

New models, polymorphic pathfinding BFS, adapter/core/scoring refactor, resolve-or-create company flow, backfill script, new dashboard pages, AI enrichment for company entities.

Full details: [Heterogeneous Graph feature docs](/product/features/heterogeneous-graph)

### 2. Tiered Representative Verification

**API commit**: 897ccb6  
**Dashboard commit**: 7129731

**Status**: Complete — 19/19 regression tests passing

Closes the self-declaration score inflation exploit. Three-tier trust ladder: self-declared (no boost), email-verified (tier 1, scores at 95), document-or-vouched (tier 2, scores at 100). `representativeTier` is write-protected behind `representativeVerificationService`.

Full details: [Representative Verification feature docs](/product/features/representative-verification)

## In Progress

- Mobile app: introduction request flow updated for company/branch targets
- Circle features: group pathfinding scope
- Advanced analytics dashboard

## Up Next

- Public partner API with rate-limited keys
- Bulk CSV contact import with company normalization
- Enterprise SSO and team billing