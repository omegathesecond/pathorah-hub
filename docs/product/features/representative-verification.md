# Representative Verification

**Shipped: 2026-04-07** — commits 897ccb6 / 7129731 (security fix)

## The Problem

After the heterogeneous graph launched, anyone could tick `isRepresentative = true` on an Employment row and claim to be the founder/principal of any company. Because the BFS treated all `REPRESENTS` edges as near-structural (high score), a self-declared founder of Vodacom would bend pathfinding results in their favor. This was a security and trust issue.

## The Solution: Tiered Trust Ladder

Representative status now has three tiers. The structural scoring boost only activates at tier 1 and above.

| Tier | Name | How Achieved | Edge Score |
|------|------|-------------|-----------|
| 0 | Self-declared | Default; anyone can set `isRepresentative = true` | Capped at 90 (regular employment ceiling) |
| 1 | Email-verified | Proved control of an address at `Company.domain` via OTP | 95 (current), 70 (past) |
| 2 | Document-verified or Vouched | Admin approves document OR existing tier-2 rep vouches | 100 (current), 75+ (past); `Company.verified = true` |

### Tier 0 Detail

The `isRepresentative` flag still exists for UI labeling ("claimed founder") but `edgeScoring.ts` detects tier 0 and falls through to regular employment math — the same formula used for any employee, capped hard at `EMPLOYMENT_MAX = 90`. This means tier 0 is strictly dominated by any verified representative.

### Tier 1: Email OTP

1. User calls `POST /api/employments/:id/representative/email/start` with a company-domain email address
2. Service validates:
   - Email domain matches `Company.domain` (subdomains accepted)
   - Domain is not a free-mail provider (gmail, yahoo, hotmail, etc.)
3. A 6-digit cryptographically random OTP is generated, sha256-hashed, and stored with a 15-minute TTL and 5-attempt lockout. The hash is stored with `select: false` so it never leaks through `populate()` calls.
4. OTP is sent via `emailService.sendEmailVerificationEmail` (YeboLink-backed)
5. User calls `POST /api/employments/:id/representative/email/confirm` with the OTP
6. On success, `representativeTier` flips to 1 — written only by `representativeVerificationService`, never via the regular PATCH endpoint

### Tier 2: Document Verification

1. User calls `POST /api/employments/:id/representative/document` with a URL to an uploaded proof document (registration certificate, CIPC filing, board resolution, etc.)
2. Row status becomes `representativeDocumentReviewStatus = 'pending'`
3. Admin queue: `GET /api/employments/representative/pending`
4. Admin calls `POST /api/employments/:id/representative/review` with `approved` or `rejected`
5. On approval, `representativeTier` flips to 2 and `Company.verified = true`

### Tier 2: Vouching

1. User calls `POST /api/employments/:id/representative/vouch` referencing their own Employment ID
2. Service checks the voucher is a tier-2 representative of the same company (prevents mutual-email chains)
3. Self-vouching is blocked
4. Bootstrap immunity: the first representative of any company cannot be vouched in — they must use email or document path

## Enforcement in Edge Scoring

```typescript
// edgeScoring.ts (simplified)
if (md.isRepresentative || edge.relation === 'REPRESENTS' || edge.relation === 'REPRESENTED_BY') {
  const tier = md.representativeTier ?? 0;
  if (tier >= 1) {
    const ceiling = tier === 2 ? 100 : 95;
    const base = isCurrent ? ceiling : Math.max(70, ceiling - 25);
    return clamp(base * confidence);
  }
  // tier 0 — fall through to regular employment scoring
}
// ... regular employment math, capped at EMPLOYMENT_MAX = 90
return Math.min(EMPLOYMENT_MAX, clamp(base));
```

This ensures: `tier_0 < tier_1 < tier_2` monotonically, and tier 0 is always strictly below the structural floor.

## Regression Tests

19/19 tests pass in `verifyPathfinding.ts`, including **Test 5b** which specifically asserts:
- tier 0 score < tier 1 score < tier 2 score
- tier 0 score is capped at `EMPLOYMENT_MAX` (90)
- tier 2 scores at 100 for a current representative with full confidence

## Dashboard Components

- `RepresentativeVerificationFlow.tsx` — inline component rendered after creating a representative employment. Shows all three verification methods. Tier-1 users see their verified email and an upgrade prompt. Tier-2 users see a green "Verified Representative" badge.
- `/companies/representative-review` — admin page listing pending document submissions with approve/reject actions.

## Security Properties

- `representativeEmailOtpHash` stored with `select: false` — cannot leak via any populate/query that doesn't explicitly `.select('+representativeEmailOtpHash')`
- OTP is 6 digits from `crypto.randomInt` (not `Math.random`)
- Free-mail providers rejected at the domain check level, not just the OTP level
- `representativeTier` is not in the `PATCH /employments/:id` allowlist — can only be written via `representativeVerificationService`
- Voucher must be tier 2 of the same company; no cross-company vouching