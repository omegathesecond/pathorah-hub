# Deployment

## API Service (`pathorah-api`)

- Platform: Cloud Run (GCP)
- Build: Cloud Build (`cloudbuild.yaml`)
- Production: `api.pathorah.com`
- Dev: `dev-api.pathorah.com`
- GCP Project: see project memory reference
- Service Account: `org-master-admin@eneza-40ab5.iam.gserviceaccount.com`

## AI Service (`pathorah-ai`)

- Platform: Cloud Run (GCP)
- Separate Cloud Run service from the API
- Called by the API, not directly by clients

## Dashboard (`pathorah-dashboard`)

- Platform: Cloudflare Pages
- Automatic deploy on push to `main`
- Frontends are always Cloudflare Pages — never Cloud Run

## Mobile

- Distribution: TestFlight (iOS), Google Play (Android)
- Do not build or run the Flutter app without explicit request