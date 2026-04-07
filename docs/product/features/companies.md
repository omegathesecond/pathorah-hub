# Companies & Branches

User-facing guide to everything that ships with the heterogeneous graph rollout. For the data-model and engineering view, see [Heterogeneous Graph](/product/features/heterogeneous-graph).

## What a Company Is in Pathorah

A `Company` is a first-class node in the network, peer to Users and Contacts. Reaching a company through pathfinding is a real result — it means "you have a path to this organization through someone you trust." You can target a Company directly when searching, just like a person.

A Company has:

- **Identity** — name, slug, aliases, legal name, optional domain (e.g. `vodacom.co.za`), logo
- **Headquarters** — country, region, city, optional coordinates
- **Knowledge graph facets** — industries, capabilities, products, markets, certifications (each a reference to a canonical taxonomy entry)
- **Verification status** — `verified: true` once the company has at least one tier-2 verified representative (see [Representative Verification](/product/features/representative-verification))
- **Source provenance** — `user-claimed`, `backfill`, `admin`, or `enrichment`
- **An optional claimant** — the user who first registered the company

## Branches

A `Branch` is a sub-entity of a Company representing a physical or virtual location. Each branch has:

- A `kind` — `headquarters`, `office`, `store`, `factory`, `warehouse`, or `virtual`
- A `location` with optional 2dsphere-indexed coordinates for map queries
- An optional `managerUserId` — the User who manages it
- A list of employees specific to that branch (via `Employment.branchId`)

Pathfinding can target a Branch directly. A path to "Vodacom Johannesburg Office" only traverses Employment edges where `branchId` matches that branch — it won't bring back employees of other Vodacom locations.

A `BRANCH_OF` edge with score 95 always exists between a branch and its parent company, so the BFS can hop up from a branch to the company effectively for free.

## Creating a Company

There are three ways a Company comes into existence:

### 1. Free-text from the Employment editor (most common)

When a user is declaring their own employment in the dashboard, the company picker accepts free text. If they type "Vodacom Botswana" and press Create, the API does a `companyService.resolveOrCreate()`:

1. **Normalize** — strip legal suffixes (`Pty`, `Ltd`, `Inc`, `Corp`, `LLC`, `SA`, `(Pty) Ltd`), trim whitespace, slugify
2. **Match by domain** — if `companyDomain` was provided, look for an existing Company with that domain
3. **Match by slug** — fall back to the normalized slug
4. **Create** — if no match, create a new Company row with `source: 'user-claimed'`, the requesting user as `claimedByUserId`, and the freshly-typed name as the canonical name

The user never sees this dance — they just see "Vodacom Botswana added" and the Employment row is created.

### 2. Companies List page

`/companies` is the canonical CRUD page. Search box at the top, paginated grid below. The "+ New Company" button opens the full editor with all fields (name, domain, headquarters, industries, capabilities, products, markets, certifications, size bucket, founded year, etc.).

### 3. Backfill from existing strings

The one-time `scripts/backfillCompanies.ts` script processed every existing `User.company` and `Contact.company` free-text string in the database. It normalized them, clustered by Levenshtein distance, and produced canonical Company rows with `source: 'backfill'`. These are reviewed in the Merge Review queue.

## Adding Employees

Two ways to populate a company's employee list:

1. **A user declares their own employment** — `EmploymentEditor` on their profile page, picks the company (or creates it via free-text), sets title, dates, seniority. This is the primary growth loop.
2. **A user adds employment for one of their contacts** — same editor, but the subject is a Contact. Useful for maintaining a colleague's record before they sign up themselves.

When a Contact later signs up as a User, the `userLinkAdapter` bridges the identities so all the Employment rows stay attached.

### The "This Person IS the Company" Checkbox

In the EmploymentEditor there's a special checkbox: **"This person IS the company."** Tick it for founders, sole proprietors, and principals where the person and the entity are functionally equivalent. The pathfinding engine then treats reaching that person as equivalent to reaching the company itself.

But: **the structural-dominance scoring boost only kicks in if the claim is verified.** Until you complete email/document/vouch verification, your representative claim sits at tier 0 and pathfinding scores you the same as a regular employee. See [Representative Verification](/product/features/representative-verification) for the full ladder.

## Branches: Adding Locations

The Company Detail page has a Branches tab. From there, anyone with `companyAdmin` permission for the company (see below) can add a branch:

- Pick a kind (office, store, factory, warehouse, virtual, headquarters)
- Set a location (country/region/city, optional address, optional coordinates from the map picker)
- Optionally assign a manager (a User from the unified search)
- Optionally pick a parent branch (for hierarchical branch trees)

Once a branch exists, employees can be assigned to it via their Employment row's `branchId` field.

## Company Relationships

The Company Detail page has a Relationships tab. From there, a `companyAdmin` can declare a relationship between this company and another:

- **Pick a target company** via the unified `GraphNodePicker` — supports free-text resolve-or-create the same way the EmploymentEditor does
- **Pick a relationship type** from the eight options:

  | Type | Meaning | BFS Score |
  |------|---------|-----------|
  | `SUBSIDIARY_OF` | A is a subsidiary of B | 95 |
  | `ACQUIRED` | A acquired B | 90 |
  | `JV_WITH` | A and B are in a joint venture | 70 |
  | `SUPPLIES` | A supplies B | 70 |
  | `PARTNERS_WITH` | A and B are partners | 60 |
  | `CUSTOMER_OF` | A is a customer of B | 55 |
  | `INVESTED_IN` | A invested in B | 50 |
  | `COMPETES_WITH` | A and B compete | 15 |

- **Set a strength** (0–1, default 0.5) and optionally start/end dates
- **Direction** — directed or undirected. Most are directed; `JV_WITH` and `PARTNERS_WITH` are typically undirected

These relationships add edges to the world-graph plane that any user's pathfinding can traverse.

## Knowledge Graph Facets (Taxonomy)

Every Company can be tagged with references to canonical taxonomy entries from these collections:

- `Industry` — what sector the company is in (`fintech`, `agritech`, `mining`)
- `Capability` — what they do well (`software-development`, `mobile-money`, `last-mile-delivery`)
- `Product` — what they make/sell (`payment-gateway`, `solar-panel`)
- `Market` — geographies they serve (`south-africa`, `east-africa`)
- `Certification` — credentials they hold (`iso-27001`, `pci-dss`)

Each taxonomy collection has the same shape: `name`, `slug`, `aliases`, optional `parentId` for hierarchies, optional description. They're managed by global admins via `/api/industries`, `/api/capabilities`, etc.

The facets show as chips on the Company Detail page and feed into:
- Filters on `/companies` (find all `fintech` companies)
- AI enrichment ("suggest more capabilities for this company")
- Future "find any company in industry X" predicate-based pathfinding

## AI Enrichment

The Company Detail page has an "Enrich with AI" button (commit `f1547b9`, ai-service). Clicking it sends the company profile to Gemini via `POST /enrich/company` and returns suggestions for:

- Industries from the taxonomy
- Capabilities
- Products
- Markets
- Certifications
- Up to 5 suggested company relationships, each tagged with one of the eight relationship types

Suggestions arrive as drafts — they don't auto-apply. The user reviews each one and clicks accept/reject. Accepted suggestions become real `KnowledgeEdge` or `CompanyRelationship` rows with `source: 'enrichment'` and `confidence < 1.0` so they're distinguishable from human-curated data.

The AI service uses a per-node-type prompt renderer (`entity_prompt_renderer.py`) so user/contact/company/branch each get an appropriate Gemini template rather than a generic one.

## Permissions: Scoped `companyAdmin`

Pathorah doesn't have a "company admin" global role. Instead, the role is scoped — per company:

- The user is a global Pathorah admin (`User.role === 'admin'`), OR
- The user has a current `Employment` row at this company with `isCompanyAdmin: true`, OR
- The user is `Company.claimedByUserId` AND the company is still unverified

Any of these grants edit permissions on that one company: editing the company profile, adding branches, declaring company relationships, verifying employees, approving merge candidates for the company.

This is enforced by `requireCompanyAdmin(companyId)` middleware. It does NOT grant permissions on other companies — admin-ness is per-row.

## Admin Tools

Two admin-only pages exist for company management:

### `/companies/merge-review`

Reviews backfill clusters. The backfill script tries hard to dedupe (`vodacom`, `Vodacom SA`, `vodacom south africa` → one canonical row), but ambiguous cases get marked low-confidence and surface here. Admins pick a canonical target and merge the others into it. Merging moves all `Employment`, `CompanyRelationship`, and `KnowledgeEdge` rows server-side via `companyService.merge()`.

### `/companies/representative-review`

Reviews tier-2 representative document submissions. Each row shows the claimant, the company, the uploaded document URL, and approve/reject buttons with an optional rejection note. Approving flips the Employment row to `representativeTier: 2` and the parent Company to `verified: true`. Rejecting clears the pending status with the note shown to the claimant.

## API Surface

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/companies` | GET | Search/list companies (filters: `q`, `industryId`, `country`, `sizeBucket`) |
| `/api/companies` | POST | Create a company (creator becomes `claimedByUserId`) |
| `/api/companies/:id` | GET | Detail with employee/branch/relationship counts |
| `/api/companies/:id` | PATCH | Edit (companyAdmin) |
| `/api/companies/:id` | DELETE | Delete (global admin only) |
| `/api/companies/:id/claim` | POST | Request ownership of an unclaimed company |
| `/api/companies/:id/logo` | POST | Multipart logo upload |
| `/api/companies/:id/employees` | GET | Paginated employee list |
| `/api/companies/:id/branches` | GET | Branch list |
| `/api/companies/:id/relationships` | GET | Outgoing CompanyRelationship rows |
| `/api/branches` | POST | Create a branch (companyAdmin of parent) |
| `/api/branches/:id` | GET / PATCH / DELETE | Branch CRUD |
| `/api/employments` | POST | Create employment (handles resolve-or-create) |
| `/api/employments/:id` | PATCH / DELETE | Employment CRUD |
| `/api/employments/:id/verify` | POST | Mark as company-admin verified |
| `/api/company-relationships` | POST / DELETE | Relationship CRUD (companyAdmin) |
| `/api/search?types=user,contact,company,branch&q=…` | GET | Unified polymorphic search powering all pickers |

For the full API reference including representative verification routes, see [API Reference](/product/technical/api).

## Dashboard Pages

| Route | What It Does |
|-------|-------------|
| `/companies` | `CompaniesListPage` — search, filter, create |
| `/companies/:id` | `CompanyDetailPage` — overview / employees / branches / relationships / facets / AI enrichment |
| `/companies/merge-review` | `CompanyMergeReviewPage` — admin backfill cluster review |
| `/companies/representative-review` | `RepresentativeReviewPage` — admin tier-2 document review queue |

Plus the shared components used inside these pages and inside other workflows:

- `GraphNodePicker` — polymorphic autocomplete that returns `{nodeType, nodeId}` for User / Contact / Company / Branch
- `GraphNodeBadge` — renders any node type with the right icon, name, subtitle
- `EmploymentEditor` — used on User profile, Contact detail, Company detail to add an employment
- `RepresentativeVerificationFlow` — inline ladder UX after creating a rep employment

## Related

- [The Network](/product/features/network) — conceptual model of how everything composes
- [Heterogeneous Graph](/product/features/heterogeneous-graph) — engineering view of node types and edges
- [Representative Verification](/product/features/representative-verification) — the trust ladder
- [Data Models](/product/technical/models) — Mongoose schemas
- [Pathfinding Engine](/product/technical/pathfinding) — how scoring composes across heterogeneous paths