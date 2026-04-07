# Backlog

## Known Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Pathfinding regression test suite expansion | Medium | Test 5b proves tier ordering; need broader coverage of company-rel and knowledge edge paths |
| Adapter-level result caching | Medium | Popular company nodes get re-expanded every search; Redis cache would help at scale |
| KnowledgeEdge population via AI enrichment | Low | `POST /enrich/company` suggests relationships but does not auto-create KnowledgeEdge rows; currently requires manual action |
| Mobile app company/branch targets | High | `targetType` + `targetId` added to API but mobile app still uses legacy person-only flow |
| Backfill cluster review UI | Low | `CompanyMergeReviewPage` exists but admin workflow for residual unmatched clusters is manual |

## Feature Requests

| Feature | Status |
|---------|--------|
| Circle features — group pathfinding | In progress |
| Analytics dashboard | In progress |
| Public partner API | Planned Q3 2026 |
| Bulk CSV import | Planned Q3 2026 |
| Graph export (Gephi, Neo4j) | Planned |
| Two-way contact sync (Google Contacts, LinkedIn) | Under consideration |
| Webhook support for introduction request events | Under consideration |