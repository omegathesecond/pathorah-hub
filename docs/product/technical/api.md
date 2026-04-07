# API Reference

Base URL: `https://api.pathorah.com`

All endpoints require `Authorization: Bearer <token>` unless marked public.

## Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns access + refresh tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

## Pathfinding

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| POST | `/api/paths/find` | Find warm introduction paths | Consumes credits; rate limited |
| GET | `/api/paths` | List saved/recent paths | |

### `POST /api/paths/find` — Polymorphic Target Support

```json
{
  "targetType": "company",
  "targetId": "<companyId>",
  "allowTransitNodeTypes": ["user", "contact", "company"],
  "maxDepth": 5,
  "maxPaths": 5
}
```

Legacy person-only fields (`targetName`, `targetEmail`, `targetContactId`, `targetFilters`) remain supported.

## Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=&types=user,contact,company,branch` | Unified polymorphic search |

Returns Users, Contacts, Companies, and Branches from a single query. Filter by `types` to narrow results.

## Companies

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/companies` | List companies (paginated, filterable) | Required |
| GET | `/api/companies/:id` | Get company profile | Required |
| POST | `/api/companies` | Create company | Required |
| PATCH | `/api/companies/:id` | Update company | Company admin |
| DELETE | `/api/companies/:id` | Delete company | Global admin |
| GET | `/api/companies/:id/employees` | List current employees | Required |
| GET | `/api/companies/:id/branches` | List branches | Required |
| GET | `/api/companies/:id/relationships` | List company relationships | Required |
| POST | `/api/companies/:id/merge` | Merge duplicate company into this one | Global admin |

## Branches

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/branches` | List branches |
| GET | `/api/branches/:id` | Get branch |
| POST | `/api/branches` | Create branch (company admin required) |
| PATCH | `/api/branches/:id` | Update branch |
| DELETE | `/api/branches/:id` | Delete branch |

## Employments

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/employments` | Create employment record | Required |
| PATCH | `/api/employments/:id` | Update employment (allowlisted fields only) | Required |
| DELETE | `/api/employments/:id` | Delete employment | Required |
| POST | `/api/employments/:id/verify` | Company admin verifies an employment | Company admin |
| GET | `/api/employments/users/:id` | List employments for a user | Required |
| GET | `/api/employments/contacts/:id` | List employments for a contact | Required |

### Representative Verification Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/employments/:id/representative/email/start` | Send domain OTP to claimant's company-domain email | Required |
| POST | `/api/employments/:id/representative/email/confirm` | Confirm OTP, upgrade to tier 1 | Required |
| POST | `/api/employments/:id/representative/document` | Submit proof document URL for admin review | Required |
| POST | `/api/employments/:id/representative/vouch` | Vouch for a claim (voucher must be tier-2 same company) | Required |
| GET | `/api/employments/representative/pending` | List pending document review queue | Global admin |
| POST | `/api/employments/:id/representative/review` | Approve or reject a document submission | Global admin |

## Company Relationships

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/company-relationships` | List relationships |
| POST | `/api/company-relationships` | Create relationship |
| PATCH | `/api/company-relationships/:id` | Update relationship |
| DELETE | `/api/company-relationships/:id` | Delete relationship |

Relationship types: `PARTNERS_WITH`, `SUPPLIES`, `CUSTOMER_OF`, `COMPETES_WITH`, `ACQUIRED`, `INVESTED_IN`, `SUBSIDIARY_OF`, `JV_WITH`

## Knowledge Edges

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knowledge-edges` | List knowledge edges |
| POST | `/api/knowledge-edges` | Create knowledge edge |
| PATCH | `/api/knowledge-edges/:id` | Update knowledge edge |
| DELETE | `/api/knowledge-edges/:id` | Delete knowledge edge |

## Taxonomy (tag collections)

| Method | Path |
|--------|------|
| GET/POST | `/api/industries` |
| GET/POST | `/api/capabilities` |
| GET/POST | `/api/products` |
| GET/POST | `/api/markets` |
| GET/POST | `/api/certifications` |

## Contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/:id` | Get contact |
| PATCH | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |

## Introduction Requests

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/introductions` | Create introduction request |
| GET | `/api/introductions` | List requests |
| PATCH | `/api/introductions/:id` | Accept / decline / forward |

## Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/:id` | Get public user profile |

## Subscriptions & Credits

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscriptions/plans` | List subscription plans |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/credits` | Get credit balance |
| POST | `/api/credits/purchase` | Purchase credits |

## AI Service Endpoints

Base URL: separate FastAPI service

| Method | Path | Description |
|--------|------|-------------|
| POST | `/enrich/company` | Gemini enrichment for a company profile |
| POST | `/enrich/user` | Gemini enrichment for a user profile |
| POST | `/enrich/contact` | Gemini enrichment for a contact |
| GET | `/health` | Health check |