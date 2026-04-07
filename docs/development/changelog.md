# Changelog

## [2026-04-07] Heterogeneous Graph + Tiered Representative Verification

**Repos**: `pathorah-api` (2ed33de, 897ccb6), `pathorah-dashboard` (2cf1476, 7129731), `pathorah-ai` (f1547b9)

### New Features

**Companies, Branches & Knowledge Graph**

- New models: `Company`, `Branch`, `Employment`, `CompanyRelationship`, `KnowledgeEdge`, plus tag collections `Industry`, `Capability`, `Product`, `Market`, `Certification`
- `REPRESENTS` / `REPRESENTED_BY` edges — founders/sole-proprietors/principals are structurally equivalent to the company in the graph (pending tier 1+ verification)
- `BRANCH_OF` edge — connecting a branch to its parent company scores at 95 (near-free structural hop)
- `companyService.resolveOrCreate()` — free-text company names normalize (strip Pty/Ltd/Inc/Corp/SA/LLC/etc), deduplicate by domain then slug, create on the fly
- Scoped company admin permissions — `middleware/companyAdmin.ts` checks `Employment.isCompanyAdmin` per company rather than via a global role
- `scripts/backfillCompanies.ts` — extracted existing `User.company` / `Contact.company` strings, normalized, clustered by Levenshtein distance, created canonical Company + Employment rows
- Dashboard pages: `CompaniesListPage`, `CompanyDetailPage`, `CompanyMergeReviewPage`
- Dashboard components: `GraphNodePicker`, `GraphNodeBadge`, `EmploymentEditor`
- AI service: `POST /enrich/company` — Gemini suggests industries, capabilities, products, markets, certifications, and all 8 relationship types. `entity_prompt_renderer.py` provides per-node-type prompt templates.

**Polymorphic Pathfinding**

- `POST /api/paths/find` now accepts `targetType` + `targetId` + `allowTransitNodeTypes` alongside legacy person-only fields
- `GET /api/search` — unified polymorphic search returning Users, Contacts, Companies, and Branches from a single query

**New API routes**: `/api/companies`, `/api/branches`, `/api/employments` (expanded), `/api/company-relationships`, `/api/knowledge-edges`, `/api/industries`, `/api/capabilities`, `/api/products`, `/api/markets`, `/api/certifications`, `/api/search`

### Security Fixes

**Tiered Representative Verification**

Problem: anyone could set `isRepresentative = true` on an Employment row and inflate pathfinding scores to near-structural levels (self-declared founder of any company = near-100 edge score).

Fix: three-tier trust ladder where the structural scoring boost is gated behind real proof:
- Tier 0 (self-declared): falls through to regular employment math, capped at `EMPLOYMENT_MAX = 90`. No structural dominance.
- Tier 1 (email-verified): proved control of a company-domain address via 6-digit OTP (15-min TTL, 5-attempt lockout, sha256-hashed with `select: false`). Free-mail providers rejected. Edge scores at 95.
- Tier 2 (document-verified OR vouched): admin approves registration certificate / CIPC filing / board resolution, OR existing tier-2 rep vouches (voucher must be tier 2 of same company; self-vouching blocked). Edge scores at 100. `Company.verified` flips to `true`.

New fields on `Employment`: `representativeTier`, `representativeVerifiedAt`, `representativeVerifiedByMethod`, `representativeVerifiedByUserId`, `representativeEmailOtpHash` (select:false), `representativeEmailOtpExpiresAt`, `representativeEmailAddress`, `representativeEmailAttempts`, `representativeDocumentUrl`, `representativeDocumentReviewStatus`, `representativeDocumentReviewNote`

New service: `representativeVerificationService.ts` — the only code path allowed to write `representativeTier`. Regular `PATCH /employments/:id` does not include it in the allowlist.

New routes:
- `POST /api/employments/:id/representative/email/start`
- `POST /api/employments/:id/representative/email/confirm`
- `POST /api/employments/:id/representative/document`
- `POST /api/employments/:id/representative/vouch`
- `GET /api/employments/representative/pending` (admin)
- `POST /api/employments/:id/representative/review` (admin)

Dashboard components: `RepresentativeVerificationFlow.tsx` — inline verification wizard, tier-2 verified badge. Admin page: `/companies/representative-review`.

19/19 regression tests passing including Test 5b (monotonic tier ordering, tier 0 cap at EMPLOYMENT_MAX).

### Refactoring

**Pathfinding Engine Rewrite**

- Retired: `pathfindingService.ts` (893 lines), `smartPathfindingService.ts` (535 lines), `pathScoringService.ts` (114 lines)
- New structure: `services/pathfinding/core/`, `adapters/`, `scoring/`, `resolvers/`
- Parent-pointer reconstruction eliminates O(n) path array spreads from the old smart pathfinding service
- O(n) `Array.shift()` in the queue eliminated
- Two divergent scoring systems (local vs smart) replaced by single `scoring/edgeScoring.ts`
- `calculateWarmthDecay` — previously defined in `graphUtils.ts` but never called — is now wired into `edgeScoring.ts` for personal-contact edges
- Adapter pattern: adding a new entity type later = one new adapter file, zero BFS changes

---

*Earlier entries will appear here as the changelog grows.*