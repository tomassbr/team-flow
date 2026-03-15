# Dashboard Implementation Plan — Figma Alignment

Based on the dashboard audit and `design.md` token contract.  
**Goal:** Update existing dashboard code to match Figma exactly using only canonical tokens.

---

## 1) Step-by-step plan

### Phase 0: Token foundation (prerequisite)

| Step | File(s) | Action |
|------|---------|--------|
| 0.1 | `styles/tokens.css` | Add typography CSS variables (fontSize, fontWeight, letterSpacing) for display, h1, h2, body, bodyStrong, caption, micro per design.md §5.1 |
| 0.2 | `styles/tokens.css` | Add `--token-radius-full: 9999px` for pills/avatars (design.md extension; Figma uses full radius for these) |
| 0.3 | `design.md` | Add `radius/full` to §4 Radius scale (or document as exception for pills/avatars) |
| 0.4 | `app/globals.css` | Fix token references: map legacy names (--token-foreground, --token-primary, etc.) to new tokens (--token-text-primary, --token-accent-primary, etc.) or remove unused mappings |
| 0.5 | `styles/tokens.css` | Add booked-card surface token: `--token-surface-booked` as a soft gradient using `gradient/brand` with low opacity, or document use of `gradient/brand` with `color/surface/level2` blend (see Risk Areas) |

### Phase 1: New components

| Step | File | Action |
|------|------|--------|
| 1.1 | `components/ui/Logo.tsx` | Create `Logo` — props: `letters`, `size` (default 40). Uses `color/accent/primary` bg, `color/text/onAccent`, `radius/12` |
| 1.2 | `components/ui/Toggle.tsx` | Create `Toggle` — props: `checked`, `onChange`, `label?`. Track: `color/border/strong`, thumb: `color/surface/level1`, `radius/full` |
| 1.3 | `components/ui/Avatar.tsx` | Create `Avatar` — props: `src?`, `alt`, `name` (fallback initial), `size` (56 | 40), `badge?` (icon node). Uses `radius/full`, `effect/shadow/e1` |
| 1.4 | `components/ui/SegmentedControl.tsx` | Create `SegmentedControl` — props: `options: { value, label }[]`, `value`, `onChange`. Selected: `color/surface/level1`, unselected: transparent. `radius/full`, `space/8` padding |
| 1.5 | `components/ui/StatusChip.tsx` | Create `StatusChip` — props: `status: 'available' | 'booked'`, `label`. Dot + text. Available: `color/status/success`. Booked: `color/accent/secondary` or `color/status/info` |
| 1.6 | `components/ui/ProgressBar.tsx` | Create `ProgressBar` — props: `value` (0–100), `height?`. Track: `color/border/subtle`, fill: `gradient/brand`, `radius/full` |
| 1.7 | `components/ui/DeskCard.tsx` | Create `DeskCard` — props: `name`, `status`, `user?`, `duration?`, `icon?`. Variants: available, booked, addNew. Uses `Card` base with token overrides |

### Phase 2: Extend existing components

| Step | File | Action |
|------|------|--------|
| 2.1 | `components/ui/Card.tsx` | Add `variant?: 'default' | 'booked' | 'addNew'`. Default: `surface/level1`, `radius/20`, `shadow/e1`. Booked: gradient surface. AddNew: dashed border, `color/border/strong` |
| 2.2 | `components/ui/Button.tsx` | Add `variant: 'gradient'` using `gradient/brand`, `color/text/onAccent`. Add `icon?: ReactNode` prop. Use `radius/16` or `radius/20` per design.md |

### Phase 3: Remove dashboard-specific tokens

| Step | File | Action |
|------|------|--------|
| 3.1 | `app/dashboard/dashboard.css` | Delete file |
| 3.2 | `app/dashboard/layout.tsx` | Remove `import "./dashboard.css"`. Replace all `var(--dash-*)` with `var(--token-*)` |
| 3.3 | `app/dashboard/page.tsx` | Remove `import "./dashboard.css"`. Replace all `var(--dash-*)` with `var(--token-*)` |

### Phase 4: Layout implementation

| Step | File | Action |
|------|------|--------|
| 4.1 | `app/dashboard/layout.tsx` | Rewrite header: use `Logo`, `Toggle`, `Avatar`. Apply spacing/typography tokens per mapping table |
| 4.2 | `app/dashboard/page.tsx` | Rewrite Who's In Today: use `Avatar` list + "+7" circle. Apply spacing tokens |
| 4.3 | `app/dashboard/page.tsx` | Rewrite Workspace: use `SegmentedControl`, `DeskCard` grid. Apply spacing tokens |
| 4.4 | `app/dashboard/page.tsx` | Rewrite This Week sidebar: use `Card`, `ProgressBar`, `Button` (gradient). Apply spacing tokens |
| 4.5 | `app/dashboard/layout.tsx` | Adjust main content wrapper: include right sidebar in layout or page. Ensure two-column flex with correct widths |

### Phase 5: Typography and polish

| Step | File | Action |
|------|------|--------|
| 5.1 | `app/dashboard/*` | Replace all inline `fontSize`, `fontWeight` with typography utility classes or `style={{ fontSize: 'var(--token-type-h2)' }}` |
| 5.2 | `app/dashboard/*` | Audit: no hex, no raw px (except icon dimensions), no Tailwind spacing/radius classes |
| 5.3 | `app/globals.css` | Ensure body uses `--token-background`, `--token-text-primary` |

---

## 2) Missing components — minimal API

| Component | Props | Notes |
|-----------|-------|-------|
| **Logo** | `letters: string`, `size?: number` | Renders in `color/accent/primary` box, `color/text/onAccent`. Size 40 default. |
| **Toggle** | `checked: boolean`, `onChange: () => void`, `label?: string` | Track and thumb only. Label outside. |
| **Avatar** | `src?: string`, `alt: string`, `name: string`, `size?: 56 \| 40`, `badge?: ReactNode` | Circular. Badge = small icon overlay (e.g. desk). |
| **SegmentedControl** | `options: { value: string; label: string }[]`, `value: string`, `onChange: (v: string) => void` | Pill group. Selected = white bg. |
| **StatusChip** | `status: 'available' \| 'booked'`, `label: string` | Dot + label. |
| **ProgressBar** | `value: number`, `height?: number` | Horizontal bar. Fill = `gradient/brand`. |
| **DeskCard** | `name: string`, `status: 'available' \| 'booked'`, `user?: string`, `duration?: string`, `icon?: ReactNode`, `variant?: 'addNew'` | Composes Card + StatusChip + optional avatar. |

---

## 3) Exact mapping: Figma → tokens

### Spacing

| Location | Figma (px) | Token |
|----------|------------|-------|
| Container horizontal padding | 20 | `space/24` |
| Header padding | px:40, py:32 | `space/40`, `space/32` |
| Logo ↔ title gap | 16 | `space/16` |
| Header right section gap | 24 | `space/24` |
| Main grid gap (left ↔ right column) | 48 | `space/40` |
| Who's In ↔ Workspace vertical gap | 40 | `space/40` |
| Who's In internal gap | 24 | `space/24` |
| Section title ↔ content | 24 | `space/24` |
| Avatar horizontal gap | 24 | `space/24` |
| Avatar ↔ name | 11 | `space/12` |
| Workspace header ↔ card grid | 24 | `space/24` |
| Card grid gap | 24 | `space/24` |
| Card internal padding | 24–25 | `space/24` |
| Card content vertical gap | 24 | `space/24` |
| This Week card padding | 33 | `space/32` |
| This Week header ↔ list | 24 | `space/24` |
| Daily entry vertical gap | 24 | `space/24` |
| Day/date ↔ progress bar | ~10 | `space/12` |
| CTA ↔ card bottom | 16 | `space/16` |
| CTA internal padding | py:16, px:24 | `space/16`, `space/24` |

### Radius

| Element | Figma | Token |
|---------|-------|-------|
| Logo | 12 | `radius/12` |
| Avatars, +7, filter pills, status chips | 9999 | `radius/full` |
| Desk cards | 28 | `radius/24` |
| Book Future Date button | ~27 | `radius/24` |
| Add New Desk icon circle | 9999 | `radius/full` |

### Typography

| Element | Token |
|---------|-------|
| Team Space | `typography/h2` |
| Admin Mode | `typography/micro` |
| Alex Rivera | `typography/caption` |
| Product Design | `typography/micro` |
| Who's In Today, Workspace | `typography/h2` |
| 12 People | `typography/micro` |
| Avatar names | `typography/micro` |
| All / Available | `typography/micro` |
| Card titles | `typography/bodyStrong` |
| Available / Booked, metadata | `typography/micro` |
| This Week | `typography/h2` |
| Today, Tomorrow, etc. | `typography/h2` |
| Date, % Full | `typography/micro` |
| Book Future Date | `typography/bodyStrong` |
| Add New Desk | `typography/bodyStrong` |

### Colors

| Element | Token |
|---------|-------|
| Page background | `color/bg/base` |
| Header, cards | `color/surface/level1` |
| Logo bg | `color/accent/primary` |
| Logo text | `color/text/onAccent` |
| Primary text | `color/text/primary` |
| Secondary text | `color/text/secondary` |
| Muted text | `color/text/muted` |
| Available chip | `color/status/success` |
| Booked chip | `color/accent/secondary` or `color/status/info` |
| +7 circle border | `color/border/strong` |
| Filter selected bg | `color/surface/level1` |
| Filter track | `color/surface/level2` or `color/border/subtle` |
| Card shadow | `effect/shadow/e1` |
| CTA glow | `effect/shadow/e2` or `e3` |

---

## 4) Risk areas and chosen approach

### 4.1 Booked card gradient

**Risk:** Figma uses a custom gradient (blue/purple tint). design.md only allows `gradient/brand`.

**Approach:** Use `gradient/brand` at low opacity over `color/surface/level2`, or add a single token `--token-surface-booked` in design.md as a gradient that stays within the brand palette. Prefer extending design.md with one new surface token over inventing gradients in components.

### 4.2 Avatar border glow (Alex Rivera)

**Risk:** Figma has a gradient ring around the main user avatar. design.md has no “glow” token.

**Approach:** Use `gradient/brand` as `border-image` or a pseudo-element with `gradient/brand` and blur. If not feasible, use `color/accent/secondary` as a 2px border. Do not add new gradient definitions.

### 4.3 CTA “ambient glow”

**Risk:** Figma shows a soft glow around “Book Future Date”. design.md shadows are neutral (black).

**Approach:** Use `effect/shadow/e2` or `e3` for elevation. If a colored glow is required, use a `box-shadow` with `color/accent-secondary` at low opacity (e.g. `0 0 20px rgba(6,182,212,0.2)`). Document as a one-off if it cannot be expressed with existing tokens.

### 4.4 Typography not in tokens.css

**Risk:** design.md defines typography in rem, but tokens.css has no typography variables.

**Approach:** Add to `tokens.css`:

```css
--token-type-display: 1.875rem;
--token-type-h1: 1.5rem;
--token-type-h2: 1.25rem;
--token-type-body: 1rem;
--token-type-caption: 0.875rem;
--token-type-micro: 0.75rem;
```

And optionally font-weight/letter-spacing. Use these in components via `fontSize: 'var(--token-type-h2)'` etc.

### 4.5 globals.css legacy tokens

**Risk:** globals.css references `--token-foreground`, `--token-primary`, etc., which do not exist in tokens.css.

**Approach:** Either (a) add aliases in tokens.css, or (b) update globals.css to use `--token-text-primary`, `--token-accent-primary`, etc. Prefer (b) to avoid duplicate token definitions.

### 4.6 radius/full

**Risk:** design.md radius scale is 12, 16, 20, 24. Figma uses 9999px for pills/avatars.

**Approach:** Add `--token-radius-full: 9999px` and document in design.md as the pill/avatar radius. No other custom radii.

---

## 5) Order of work (summary)

1. **Phase 0** — Token foundation (typography, radius/full, globals.css, booked surface if needed)
2. **Phase 1** — New components (Logo, Toggle, Avatar, SegmentedControl, StatusChip, ProgressBar, DeskCard)
3. **Phase 2** — Extend Card and Button
4. **Phase 3** — Remove dashboard.css, switch to canonical tokens
5. **Phase 4** — Rewrite layout and page with new components and token mapping
6. **Phase 5** — Typography and final audit

---

## 6) Files to touch (checklist)

- [ ] `styles/tokens.css`
- [ ] `design.md` (radius/full, optional surface-booked)
- [ ] `app/globals.css`
- [ ] `components/ui/Logo.tsx` (new)
- [ ] `components/ui/Toggle.tsx` (new)
- [ ] `components/ui/Avatar.tsx` (new)
- [ ] `components/ui/SegmentedControl.tsx` (new)
- [ ] `components/ui/StatusChip.tsx` (new)
- [ ] `components/ui/ProgressBar.tsx` (new)
- [ ] `components/ui/DeskCard.tsx` (new)
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Button.tsx`
- [ ] `app/dashboard/dashboard.css` (delete)
- [ ] `app/dashboard/layout.tsx`
- [ ] `app/dashboard/page.tsx`
