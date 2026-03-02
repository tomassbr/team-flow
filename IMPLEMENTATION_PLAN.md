# Smart Office Access – Technical Implementation Plan

Based on: `PROJECT_SPEC.md` (Smart Office Access – Authenticated Application Specification)

---

## Implementation Phases Overview

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| **Phase 1** | Foundation | Database, Auth, Company setup |
| **Phase 2** | Core Product | Desks, Reservations, Dashboard |
| **Phase 3** | Plan Enforcement | Middleware, limits, feature gating |
| **Phase 4** | PRO Features | QR check-in, stats, branding |
| **Phase 5** | Polish & Deploy | UI refinement, deployment |

---

## Layer 1: Database

| # | Task | Phase | Notes |
|---|------|-------|------|
| 1.1 | Create Prisma schema with Company model (id, name, plan, maxDesks, maxUsers, primaryColor, logoUrl, checkInLimitMinutes) | 1 | Use UUID for id |
| 1.2 | Add User model (id, email, name, role, companyId) with unique email | 1 | FK to Company |
| 1.3 | Add Desk model (id, name, companyId, qrToken, isActive) | 1 | FK to Company |
| 1.4 | Add Reservation model (id, companyId, userId, deskId, date, status, checkInAt) | 1 | FKs to Company, User, Desk |
| 1.5 | Add unique constraints: (deskId, date) and (userId, date) on Reservation | 1 | Prevent double-booking |
| 1.6 | Add indexes for companyId on all tenant-scoped models | 1 | Query performance |
| 1.7 | Run initial migration | 1 | PostgreSQL |
| 1.8 | Seed script for development (optional) | 1 | Test data |

---

## Layer 2: Authentication

| # | Task | Phase | Notes |
|---|------|-------|------|
| 2.1 | Install and configure Auth.js (NextAuth) | 1 | |
| 2.2 | Configure Google OAuth provider | 1 | MVP: Google only |
| 2.3 | Define session callback to include userId, companyId, role | 1 | Required for middleware |
| 2.4 | Create Prisma adapter for Auth.js | 1 | Link Auth.js to User model |
| 2.5 | Implement GET /api/auth/session | 1 | Per API contract |
| 2.6 | Create auth middleware for protected routes | 1 | Reject unauthenticated |
| 2.7 | Implement login page (/login) | 1 | Google sign-in |
| 2.8 | Implement onboarding flow (/onboarding) | 1 | First user creates company, becomes ADMIN |
| 2.9 | Handle first-user-becomes-ADMIN logic | 1 | In onboarding or user creation |

---

## Layer 3: Core Logic

| # | Task | Phase | Notes |
|---|------|-------|------|
| 3.1 | Company creation logic (set plan=FREE, maxDesks, maxUsers from plan) | 1 | Default limits for FREE |
| 3.2 | Desk reservation logic: validate plan limits | 2 | Check company.maxDesks |
| 3.3 | Desk reservation logic: validate no existing reservation for user+date | 2 | Unique(userId, date) |
| 3.4 | Desk reservation logic: validate desk free for date | 2 | Unique(deskId, date) |
| 3.5 | Desk reservation logic: create reservation in transaction (status=RESERVED) | 2 | Atomic |
| 3.6 | QR check-in logic: validate PRO plan | 4 | Reject if FREE |
| 3.7 | QR check-in logic: validate desk exists, reservation exists, status=RESERVED | 4 | |
| 3.8 | QR check-in logic: update status→CONFIRMED, checkInAt→now | 4 | |
| 3.9 | Auto-release job: query RESERVED + today + past checkInLimitMinutes | 4 | Cron every 5 min |
| 3.10 | Auto-release job: update status→RELEASED | 4 | No deletion |
| 3.11 | Plan limit helpers (maxDesks, maxUsers) | 3 | Used by API and middleware |

---

## Layer 4: API

| # | Task | Phase | Notes |
|---|------|-------|------|
| 4.1 | Auth middleware: require authenticated user on all app routes | 1 | |
| 4.2 | Tenant middleware: require user.companyId === resource.companyId | 1 | Strict multitenancy |
| 4.3 | POST /api/company | 1 | Create company (onboarding) |
| 4.4 | GET /api/company | 1 | Fetch current company |
| 4.5 | PATCH /api/company | 1 | Update company (branding gated by plan) |
| 4.6 | GET /api/users | 2 | List company users |
| 4.7 | POST /api/users | 2 | Invite/add user (respect maxUsers) |
| 4.8 | DELETE /api/users/:id | 2 | Remove user (tenant-scoped) |
| 4.9 | GET /api/desks | 2 | List company desks |
| 4.10 | POST /api/desks | 2 | Create desk (respect maxDesks) |
| 4.11 | PATCH /api/desks/:id | 2 | Update desk |
| 4.12 | DELETE /api/desks/:id | 2 | Delete desk |
| 4.13 | GET /api/reservations?date=YYYY-MM-DD | 2 | List reservations for date |
| 4.14 | POST /api/reservations | 2 | Create reservation (uses core logic) |
| 4.15 | DELETE /api/reservations/:id | 2 | Cancel reservation |
| 4.16 | POST /api/checkin/:qrToken | 4 | PRO only; uses QR check-in logic |
| 4.17 | GET /api/stats/usage | 4 | PRO only |
| 4.18 | GET /api/stats/noshow | 4 | PRO only |

---

## Layer 5: UI

| # | Task | Phase | Notes |
|---|------|-------|------|
| 5.1 | Create shared UI components (Card, Button, Badge, Modal, Grid, Input) | 1 | Per Figma MCP structure |
| 5.2 | Implement PublicLayout | 1 | Login, onboarding |
| 5.3 | Implement AppLayout (authenticated) | 2 | Dashboard, booking |
| 5.4 | Implement AdminGuard | 2 | Protect /admin |
| 5.5 | Login page (/login) | 1 | Google OAuth |
| 5.6 | Onboarding page (/onboarding) | 1 | Company creation, first user |
| 5.7 | Dashboard page (/dashboard) | 2 | Show desk availability, bookings |
| 5.8 | Booking page (/booking) | 2 | Book desk for date |
| 5.9 | Admin section (/admin) | 2 | Desks CRUD, users management |
| 5.10 | Settings page (/settings) | 2 | Company settings (branding gated) |
| 5.11 | Check-in page (/checkin/[token]) | 4 | PRO: QR scan landing |
| 5.12 | Connect UI to Figma components | 2–4 | Map names, use design tokens |
| 5.13 | Dashboard: show today's reservations | 2 | |
| 5.14 | Dashboard: show desk availability grid | 2 | |
| 5.15 | Plan-aware UI (hide/disable PRO features for FREE) | 3 | Do not trust frontend for enforcement |

---

## Layer 6: Plan Enforcement

| # | Task | Phase | Notes |
|---|------|-------|------|
| 6.1 | Plan middleware: load company plan for each request | 3 | |
| 6.2 | Enforce maxDesks on POST /api/desks | 3 | Reject if at limit |
| 6.3 | Enforce maxUsers on POST /api/users | 3 | Reject if at limit |
| 6.4 | Block POST /api/checkin/:qrToken for FREE | 3 | Return 403 |
| 6.5 | Block GET /api/stats/* for FREE | 3 | Return 403 |
| 6.6 | Block PATCH /api/company (branding fields) for FREE | 3 | primaryColor, logoUrl |
| 6.7 | Centralize plan checks in middleware/helpers | 3 | Single source of truth |
| 6.8 | Never trust frontend plan state | 3 | All checks in backend |

---

## Phase Summary

| Phase | Layers | Key Deliverables |
|-------|--------|------------------|
| **1** | DB, Auth, API (company), UI (login, onboarding) | User can log in, create company, first user is ADMIN |
| **2** | Core Logic, API (desks, reservations, users), UI (dashboard, booking, admin) | Full booking flow, desk management |
| **3** | Plan Enforcement, Core Logic (limits) | FREE vs PRO limits enforced |
| **4** | Core Logic (QR, auto-release), API (checkin, stats), UI (checkin) | PRO features live |
| **5** | UI, Deploy | Figma alignment, production deployment |

---

## Execution Order (Critical Path)

1. **Database** → Prisma schema and migration before any API work
2. **Authentication** → Auth required for all app routes
3. **Company + Onboarding** → User must belong to a company
4. **Desks CRUD** → Required before reservations
5. **Reservations** → Core product flow
6. **Plan Enforcement** → Before PRO features
7. **QR & Stats** → PRO-only features
8. **Deploy** → After MVP flow is stable
