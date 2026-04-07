---
layout: home

hero:
  name: Pathorah
  text: Warm Introductions Through Your Network
  tagline: Professional networking platform that finds the shortest verified path between you and anyone you need to reach — through people and companies you already know.
  actions:
    - theme: brand
      text: View Product
      link: /product/
    - theme: alt
      text: API Reference
      link: /product/technical/api

features:
  - icon: "🔗"
    title: Heterogeneous Graph
    details: Users, Contacts, Companies, and Branches are all first-class peer nodes. Find paths through any combination of people and organizations.
    link: /product/features/heterogeneous-graph
  - icon: "🛡️"
    title: Representative Verification
    details: Tiered trust ladder ensures a self-declared founder claim never inflates pathfinding scores. Three verification paths — email domain OTP, document review, or peer vouching.
    link: /product/features/representative-verification
  - icon: "🤖"
    title: AI Enrichment
    details: Gemini-powered enrichment suggests industries, capabilities, products, markets, certifications, and all 8 company relationship types from company profiles.
    link: /product/technical/architecture
---

## Quick Stats

| Metric | Value |
|--------|-------|
| Primary Stack | Express / TypeScript, Python / FastAPI, React, Flutter |
| Database | MongoDB (Mongoose ODM) |
| AI Service | Gemini (Google) |
| Node Types | User, Contact, Company, Branch |
| Edge Kinds | personal-contact, employment, company-rel, knowledge |
| Status | Active Development |

## Recent Updates

### 2026-04-07 — Heterogeneous Graph + Tiered Representative Verification

Two major milestones shipped in a single release cycle:

**Companies, Branches & Knowledge Graph** — Pathorah expanded from a person-only warm-introduction platform into a full heterogeneous graph. Companies and Branches are now first-class peer nodes alongside Users and Contacts. The 1,400-line monolithic pathfinding codebase was refactored into a clean adapter/core/scoring split. The long-dormant `calculateWarmthDecay` function is finally wired in.

**Tiered Representative Verification** — Closes the self-declaration exploit where anyone could tick "IS the company" on an Employment row and bend pathfinding scores in their favor. A three-tier trust ladder (self-declared / email-verified / document-or-vouched) gates the structural scoring boost behind real proof of identity.

[View full changelog](/development/changelog)