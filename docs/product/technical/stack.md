# Tech Stack

## API (`pathorah-api`)

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 4 |
| Language | TypeScript |
| ODM | Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod (via `validateRequest` / `validateQuery` middleware) |
| Email | YeboLink-backed `emailService` |
| Notifications | Omevision shared notification service (WhatsApp / SMS) |
| Crypto | Node.js built-in `crypto` (OTP generation + hashing) |

## AI Service (`pathorah-ai`)

| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.x |
| Framework | FastAPI |
| AI | Gemini (Google) |
| Hosting | Cloud Run |

## Dashboard (`pathorah-dashboard`)

| Layer | Technology |
|-------|-----------|
| Framework | React |
| Language | TypeScript |
| Hosting | Cloudflare Pages |
| State | TBD (context / zustand) |

## Mobile

| Layer | Technology |
|-------|-----------|
| Framework | Flutter |
| Platforms | iOS, Android |

## Infrastructure

| Component | Technology |
|-----------|-----------|
| API Hosting | Cloud Run (GCP) |
| Database | MongoDB Atlas |
| Frontend Hosting | Cloudflare Pages |
| CI/CD | Cloud Build |
| Secret Management | GCP Secret Manager |

## Domains

| Environment | URL |
|-------------|-----|
| Production API | `api.pathorah.com` |
| Dev API | `dev-api.pathorah.com` |
| Dashboard | Cloudflare Pages URL |