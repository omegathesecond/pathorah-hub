# Data Models

All models use Mongoose ODM on MongoDB Atlas.

## Core Graph Nodes

### User

Registered Pathorah accounts. The `user` node type in the graph. Has warmth/trust connections to other Users and Contacts, Employment records to Companies/Branches, and personal connections.

### Contact

People in a user's address book. May or may not be registered Pathorah users. The `contact` node type. Participates in the graph identically to Users — Employment, connections, and all edge types apply.

### Company

```
Company {
  name: string (required)
  slug: string (unique, lowercase, indexed)
  aliases: string[] (indexed — historical names from backfill)
  legalName?: string
  domain?: string (sparse indexed — used for representative email OTP)
  description?: string
  logoUrl, coverUrl, website?: string
  headquarters: { country, region, city, coords: [lng, lat] (2dsphere) }
  foundedYear?: number
  sizeBucket?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+'
  industries: ObjectId[] -> Industry
  capabilities: ObjectId[] -> Capability
  products: ObjectId[] -> Product
  markets: ObjectId[] -> Market
  certifications: ObjectId[] -> Certification
  verified: boolean (true when first tier-2 rep is confirmed)
  claimedByUserId?: ObjectId -> User
  source: 'user-claimed' | 'backfill' | 'admin' | 'enrichment'
}
```

Text index: `name + aliases + description`.

### Branch

```
Branch {
  companyId: ObjectId -> Company (required, indexed)
  name: string (required)
  slug: string (unique per company)
  kind: 'headquarters' | 'office' | 'store' | 'factory' | 'warehouse' | 'virtual'
  location: { country, region, city, address, coords: [lng, lat] (2dsphere) }
  timezone?: string
  phone, email?: string
  managerUserId?: ObjectId -> User
  parentBranchId?: ObjectId -> Branch (for branch hierarchies)
  isActive: boolean
}
```

## Edge Models

### Employment

Links a person (User or Contact — exactly one, enforced by pre-validate hook) to a company (Company) or branch (Branch).

```
Employment {
  userId?: ObjectId -> User    (XOR with contactId)
  contactId?: ObjectId -> Contact
  companyId: ObjectId -> Company (required)
  branchId?: ObjectId -> Branch

  title, department?: string
  seniority?: 'intern'|'junior'|'mid'|'senior'|'lead'|'manager'|'director'|'vp'|'c-level'|'founder'
  employmentType?: 'full-time'|'part-time'|'contract'|'advisor'|'board'|'intern'

  startDate: Date (required)
  endDate?: Date
  isCurrent: boolean (auto-set false when endDate is given)

  isCompanyAdmin: boolean          -- permissions concept: can edit company page
  isRepresentative: boolean        -- graph concept: person IS the company

  representativeTier: 0 | 1 | 2   -- verification level; 0 = self-declared (no boost)
  representativeVerifiedAt?: Date
  representativeVerifiedByMethod?: 'email' | 'document' | 'vouch' | 'admin'
  representativeVerifiedByUserId?: ObjectId -> User

  representativeEmailOtpHash?: string (select: false — never returned by queries)
  representativeEmailOtpExpiresAt?: Date (select: false)
  representativeEmailAddress?: string
  representativeEmailAttempts?: number

  representativeDocumentUrl?: string
  representativeDocumentReviewStatus?: 'pending' | 'approved' | 'rejected'
  representativeDocumentReviewNote?: string

  source: 'self-declared'|'company-verified'|'imported'|'inferred'|'backfill'
  confidence: number (0-1)
  verifiedByCompanyAdmin: boolean
}
```

Unique indexes: `(userId, companyId, startDate)` partial; `(contactId, companyId, startDate)` partial.

### CompanyRelationship

```
CompanyRelationship {
  fromCompanyId: ObjectId -> Company (required)
  toCompanyId: ObjectId -> Company (required, validated ≠ fromCompanyId)
  type: 'PARTNERS_WITH'|'SUPPLIES'|'CUSTOMER_OF'|'COMPETES_WITH'|'ACQUIRED'|'INVESTED_IN'|'SUBSIDIARY_OF'|'JV_WITH'
  direction: 'directed' | 'undirected'
  strength: number (0-1)
  startDate, endDate?: Date
  isActive: boolean
  evidenceUrls: string[]
  source?: 'user'|'admin'|'enrichment'|'public'
  createdByUserId?: ObjectId -> User
}
```

Unique on `(fromCompanyId, toCompanyId, type, startDate)`.

### KnowledgeEdge

Generic edge for future entity types and AI-enrichment relationships.

```
KnowledgeEdge {
  fromType: EntityType  -- 'user'|'contact'|'company'|'branch'|'industry'|'capability'|'product'|'market'|'certification'
  fromId: ObjectId
  toType: EntityType
  toId: ObjectId
  relation: string      -- arbitrary label, e.g. 'HAS_INDUSTRY', 'SERVES_MARKET'
  weight: number
  metadata?: object
  source?: string
  confidence?: number
  isActive: boolean
}
```

## Taxonomy Collections

Tag collections used to enrich Company profiles. All follow the same simple schema `{ name, slug, description? }`.

| Collection | Model |
|-----------|-------|
| `industries` | Industry |
| `capabilities` | Capability |
| `products` | Product |
| `markets` | Market |
| `certifications` | Certification |

## Other Models

| Model | Purpose |
|-------|---------|
| `Connection` | Personal connection between two persons with warmth/trust/recency signals |
| `ConnectionType` | User-defined relationship labels |
| `IntroductionRequest` | A warm intro request along a found path |
| `Path` | Saved/cached path result |
| `Notification` | In-app notifications |
| `Message` / `Conversation` | Messaging between users |
| `Post` / `Comment` | Social feed |
| `UserSubscription` | Subscription tier record |
| `CreditTransaction` | Credit debit/credit ledger |
| `UserReputation` | Reputation signals |
| `Circle` | Group/team pathfinding scope |
| `Report` / `GeneratedReport` | Admin reporting |
| `IntelligenceAlert` | AI-generated network alerts |
| `RefreshToken` | Auth refresh token store |
| `PasswordReset` | Password reset tokens |
| `EmailVerification` | Email verification tokens |
| `PricingConfig` | Runtime pricing configuration |
| `LandingContent` / `LandingPageStats` | CMS content for the landing page |
| `BlockedUser` | Safety block list |
| `Agent` | Automated agent configurations |