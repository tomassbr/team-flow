# Team Flow

SaaS aplikace pro správu sdílených pracovních míst (desk booking) pro hybridní týmy (5–30 lidí). Multi-tenant — každá firma má izolovaná data. Obsahuje webovou aplikaci (Next.js) a mobilní aplikaci (React Native / Expo), které sdílí business logiku a design systém přes npm workspace packages.

---

## Technologický stack

| Vrstva | Technologie | Verze |
|--------|------------|-------|
| Web frontend | Next.js App Router, React 19 | Next.js 16 |
| Mobile | React Native (New Architecture), Expo | RN 0.81, Expo 54 |
| Styling — web | Tailwind CSS 4 + CSS custom properties | — |
| Styling — mobile | React Native StyleSheet + sdílené tokeny | — |
| Backend | Next.js API Routes (REST) | — |
| Databáze | PostgreSQL + Prisma | Prisma 6 |
| Auth — web | Auth.js (NextAuth) v5 beta | Google OAuth + dev credentials |
| Auth — mobile | JWT tokeny přes vlastní `/api/auth/mobile/*` endpointy | Apple + Google Sign-In |
| State — mobile | Zustand + TanStack Query | — |
| Package manager | npm workspaces (monorepo) | — |

---

## Struktura projektu

```
team-flow/                      ← root workspace
│
├── app/                        ← Next.js App Router (web stránky + API)
│   ├── api/                    ← REST API endpointy
│   │   ├── auth/               ← Auth.js handler + mobile JWT endpointy
│   │   ├── desks/              ← CRUD stolů
│   │   ├── reservations/       ← CRUD rezervací
│   │   └── company/            ← nastavení firmy
│   ├── dashboard/              ← hlavní stránka (layout + page + loading)
│   ├── login/                  ← přihlašovací stránka
│   ├── onboarding/             ← registrace firmy
│   └── layout.tsx              ← root HTML layout
│
├── apps/
│   └── mobile/                 ← Expo React Native aplikace
│       └── src/
│           ├── app/            ← Expo Router (file-based routing)
│           │   ├── (app)/      ← chráněné obrazovky (po přihlášení)
│           │   └── (auth)/     ← auth obrazovky (login)
│           ├── components/     ← mobilní UI komponenty
│           ├── features/       ← feature hooks (React Query)
│           └── store/          ← Zustand store (auth, UI state)
│
├── packages/
│   ├── shared/                 ← sdílené tokeny, barvy, spacing, typy
│   ├── ui/                     ← (připraveno) sdílená UI knihovna
│   └── api-client/             ← HTTP klient mobile → web API
│
├── components/                 ← web-only React komponenty
│   ├── ui/                     ← reusable web UI (Button, Avatar, Input…)
│   ├── dashboard/              ← feature komponenty dashboardu
│   └── layouts/                ← page layout wrappery
│
├── lib/                        ← server-side business logika
│   ├── tenant.ts               ← multi-tenant middleware (requireAuth, requireCompany)
│   ├── auth.ts                 ← session helpers
│   ├── db.ts                   ← Prisma singleton
│   └── data/                   ← DB query funkce (dashboard, reservations)
│
├── styles/
│   ├── tokens.css              ← CSS custom properties — jediný zdroj pravdy pro design
│   └── tokens.config.ts        ← TS objekt tokenů pro komponenty
│
├── middleware.ts               ← Auth.js middleware (chrání page routes)
└── auth.ts                     ← NextAuth konfigurace
```

---

## Proč `app/` a zároveň `apps/`?

**`app/`** je Next.js konvence — framework vyžaduje tento adresář na root úrovni pro file-system routing (App Router). Projekt je nastaven jako root Next.js aplikace (ne jako package uvnitř `apps/web/`), takže `app/` musí být v rootu.

**`apps/`** je standardní monorepo konvence (Turborepo, nx, ale i plain npm workspaces) pro ostatní aplikace ve workspace. V ideálním setupu by web byl v `apps/web/` a mobilní app v `apps/mobile/`. Přesun webu by ale vyžadoval refactoring Next.js path aliases, build pipeline a deployment konfigurace — trade-off, který nebyl prioritou v MVP fázi.

---

## Sdílené komponenty — kde a proč

```
packages/shared   ← design tokeny, barvy, spacing, gradient definice, RN shadows
                    importuje se v obou aplikacích: @team-flow/shared
                    
packages/ui       ← plánovaná sdílená UI knihovna (komponenty pro web i mobile)
                    zatím stub — mobile a web mají vlastní komponenty

packages/api-client ← HTTP klient, který mobile používá pro volání web API
```

**Proč nejsou všechny komponenty sdílené?** Web používá HTML elementy (`div`, `span`, `button`) a CSS, mobile používá RN primitives (`View`, `Text`, `Pressable`) a StyleSheet. Tyto primitives jsou odlišné. Správný pattern pro sdílené UI komponenty je:
1. Soubory s `.native.tsx` / `.tsx` sufixem (RN resolver vybere správnou verzi)
2. Nebo abstrakce přes `Platform.select()` uvnitř sdílených komponent
3. Nebo `react-native-web` alias na webu (tento projekt ho má v `next.config.ts`)

`packages/ui` je připraven pro tento přístup jako next step po MVP.

---

## Next.js App Router — `page.tsx` vs `layout.tsx` vs `loading.tsx`

Každý soubor má specifickou roli v React Server Component modelu:

### `page.tsx` — vždy
Samotný obsah stránky. Server Component by default — může přímo fetchovat data z DB bez API volání.

### `layout.tsx` — pokud sekce sdílí UI shell
Renderuje se **jednou** a zachovává state při client-side navigaci (zero re-mount). Ideální pro:
- Auth check (`const session = await auth()` → redirect na `/login`)
- Navigaci, sidebary, page wrappery

```tsx
// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");        // ← auth guard
  if (!session.user.companyId) redirect("/onboarding");
  return <AppLayout>{children}</AppLayout>;      // ← sdílený shell
}
```

### `loading.tsx` — pokud server fetch trvá déle
React 19 Suspense fallback. Next.js automaticky obalí `page.tsx` do `<Suspense fallback={<Loading />}>`. Uživatel vidí skeleton okamžitě, obsah se "streamuje" jakmile DB query doběhne — bez client-side loading state management.

```
/dashboard/
  layout.tsx   ← vždy, auth check + AppLayout shell
  page.tsx     ← data fetch (getDashboardDesks, getWeekOccupancy)
  loading.tsx  ← skeleton UI dokud page.tsx nedoběhne
```

Stránky jako `/login` nebo `/onboarding` nemají layout — jsou standalone bez app shellu.

---

## Architektura — vrstvy

```
┌─────────────────────────────────────────────────────┐
│  UI vrstva                                          │
│  Web: components/ui, components/dashboard            │
│  Mobile: apps/mobile/src/components                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│  Aplikační logika                                   │
│  Web: Server Components, Server Actions              │
│  Mobile: TanStack Query hooks (features/*)           │
│          Zustand store (auth, UI state)              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│  API vrstva (REST)                                  │
│  app/api/* — Next.js Route Handlers                 │
│  Každý endpoint: requireAuth → requireCompany → DB   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│  Doménová / business logika                         │
│  lib/tenant.ts — multi-tenant middleware             │
│  lib/data/* — DB query funkce                       │
│  Transakce v Prisma ($transaction) pro atomicitu     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│  Infrastruktura                                     │
│  PostgreSQL + Prisma ORM                            │
│  Auth.js (sessions, JWT, OAuth)                     │
└─────────────────────────────────────────────────────┘
```

**Dependency rule**: UI neví nic o DB. API routes závisí na lib/, nikoliv na komponentách.

---

## Multi-tenancy

Každá firma (`Company`) má izolovaná data. Každý API endpoint:

```typescript
export async function GET(request: Request) {
  const session = await requireAuth();           // 401 pokud není session
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);      // 403 pokud nemá firmu
  if (cs instanceof Response) return cs;

  const companyId = cs.user.companyId;           // vždy string, typově bezpečné

  // Všechny DB queries filtrované přes companyId
  const desks = await prisma.desk.findMany({
    where: { companyId, isActive: true },
  });
}
```

---

## React New Architecture (RN 0.81 / Expo 54)

Projekt má `newArchEnabled: true` a používá knihovny kompatibilní s New Arch.

**Starý bridge (pre-0.69):**
- JS thread → serializace JSON → async bridge → Shadow thread → Main thread (UI)
- Každá operace asynchronní, bottleneck při animacích a gestech

**New Architecture — tři klíčové změny:**

1. **JSI (JavaScript Interface)** — synchronní JS→nativní volání bez serializace přes JSON. Reanimated 4 a Gesture Handler používají JSI pro animace běžící přímo na UI thread bez dependency na JS thread.

2. **Fabric renderer** — nový C++ renderer nahrazující starý UIManager. Layout kalkulace probíhají přímo v C++, rychlejší než přes bridge.

3. **TurboModules** — nativní moduly se načítají lazy (až při prvním použití) místo all-at-once při startu.

**Praktický dopad v projektu:**
- `react-native-reanimated ~4.1.1` — animace na UI thread (60/120fps i při vytíženém JS threadu)
- `react-native-gesture-handler ~2.28.0` — gesta zpracovaná nativně bez JS latency
- `expo-apple-authentication` — nativní Apple Sign-In přes TurboModule

---

## Auth flow

### Web
1. Auth.js middleware (`middleware.ts`) chrání page routes, přesměruje na `/login`
2. API routes se chrání samy přes `lib/tenant.ts` (vrací 401/403, neredirectuje)
3. Session uložena jako JWT cookie (`authjs.session-token`)

### Mobile → Web API
1. User se přihlásí Apple/Google Sign-In nativně v Expo
2. Token se posílá na `/api/auth/mobile/apple` nebo `/api/auth/mobile/google`
3. Server ověří token, najde/vytvoří uživatele v DB, vrátí custom JWT
4. Mobile ukládá JWT do SecureStore (Expo)
5. Každý API request posílá `Authorization: Bearer <jwt>`

---

## Design systém

`styles/tokens.css` je jediný zdroj pravdy. Všechny hodnoty jsou CSS custom properties.

`packages/shared` exportuje stejné tokeny pro React Native (jako JavaScript objekt), takže web i mobile používají identické barvy, spacing a radius hodnoty.

**Pravidlo**: žádné hardcoded hex barvy nebo px hodnoty v komponentách. Vždy tokeny.

---

## Spuštění projektu

```bash
# Závislosti
npm install

# Web dev server (localhost:3000)
npm run dev

# Mobile (iOS simulator)
npm run mobile:ios

# Mobile (Android)
npm run mobile:android
```

**Požadavky:**
- `.env.local` s `AUTH_SECRET`, `DATABASE_URL` (+ volitelně `GOOGLE_CLIENT_ID/SECRET`, `DEV_AUTH_EMAIL/PASSWORD`)
- Pro iOS build: Xcode + CocoaPods
- Pro Android build: Android Studio + JDK

---

## Datový model

```
Company   { id, name, plan (FREE|PRO), maxDesks, maxUsers }
User      { id, email, role (ADMIN|MEMBER), companyId }
Desk      { id, name, companyId, isActive }
Reservation {
  id, companyId, userId, deskId,
  date,          ← UTC midnight (bez timezone problémů)
  status (RESERVED|CONFIRMED|RELEASED),
  checkInAt
}

Unique constraints:
  (deskId, date)  ← desk nelze zarezervovat 2× ve stejný den
  (userId, date)  ← uživatel nemůže mít 2 rezervace ve stejný den
```
