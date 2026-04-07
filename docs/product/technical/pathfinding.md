# Pathfinding Engine

## Overview

The pathfinding engine finds the N shortest weighted paths between a source node and a target node in Pathorah's heterogeneous professional graph. It is completely unaware of which MongoDB collection an edge came from — it operates only on `GraphNodeRef` tuples and `GraphEdge` weights.

## BFS Algorithm (`core/bfs.ts`)

```
bfsHeterogeneous(adjacency, opts) -> BfsPath[]
```

### Key Design Choices

**Parent-pointer reconstruction** — paths are rebuilt by walking the `parent` chain from the found terminal state, eliminating the O(n) array spread that existed in the previous `smartPathfindingService` on every BFS step.

**Per-depth visited cache** — a node can be visited at depth N once. If a shorter path to the same node was already found at depth < N, the current branch is pruned. This allows diverse paths through popular hub nodes (e.g., a large company) without revisiting the same node at the same depth wastefully.

**Parallel frontier expansion** — all nodes at the current BFS depth are expanded in parallel via `Promise.all`. Adapter fan-out is bounded internally so this does not blow up memory.

**Wall-clock timeout** — configurable `timeoutMs` (default 8 seconds) aborts runaway searches before they exhaust the request lifecycle.

**Transit type filter** — `allowTransitNodeTypes` restricts which node types may appear as intermediate hops. The source and target are always exempt from this filter.

### Options

```typescript
interface BfsOptions {
  source: GraphNodeRef;
  target: GraphNodeRef | ((n: GraphNodeRef) => boolean);
  maxDepth?: number;         // default 5
  maxPaths?: number;         // default 10
  allowTransitNodeTypes?: NodeType[];
  timeoutMs?: number;        // default 8000
}
```

`target` can be a predicate function to support "find any company in this industry" style searches.

## AdjacencyService (`core/AdjacencyService.ts`)

Coordinates adapter fan-out. For each node being expanded, it calls all registered adapters and merges their edge lists. Adapters handle their own batching and caching to prevent N+1 queries.

## Adapters

Each adapter knows how to expand one or more node types into outgoing `GraphEdge` objects.

| Adapter | Source Node Types | Edge Kind | Notes |
|---------|------------------|-----------|-------|
| `personalConnectionAdapter` | user, contact | `personal-contact` | Reads from `Connection` collection; owner-scoped warmth/trust/recency |
| `employmentAdapter` | user, contact, company, branch | `employment` | Emits `EMPLOYED_AT`, `REPRESENTS`, `REPRESENTED_BY`, `BRANCH_OF` relations |
| `companyRelAdapter` | company | `company-rel` | Reads `CompanyRelationship`; handles bidirectional types |
| `knowledgeEdgeAdapter` | all | `knowledge` | Generic escape hatch for new entity types |
| `userLinkAdapter` | user, contact | `personal-contact` | Cross-ref between User and Contact nodes that share an identity |

## Edge Scoring (`scoring/edgeScoring.ts`)

Single unified scorer replacing the previously divergent local vs smart scoring systems. All edge kinds return a value on the 0–100 scale.

### Personal Contact Scoring

```
warmth = calculateWarmthDecay(rawWarmth, lastInteractionAt)
trust  = metadata.trustScore ?? 50
recency = calculateRecencyScore(lastInteractionAt)
score  = calculateEdgeScore(warmth, trust, recency, 50)
```

`calculateWarmthDecay` was previously defined in `graphUtils.ts` but never called. It is now wired in here.

### Employment Scoring

**REPRESENTS / REPRESENTED_BY** (when `isRepresentative = true`):
- Tier 0: falls through to regular employment math, max 90
- Tier 1 (email-verified): 95 current, 70 past
- Tier 2 (doc/vouch-verified): 100 current, 75 past

**BRANCH_OF**: flat 95 (near-free structural hop)

**EMPLOYED_AT** (regular employees):
- Base: 100 (current) or 70→20 decaying by months since end date
- Tenure bonus: up to +25 (5 points per year, capped)
- Seniority lift: 0 (intern) → 25 (founder / c-level)
- Company-admin verified bonus: +10
- Multiplied by `provenance.confidence`
- Hard cap at `EMPLOYMENT_MAX = 90` — always strictly below structural edges

### Company Relationship Scoring

```
score = base[type] × strength × recencyMultiplier
```

`recencyMultiplier` decays from 1.0 to 0.3 if the relationship has ended (5% per month, floored at 0.3).

### Knowledge Edge Scoring

```
score = rawWeight × confidence
```

## Path Scoring (`scoring/pathScoring.ts`)

Overall path likeliness is computed from the edge sequence using `GraphUtils.calculatePathLikeliness`. A single weak edge in the chain significantly reduces the overall score, which is the intended behavior — the system should prefer short paths with consistently warm edges over long paths with one very hot edge.

## Performance Notes

- O(n) `Array.shift()` in the old code is eliminated — BFS uses array indices with `frontier` / `nextFrontier` level-swapping
- Adapter-level batching prevents N+1 MongoDB queries during fan-out
- Parent-pointer reconstruction is O(depth), not O(path_count × depth)