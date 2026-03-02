# SMART OFFICE ACCESS – AUTHENTICATED APPLICATION SPECIFICATION

Version: 1.0  
Type: SaaS Web Application (Authenticated Product)  
Status: MVP Build Specification  

---

# 1. PRODUCT OVERVIEW

Smart Office Access is a multitenant SaaS web application for small hybrid teams (5–30 users).

The system enables:
- desk availability visibility
- desk booking
- QR-based check-in (PRO)
- automatic release of unused desks (PRO)
- simple workspace management
- plan-based feature enforcement (Free vs Pro)

This is NOT a marketing website.
This is the actual authenticated product.

---

# 2. CORE PRINCIPLES

1. Simplicity over abstraction.
2. Backend-enforced business rules.
3. Strict multitenancy.
4. Vertical feature delivery (end-to-end slices).
5. No overengineering.

---

# 3. TECH STACK (MANDATORY)

Frontend & Backend:
- Next.js (App Router)
- TypeScript
- REST API routes (within Next)

Database:
- PostgreSQL

ORM:
- Prisma

Authentication:
- Auth.js (Google OAuth only for MVP)

Styling:
- Tailwind CSS
- Reusable UI components

---

# 4. MULTITENANCY RULES

All business entities must include:

companyId

Every API route must validate:
- user authenticated
- user.companyId === resource.companyId

No cross-company access allowed.

Never trust frontend plan state.

---

# 5. DATA MODEL (PRISMA REQUIRED)

## 5.1 Company

Fields:
- id (UUID)
- name (string)
- plan (FREE | PRO)
- maxDesks (int)
- maxUsers (int)
- primaryColor (string, nullable)
- logoUrl (string, nullable)
- checkInLimitMinutes (int, default 20)
- createdAt
- updatedAt

---

## 5.2 User

Fields:
- id (UUID)
- email (unique)
- name
- role (ADMIN | MEMBER)
- companyId (FK)
- createdAt
- updatedAt

Rules:
- First registered user becomes ADMIN.
- Users cannot exist without company.

---

## 5.3 Desk

Fields:
- id (UUID)
- name (string)
- companyId (FK)
- qrToken (string, nullable)
- isActive (boolean, default true)
- createdAt
- updatedAt

Constraints:
- Desk count must respect plan limit.

---

## 5.4 Reservation

Fields:
- id (UUID)
- companyId (FK)
- userId (FK)
- deskId (FK)
- date (Date only)
- status (RESERVED | CONFIRMED | RELEASED)
- checkInAt (datetime, nullable)
- createdAt
- updatedAt

Constraints:
- Unique(deskId, date)
- Unique(userId, date)

---

# 6. BUSINESS LOGIC

## 6.1 Desk Reservation

Steps:
1. Validate plan limits.
2. Validate user has no reservation for same date.
3. Validate desk is not already reserved for same date.
4. Use database transaction.
5. Create reservation with status = RESERVED.

---

## 6.2 QR Check-In (PRO ONLY)

Endpoint:
POST /api/checkin/:qrToken

Validation:
- Company plan must be PRO.
- Desk exists.
- Reservation exists for current user and today.
- Status must be RESERVED.

On success:
- status → CONFIRMED
- checkInAt → now

---

## 6.3 Auto Release Job

Background job runs every 5 minutes.

Query:
- status = RESERVED
- date = today
- now > (start_of_day + checkInLimitMinutes)

Update:
- status → RELEASED

No deletion.

---

# 7. PLAN ENFORCEMENT

All enforcement must occur in backend middleware.

FREE:
- Enforce maxDesks
- Enforce maxUsers
- Disable QR endpoints
- Disable statistics endpoints
- Disable branding updates

PRO:
- Enable QR
- Enable statistics
- Enable branding
- Increased limits

---

# 8. API CONTRACT

## Auth
GET /api/auth/session

---

## Company
POST /api/company  
GET /api/company  
PATCH /api/company  

---

## Users
GET /api/users  
POST /api/users  
DELETE /api/users/:id  

---

## Desks
GET /api/desks  
POST /api/desks  
PATCH /api/desks/:id  
DELETE /api/desks/:id  

---

## Reservations
GET /api/reservations?date=YYYY-MM-DD  
POST /api/reservations  
DELETE /api/reservations/:id  

---

## Check-in
POST /api/checkin/:qrToken  

---

## Stats (PRO only)
GET /api/stats/usage  
GET /api/stats/noshow  

---

# 9. FRONTEND ROUTE STRUCTURE

/app
  /login
  /onboarding
  /dashboard
  /booking
  /admin
  /settings
  /checkin/[token]

Layouts:
- PublicLayout
- AppLayout (authenticated)
- AdminGuard

---

# 10. FIGMA MCP INTEGRATION

Cursor must:
- Pull component structure from Figma
- Map component names exactly
- Not hardcode design tokens
- Use shared UI components

Required structure:

/components/ui
- Card.tsx
- Button.tsx
- Badge.tsx
- Modal.tsx
- Grid.tsx
- Input.tsx

---

# 11. MVP DEFINITION

MVP is complete when:
- User can login via Google
- Admin can create workspace
- Admin can create desks
- User can book desk
- Booking visible in dashboard
- Plan limits enforced
- Multitenancy secured
- Deployed

QR check-in may be Phase 2.

---

# 12. OUT OF SCOPE

- NFC access
- Door unlocking
- Hardware integrations
- Advanced permission matrix
- Enterprise audit logging
- Payments integration

---

# 13. IMPLEMENTATION STRATEGY

Cursor must:
1. Generate Prisma schema.
2. Generate database migration.
3. Implement auth.
4. Implement company creation.
5. Implement desk CRUD.
6. Implement reservation logic.
7. Implement plan middleware.
8. Implement dashboard data fetch.
9. Connect UI to Figma components.
10. Deploy.

Do not generate the entire project in a single step.

---

# 14. SUCCESS CRITERIA

- Functional reservation flow
- Backend-enforced plan logic
- Strict multitenancy
- No cross-company data leaks
- Clean architecture
- Production deployable