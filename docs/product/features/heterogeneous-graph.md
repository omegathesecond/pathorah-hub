# Heterogeneous Graph

**Shipped: 2026-04-07** — commits 2ed33de / 2cf1476 / f1547b9

Pathorah expanded from a person-only warm-introduction platform into a full heterogeneous graph where Users, Contacts, Companies, and Branches are all first-class peer nodes. This is the largest architectural change in the platform's history.

## Node Types

```
NodeType = 'user' | 'contact' | 'company' | 'branch'
```

Each node is identified by a `GraphNodeRef`:

```typescript
interface GraphNodeRef {
  nodeType: NodeType;
  nodeId: Types.ObjectId;
}
```

## Edge Kinds

| Kind | Collection | Connects |
|------|-----------|---------|
| `personal-contact` | `Connection` | User ↔ User, User ↔ Contact |
| `employment` | `Employment` | (User or Contact) ↔ (Company or Branch) |
| `company-rel` | `CompanyRelationship` | Company ↔ Company |
| `knowledge` | `KnowledgeEdge` | Any entity type ↔ any entity type |

## REPRESENTS / REPRESENTED_BY Edges

A special edge kind within `employment`. When `Employment.isRepresentative = true`, the BFS emits both a `REPRESENTS` edge (person → company) and a `REPRESENTED_BY` edge (company → person). This makes reaching a founder structurally equivalent to reaching the company — but only for verified representatives (tier 1+). See [Representative Verification](/product/features/representative-verification).

## Company Data Model

```typescript
interface ICompany {
  name: string;
  slug: string;          // unique, lowercase, normalized
  aliases: string[];     // historical names from backfill
  legalName?: string;
  domain?: string;       // used for email OTP verification
  verified: boolean;     // flipped to true when first tier-2 rep is confirmed
  source: 'user-claimed' | 'backfill' | 'admin' | 'enrichment';

  // Knowledge graph taxonomy
  industries: ObjectId[];    // ref: Industry
  capabilities: ObjectId[];  // ref: Capability
  products: ObjectId[];      // ref: Product
  markets: ObjectId[];       // ref: Market
  certifications: ObjectId[]; // ref: Certification
}
```

## Branch Data Model

Branches are offices, stores, factories, warehouses, or virtual presences of a Company. Supported `kind` values: `headquarters`, `office`, `store`, `factory`, `warehouse`, `virtual`. Branches carry geo-coords (2dsphere indexed) and can have a manager (`managerUserId`). The `BRANCH_OF` edge connecting a Branch to its parent Company scores at 95 — a near-free structural hop.

## Company Relationships

Eight relationship types between companies, each with its own base score in the edge scorer:

| Type | Base Score |
|------|-----------|
| `SUBSIDIARY_OF` | 95 |
| `ACQUIRED` | 90 |
| `JV_WITH` | 70 |
| `SUPPLIES` | 70 |
| `PARTNERS_WITH` | 60 |
| `CUSTOMER_OF` | 55 |
| `INVESTED_IN` | 50 |
| `COMPETES_WITH` | 15 |

Final score = `base × strength × recencyMultiplier`, clamped to 0–100.

## Knowledge Edges

`KnowledgeEdge` is the escape hatch for future entity types. It can connect any two entities of any of the 9 entity types (`user`, `contact`, `company`, `branch`, `industry`, `capability`, `product`, `market`, `certification`) with an arbitrary `relation` string. Weight is set by the creator; confidence multiplies it.

## Resolve-or-Create Company Flow

The `EmploymentEditor` in the dashboard accepts free-text company names. `companyService.resolveOrCreate()`:

1. Strips legal suffixes (Pty, Ltd, Inc, Corp, SA, LLC, etc.)
2. Deduplicates by domain, then by normalized slug
3. Creates a new Company on the fly if no match is found

Users never need to pre-create a Company record.

## Backfill

`scripts/backfillCompanies.ts` processed all existing `User.company` and `Contact.company` free-text strings:

1. Normalized text (same suffix stripping as resolveOrCreate)
2. Clustered by Levenshtein distance to merge near-duplicates
3. Created canonical Company records
4. Created Employment rows linking each person to their company

No historical company data was lost in the transition.

## Dashboard Pages Added

- `CompaniesListPage` — searchable list of all companies with industry/size filters
- `CompanyDetailPage` — company profile with employees, branches, relationships, AI enrichment
- `CompanyMergeReviewPage` — admin tool for reviewing backfill clusters and merging duplicates
- Shared components: `GraphNodePicker`, `GraphNodeBadge`, `EmploymentEditor`

## AI Enrichment (ai-service f1547b9)

New `POST /enrich/company` endpoint sends the company profile through Gemini and returns suggestions for:

- Industries (from the taxonomy)
- Capabilities
- Products
- Markets
- Certifications
- All 8 company relationship types (with suggested targets)

`entity_prompt_renderer.py` — per-node-type prompt renderer so user/contact/company/branch each get an appropriate Gemini template rather than a generic one.