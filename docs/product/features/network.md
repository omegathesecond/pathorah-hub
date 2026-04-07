# The Network

The "network" is the foundational concept Pathorah is built on. Everything else — pathfinding, introductions, company graphs, AI enrichment — exists to traverse and grow this network. This page explains it from the ground up: who's in it, who owns what, how edges form, and how the network composes with the heterogeneous graph.

## What Is "The Network"?

For any given user, **their network** is the subgraph of nodes they can reach via a chain of trusted edges. It includes:

- **The user themselves** (a `User` node)
- **Their Contacts** — people they know personally (`Contact` nodes they own)
- **Their personal connections** — `Connection` rows linking them to their contacts and to other users
- **Reachable companies and branches** — any `Company` or `Branch` node that one of the above is `EMPLOYED_AT`, or that any reachable company is connected to via a `CompanyRelationship`
- **Other users** they reach transitively through the chain (friends-of-friends-of-employees-of-partners-of...)

Pathorah's job is to find the shortest, warmest chain from the user to any target in this expanding sphere.

## Two Kinds of Nodes Live in the Network

The network used to be person-only. After the [heterogeneous graph](/product/features/heterogeneous-graph) launch (2026-04-07), there are four:

| Node Type | What It Represents | Source of Truth |
|-----------|-------------------|-----------------|
| `user` | A registered Pathorah user | `User` collection |
| `contact` | Someone in a user's address book who isn't (yet) a user | `Contact` collection |
| `company` | A canonical organization | `Company` collection |
| `branch` | A physical or virtual location of a company | `Branch` collection |

Both `user` and `contact` nodes participate in the network identically. The only difference is `contact` nodes can't log in or initiate intro requests — they only respond when someone reaches them.

## Two Kinds of Edges Form the Fabric

### Personal edges (the warm-network plane)

These live in the `Connection` collection and are **owner-scoped** — each row is created and owned by one user. They represent a direct first-degree relationship:

- `OWNS_CONTACT` — User has Contact in their address book
- `KNOWS` — Mutual personal connection
- `LINKED_TO` — Bridge between a Contact and a User who share an identity (used by `userLinkAdapter` to fold a contact's identity onto a real user when they sign up)

Personal edges carry three quality signals:

- **`warmth`** — how strong the relationship is (0–100), decayed over time by the nightly `decayWarmth` cron
- **`trustScore`** — how much the owner trusts the contact (0–100, manually set or inferred)
- **`lastInteractionAt`** — used to compute a recency multiplier on every read

The combination is computed in `edgeScoring.ts` as `calculateEdgeScore(warmth, trust, recency, 50)`. Until the heterogeneous-graph rollout, `calculateWarmthDecay` was defined in `graphUtils.ts` but never actually called — that's now fixed and decay is real.

### Knowledge edges (the world-graph plane)

These live in the `Employment`, `CompanyRelationship`, and `KnowledgeEdge` collections and are **globally shared** — they aren't scoped to one user's address book. Any user traversing a path can use any knowledge edge.

- `Employment` rows produce `EMPLOYED_AT`, `EMPLOYS`, `REPRESENTS`, `REPRESENTED_BY`, `BRANCH_OF` edges
- `CompanyRelationship` rows produce `PARTNERS_WITH`, `SUPPLIES`, `CUSTOMER_OF`, `COMPETES_WITH`, `ACQUIRED`, `INVESTED_IN`, `SUBSIDIARY_OF`, `JV_WITH`
- `KnowledgeEdge` is the escape hatch for the future: `HAS_INDUSTRY`, `OFFERS_PRODUCT`, `CERTIFIED_IN`, etc.

This is what makes Pathorah a real graph rather than a contact manager. A user who has *no* personal connection to the Vodacom CFO might still reach them via:

```
You → (your contact) Bob → (employed at) MTN → (PARTNERS_WITH) Vodacom → (employs) Vodacom CFO
```

The first hop is a personal edge from your owner-scoped subgraph. Hops 2–4 are knowledge edges anyone can traverse.

## Ownership and Scope: Who Sees What

```
Your Pathorah view:
┌─────────────────────────────────────────────────────────┐
│ Personal plane (yours alone)                             │
│   ├── Your Contacts                                       │
│   ├── Your Connections                                    │
│   └── Your Circles                                        │
├─────────────────────────────────────────────────────────┤
│ Knowledge plane (shared with everyone)                   │
│   ├── All Companies and Branches                          │
│   ├── All Employment edges                                │
│   ├── All CompanyRelationships                            │
│   └── All KnowledgeEdges                                  │
└─────────────────────────────────────────────────────────┘
```

Two users searching for the same target will get **different paths** because their personal planes differ. They'll see the same companies, same employments, and same company relationships — but each user's BFS starts from their own root and traverses their own contact set first.

## Circles: Grouping the Personal Plane

A user can group their contacts into **Circles** — soft-edge collections like "Family", "Investors", "Eswatini Tech". Circles are not edges themselves; they're filters. Pathfinding can be restricted to "only paths that start through my Investors circle" via the API.

Circles also drive permission-style features:
- "Share my new post with the Eswatini Tech circle"
- "Hide my company info from Family circle members"
- Future: scoped intro request templates per circle

## How Edges Are Created

| Edge | Created By | Lifecycle |
|------|-----------|-----------|
| Personal `Connection` (`OWNS_CONTACT`, `KNOWS`) | User adds a Contact, accepts a connection request, or imports their address book | Stays until manually removed; warmth decays nightly |
| `Employment` | User declares their own job, creates one for a Contact, or backfilled from `User.company` strings | Lifetime tied to start/end dates; goes to `isCurrent: false` when an end date is set |
| `CompanyRelationship` | User with `companyAdmin` permission, global admin, AI enrichment, or public-data backfill | Manually managed; admins can mark `isActive: false` instead of deleting |
| `KnowledgeEdge` | Mostly admin/enrichment for now; UI-driven creation coming for taxonomy management | Soft-deletable via `isActive` |
| `BRANCH_OF` | Implicit — emitted by `employmentAdapter` whenever a Branch is expanded | Always exists when a Branch row exists; weight is structural (95) |

## Network Growth Loops

The network grows in three loops, each with a different mechanism and timescale:

1. **Personal loop** — users add contacts, accept connections, import their address book. Days to weeks.
2. **Employment loop** — users declare their own jobs (and backfill turned existing free-text strings into Employment rows). Hours to days.
3. **Knowledge loop** — admins, AI enrichment, and (future) public-data sync expand the company knowledge graph. Continuous, async.

Pathfinding gets stronger from all three. Loop 2 is the highest-leverage one for an individual user — declaring your current employer instantly opens up paths to every coworker, every employee of every partner company, and every customer/supplier on record.

## Performance Bounds

The network is unbounded in theory, but every BFS run respects:

- **`maxDepth`** — default 5, controls how many hops the search will take
- **`maxFanout`** per node — `employmentAdapter` caps each company at 200 employees per expansion, ranked verified-rep > rep > current+senior > everyone else, so a 10,000-employee company doesn't blow up the frontier
- **`maxPaths`** — default 10, the BFS stops once it has found N distinct paths
- **`timeoutMs`** — default 8 seconds, hard wall-clock cutoff
- **Per-depth visited cache** — prevents re-expanding the same node at the same depth twice

See [Pathfinding Engine](/product/technical/pathfinding) for the algorithmic details.

## What's Not in the Network (Yet)

- **Project / Event nodes** — would let "we worked together on project X" be a first-class edge
- **Reports-to / org chart edges** — currently only the binary "you work here" is captured; "you report to her, she reports to him" isn't
- **Affinity / interest edges** — knowing that two people share an interest (cycling, fintech) without a direct relationship
- **Implicit cross-network bridges** — when two users both have a Contact with the same email/phone, those Contacts could be inferred as the same person and the networks bridged. Currently only the explicit `userLinkAdapter` does this

These are all in the [backlog](/development/planning/backlog) and tracked there.

## Related

- [Heterogeneous Graph](/product/features/heterogeneous-graph) — the data model details
- [Companies & Branches](/product/features/companies) — user workflows for the new node types
- [Representative Verification](/product/features/representative-verification) — how the trust ladder protects pathfinding
- [Pathfinding Engine](/product/technical/pathfinding) — the BFS algorithm and scoring math
- [Data Models](/product/technical/models) — Mongoose schemas for every collection