# Business Model

<!-- MANUAL START -->
Business model details to be documented.
<!-- MANUAL END -->

## What Exists in the Codebase

The platform has a working implementation of:

- **Subscription tiers** — `UserSubscription` model with tier-based monthly credit replenishment and max path depth limits. Loaded via `loadSubscription` middleware before pathfinding routes.
- **Credit system** — `CreditTransaction` ledger, `UserCredits` balance. Path searches deduct credits; bulk purchase and subscription replenishment add credits. Enforced via `checkCredits` middleware.
- **Usage limits** — `checkUsageLimit` and `warnApproachingLimit` middleware on pathfinding routes.
- **Pricing config** — `PricingConfig` model for runtime pricing adjustments without deploys.