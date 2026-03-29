# CLAUDE.md — Smart Office App

## Co je tento projekt

**Smart Office Access** — SaaS webová aplikace pro malé hybridní týmy (5–30 uživatelů) pro správu rezervací sdílených pracovních míst (desků). Umožňuje vidět dostupnost desků, rychle rezervovat místo na konkrétní den, zkontrolovat kdo je dnes v kanclu, a spravovat workspace. PRO tier přidává QR check-in, auto-release a statistiky.

Jde o **multi-tenant** produkt — každá firma (Company) má izolovaná data.

---

## Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 + vlastní design token systém (CSS proměnné) |
| Backend | Next.js API Routes (REST) |
| Databáze | PostgreSQL + Prisma 6 (s Accelerate extension) |
| Auth | Auth.js (NextAuth) v5 beta — Google OAuth + Credentials (dev) |
| Package manager | npm |

---

## Struktura projektu

```
app/
  api/                         # REST API routes
    auth/[...nextauth]/        # Auth.js handler
    company/                   # Company CRUD
    desks/                     # Desk CRUD + plan enforcement
    desks/[id]/                # Desk update/delete
    reservations/              # Reservation logic + transactions
    users/                     # (stub)
  dashboard/                   # Hlavní dashboard (layout + page + loading)
  login/                       # Login stránka (stub)
  onboarding/                  # Onboarding (stub)
  booking/                     # Booking stránka (stub)
  admin/                       # Admin správa (stub)
  settings/                    # Nastavení firmy (stub)
  layout.tsx                   # Root layout
  page.tsx                     # Home → redirect

components/
  ui/                          # Znovupoužitelné komponenty (design systém)
  dashboard/                   # Dashboard-specific wrappery (WorkspaceFilter, AdminModeToggle)

lib/
  db.ts                        # Prisma singleton
  auth.ts                      # getSession, requireAuth, requireCompany
  tenant.ts                    # API middleware (auth + multi-tenant)
  plan.ts                      # (TODO) Plan enforcement helpers

styles/
  tokens.css                   # CSS proměnné — JEDINÝ zdroj pravdy pro design
  tokens.config.ts             # TypeScript objekt odkazující na CSS proměnné

prisma/
  schema.prisma                # Databázové modely

auth.ts                        # NextAuth konfigurace
design.md                      # Design kontrakt (závazný!)
PROJECT_SPEC.md                # Produktová specifikace
IMPLEMENTATION_PLAN.md         # 5-fázový roadmap
docs/
  DASHBOARD_IMPLEMENTATION_PLAN.md
  DASHBOARD_TOKEN_USAGE.md
```

---

## Architektonické principy

### Multi-tenancy — nikdy nezapomenout
Každý API endpoint musí:
1. Ověřit session (`requireAuth`)
2. Ověřit `companyId` uživatele (`requireCompany`)
3. Filtrovat všechna DB query pomocí `{ where: { companyId } }`

Vzor každého API route:
```typescript
export async function GET(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session; // 401

  const companySession = await requireCompany(session);
  if (companySession instanceof Response) return companySession; // 403

  const companyId = companySession.user.companyId!;
  // ... query vždy s companyId
}
```

### Design tokeny — žádné hardcoded hodnoty
- **Nikdy** nepoužívat hex barvy, px hodnoty nebo inline čísla přímo v komponentách
- Vždy sáhnout do `tokens.config.ts` (nebo `var(--token-*)` v CSS)
- Pravidlo: pokud hodnota není v `styles/tokens.css`, nepatří do kódu

```typescript
// ✅ Správně
style={{ backgroundColor: tokens.color.surface.level1, padding: tokens.space.s16 }}

// ❌ Špatně
style={{ backgroundColor: '#FFFFFF', padding: '16px' }}
```

### Backend-enforced pravidla
- Business logika (limity plánů, multi-tenant validace) **nikdy** jen na frontendu
- Plan enforcement patří do API routů, ne do komponent
- Rezervace se vytvářejí v `prisma.$transaction()` — atomicky

### Server vs. Client Components
- **Default: Server Component** — data fetching v layout/page
- `"use client"` **pouze** pro interaktivní/stavové prvky (SegmentedControl, Toggle)
- Loading stavy řeší `loading.tsx` se skeleton UI

---

## Design systém

`design.md` je **závazný kontrakt**. Vždy ho respektovat.

### Klíčová pravidla
- **Pouze light mode** — žádný dark mode, žádné `prefers-color-scheme`
- **Žádné ad-hoc hodnoty** — pouze tokeny z definované škály
- **Komponenty nepoužívají Tailwind třídy** — pouze inline styly s tokeny

### Barvy (zkrácený přehled)
| Token | Hodnota | Použití |
|-------|---------|---------|
| `color/bg/base` | `#F3F5F9` | App background |
| `color/surface/level1` | `#FFFFFF` | Karty, containery |
| `color/text/primary` | `#0F172A` | Nadpisy, labely |
| `color/text/secondary` | `#475569` | Body text |
| `color/accent/primary` | `#6366F1` | Primární CTA |
| `color/accent/secondary` | `#06B6D4` | Sekundární akcenty |

### Spacing škála
`space/4, 8, 12, 16, 24, 32, 40` — screen padding `space/24`, card padding `space/16`–`space/24`

### Radius škála
`radius/12, 16, 20, 24, full` — tlačítka `radius/16`, desk karty `radius/24`, pills `radius/full`

### Gradienty (pouze tyto tři)
- `gradient/brand` — primární CTA, hero akcenty, ProgressBar
- `gradient/item` — pozadí zarezervovaných desk karet
- `gradient/dashboard` — volitelné pozadí dashboardu

---

## Datový model (zkrácený)

```
Company { id, name, plan (FREE|PRO), maxDesks, maxUsers, ... }
User    { id, email, role (ADMIN|MEMBER), companyId, ... }
Desk    { id, name, companyId, qrToken, isActive, ... }
Reservation { id, companyId, userId, deskId, date, status (RESERVED|CONFIRMED|RELEASED), checkInAt }

Unikátní constrainty:
  - (deskId, date)  → desk nelze zarezervovat 2x ve stejný den
  - (userId, date)  → uživatel nemůže mít 2 rezervace ve stejný den
```

---

## Stav implementace

| Oblast | Stav |
|--------|------|
| DB schema + Prisma | ✅ Hotovo |
| Auth (Google OAuth + Credentials) | ✅ Hotovo |
| API: company, desks, reservations | ✅ Hotovo |
| Dashboard UI + komponenty | ✅ Hotovo |
| Design token systém | ✅ Hotovo |
| Plan enforcement (maxDesks) | 🟡 Částečně (jen POST /desks) |
| Stránky: /login, /onboarding, /booking, /admin, /settings | ❌ Stub |
| PRO features (QR check-in, auto-release, stats) | ❌ Nezačato |

---

## Implementační pravidla

### Co NEDĚLAT
- Nepřidávat features mimo scope — žádné "vylepšení navíc"
- Nepoužívat Tailwind třídy v `components/ui/*` komponentách
- Neměnit design tokeny bez aktualizace `design.md`
- Neobcházet multi-tenant validaci ani pro "jednoduché" endpointy
- Nepsat business logiku na frontendu (plan limity, validace rolí)
- Neresetovat `tokens.config.ts` ani `tokens.css` — jsou synchronizované

### Konvence
- Nové API routes kopírují vzor z `app/api/desks/route.ts`
- Nové komponenty do `components/ui/` (obecné) nebo `components/dashboard/` (dashboard-specifické)
- Chyby z API: 401 (no auth), 403 (no company), 404 (not found), 409 (conflict), 422 (validation)
- `lib/tenant.ts` je standardní middleware — používat ho všude

### Plan enforcement pattern (pro nové features)
```typescript
// Backend check před operací vyžadující PRO
if (company.plan !== 'PRO') {
  return Response.json({ error: 'PRO plan required' }, { status: 403 });
}
```

---

## Klíčové soubory

| Soubor | Účel |
|--------|------|
| `design.md` | Design kontrakt — závazný, vždy číst před UI prací |
| `PROJECT_SPEC.md` | Produktová specifikace, API kontrakt, business pravidla |
| `IMPLEMENTATION_PLAN.md` | Roadmap (5 fází) |
| `styles/tokens.css` | Zdroj pravdy pro design tokeny |
| `styles/tokens.config.ts` | TS objekt tokenů pro komponenty |
| `lib/tenant.ts` | API middleware (auth + multi-tenant) |
| `prisma/schema.prisma` | Databázové modely |
| `auth.ts` | NextAuth konfigurace |
