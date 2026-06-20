
# Project Overview

This project is a modern, enterprise-grade community platform inspired by BlackHatWorld.

The goal is NOT to build a simple forum.

The goal is to build a scalable community ecosystem that combines:

* Forum
* Marketplace
* Reputation System
* Trust System
* Private Messaging
* Premium Memberships
* Notifications
* Search
* Moderation
* AI Features

The platform must support millions of users, millions of posts, and large-scale marketplace activity.

---

# Project Status

Current Completed Phases:

✅ Phase 0 — Foundation

✅ Phase 1 — Authentication & Users

✅ Phase 2 — Forum Structure

✅ Phase 3 — Thread Engine

✅ Phase 4 — Post & Reply Engine

✅ Phase 5 — TipTap + Media + Attachments

✅ Phase 6 — Quotes + Mentions + Post References

✅ Phase 7 — Reactions + Reputation + Badges + Trophies

Future Phases:

⬜ Phase 8 — Notifications + Realtime

⬜ Phase 9 — Private Messaging

⬜ Phase 10 — Search Engine

⬜ Phase 11 — Marketplace Core

⬜ Phase 12 — Marketplace Moderation

⬜ Phase 13 — Premium Memberships

⬜ Phase 14 — Admin Control Center

⬜ Phase 15 — AI Features

⬜ Phase 16 — Performance & Scaling

⬜ Phase 17 — Production Launch

---

# Core Technology Stack

Frontend:

* Next.js 16
* React 19
* TypeScript

UI:

* Tailwind CSS v4
* Shadcn UI
* Radix UI
* Framer Motion

Authentication:

* Auth.js v5

Database:

* PostgreSQL

ORM:

* Drizzle ORM

Storage:

* Cloudflare R2

Cache:

* Redis

Search:

* Typesense

Editor:

* TipTap

Validation:

* Zod

Forms:

* React Hook Form

State Management:

* Zustand

Monitoring:

* OpenTelemetry
* Sentry

Deployment:

* Docker
* Coolify
* Cloudflare

---

# Architecture Rules

Always follow:

* Feature-Based Architecture
* Clean Architecture
* Domain Separation
* Modular Design
* Strict TypeScript

Never create:

* Monolithic services
* Massive utility files
* Business logic inside UI components
* Database queries inside React components

---

# Next.js Rules

Use:

* App Router
* React 19
* Server Components by default
* Server Actions for mutations
* Route Handlers when APIs are required
* generateMetadata()
* Dynamic Metadata
* Turbopack
* next.config.ts
* instrumentation.ts

Prefer:

* Server Components
* Streaming
* Suspense
* Partial Prerendering

Avoid:

* Pages Router
* getServerSideProps
* getStaticProps
* Redux
* Legacy API architecture

---

# Folder Structure

src/

app/
modules/
components/
actions/
services/
repositories/
db/
providers/
stores/
hooks/
lib/
types/
constants/
config/
validations/

Never break this structure.

---

# Coding Standards

Always:

* Use TypeScript strict mode
* Use absolute imports (@/*)
* Use ESLint
* Use Prettier
* Use descriptive naming
* Create reusable components
* Write maintainable code

Avoid:

* any types
* deeply nested logic
* duplicated code
* large components

---

# Database Rules

Database:

PostgreSQL

ORM:

Drizzle ORM

Requirements:

* Proper indexes
* Foreign keys
* Transactions
* Soft deletes where needed

Never:

* Use Prisma
* Use MongoDB
* Use unindexed queries

---

# Authentication Rules

Use:

Auth.js v5

Roles:

* GUEST
* MEMBER
* VIP
* SELLER
* MODERATOR
* ADMIN
* SUPER_ADMIN

All sensitive actions must be protected.

Never trust client-side role checks.

---

# UI Guidelines

Reference Inspiration:

* BlackHatWorld
* aitmpl.com
* skills.sh
* skillhub.club

Goal:

Keep all logic from BlackHatWorld.

Improve the UI significantly.

Requirements:

* Modern
* Clean
* Fast
* Mobile First
* Accessible
* Premium Feeling

Support:

* Light Mode
* Dark Mode
* System Theme

---

# Forum Hierarchy

Category

→ Forum

→ Subforum

→ Thread

→ Post

Never violate this hierarchy.

---

# Thread Rules

Threads support:

* Tags
* Watch
* Bookmark
* Moderation
* Drafts

Thread URLs:

/forums/[categorySlug]/[forumSlug]/[threadSlug]

---

# Post Rules

Posts support:

* Rich Content
* Attachments
* Quotes
* Mentions
* References

Post numbering must be sequential.

Example:

Post #1

Post #2

Post #3

---

# Content Rules

Editor:

TipTap

Store:

JSON

Never store editor content as HTML.

Reason:

Future support for:

* Quotes
* Mentions
* AI
* Search

---

# Reputation Rules

Everything reputation-related must use:

ReputationTransaction

Never directly modify reputation totals.

All future systems must reuse:

* Reputation Engine
* Trust Engine

Including:

* Marketplace Reviews
* Seller Ratings
* iTrader
* Badges
* Trophies

---

# Event System

Every important action must generate events.

Examples:

THREAD_CREATED

POST_CREATED

QUOTE_CREATED

MENTION_CREATED

REACTION_CREATED

BADGE_EARNED

TROPHY_UNLOCKED

These events will power:

* Notifications
* Realtime
* Analytics

---

# Security Rules

Always:

* Validate using Zod
* Sanitize user input
* Use Server Actions
* Protect uploads
* Use RBAC

Never:

* Trust client input
* Expose secrets
* Skip validation

---

# Performance Rules

Target:

Millions of users.

Use:

* Server Components
* Redis Cache
* Pagination
* Optimized Queries
* Lazy Loading

Avoid:

* N+1 Queries
* Overfetching
* Client-side data fetching when unnecessary

---

# Marketplace Vision

Marketplace is a first-class system.

Future features:

* Seller Profiles
* Listings
* Reviews
* iTrader
* Approval Queue
* Moderator Review
* Escrow Support

Design current code so Marketplace can integrate without refactoring.

---

# Notification Vision

Notifications will support:

* Replies
* Quotes
* Mentions
* Reactions
* Messages
* Marketplace Events

All notification data must come from Event architecture.

---

# AI Features Roadmap

Future:

* AI Spam Detection
* AI Scam Detection
* AI Moderation
* AI Thread Summary
* AI Auto Tagging
* AI Search Assistant

Design data structures with AI compatibility in mind.

---

# When Generating Code

Always:

1. Review existing architecture.
2. Reuse existing services.
3. Reuse existing database models.
4. Reuse event system.
5. Reuse RBAC.
6. Reuse validation schemas.
7. Follow project folder structure.
8. Keep code production-ready.

Never introduce conflicting patterns.

This codebase must remain scalable, maintainable, and enterprise-grade.
