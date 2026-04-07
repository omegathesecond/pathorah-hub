# Git Workflow

## Branch Strategy

- `main` — production-ready code, always deployable
- Feature branches off `main`, merged via PR

## Commit Conventions

Follows conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `security:`

## Key Commits Reference

| Commit | Repo | Description |
|--------|------|-------------|
| `2ed33de` | pathorah-api | Heterogeneous graph — Companies, Branches, Knowledge Graph, pathfinding refactor |
| `897ccb6` | pathorah-api | Tiered representative verification (security fix) |
| `2cf1476` | pathorah-dashboard | Dashboard pages for companies, branches, employment editor |
| `7129731` | pathorah-dashboard | Representative verification flow UI, admin review page |
| `f1547b9` | pathorah-ai | AI enrichment expanded to company entities |

## Regression Tests

Pathfinding regression tests live in `pathorah-api/src/scripts/verifyPathfinding.ts`. Run against a live dev database. 19/19 tests passing as of 2026-04-07, including Test 5b (representative tier ordering and cap verification).