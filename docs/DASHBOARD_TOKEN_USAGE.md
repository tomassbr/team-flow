# Dashboard Token Usage

Per-section token usage for the Dashboard page, aligned with `design.md` and `styles/tokens.css`.

---

## Layout (main wrapper)

- **Column gap:** `space/s40` — vertical rhythm between left column sections
- **Right sidebar width:** 392px (fixed; not in token scale — design constraint)

---

## Who's In Today

| Element | Tokens |
|---------|--------|
| Section title | `type/h2`, `color/text/primary`, letterSpacing `-0.025em` |
| "12 People" label | `type/micro`, `color/text/muted` |
| Avatar row gap | `space/s24` |
| Avatar circle | `radius/full`, `color/accent/secondary` (fallback bg), `shadow/e1` |
| "+7" circle | `radius/full`, `surface/level2`, `border/strong` (dashed), `type/micro`, `color/text/muted` |

---

## Workspace

| Element | Tokens |
|---------|--------|
| Section title | `type/h2`, `color/text/primary` |
| SegmentedControl | `surface/level2`, `border/subtle`, `radius/full`, `space/s8` padding; selected: `surface/level1`, `shadow/e1` |
| Section content gap | `space/s24` |
| Error banner | `space/s16` padding, `color/status/error`, `color/text/onAccent`, `type/caption`, `radius/r16` |
| Empty state | `space/s32` padding, `color/text/muted`, `type/body`, `surface/level1`, `radius/r20`, `shadow/e1` |
| Desk grid gap | `space/s24` |
| DeskCard | Uses `DeskCard` component (see below) |

---

## This Week (right sidebar)

| Element | Tokens |
|---------|--------|
| Card container | `space/s32` padding, `surface/level1`, `radius/r20`, `shadow/e1` |
| Card internal gap | `space/s24` |
| Section title | `type/h2`, `color/text/primary` |
| Day label | `type/body`, fontWeight 500, `color/text/primary` |
| Date label | `type/micro`, `color/text/muted` |
| "% Full" label | `type/micro`, fontWeight 500, `color/text/primary` |
| Day entry gap | `space/s12` |
| ProgressBar | `gradient/brand` fill, `radius/full` track |
| Book Future Date button | `variant="gradient"` (uses `gradient/brand`), `space/s16` py, `space/s24` px |

---

## Shared components (token usage)

### DeskCard
- **Available:** `surface/level1`, `radius/r20`, `shadow/e1`, `StatusChip` (success), `type/bodyStrong` for title
- **Booked:** `surface/booked` (gradient tint), same radius/shadow, `StatusChip` (accent/secondary), Avatar with `radius/full`
- **Add New:** `surface/level2`, `border/strong` dashed, `radius/full` icon circle

### Avatar
- `radius/full`, `shadow/e1`, `color/accent/secondary` (fallback), `color/text/onAccent`, badge: `surface/level1`, `border/subtle`

### ProgressBar
- Track: `border/subtle`, `radius/full`; fill: `gradient/brand`

### Button (gradient)
- `gradient/brand`, `color/text/onAccent`, `radius/r16` or `radius/r20`

---

## Loading state (`loading.tsx`)

- Skeleton blocks use `surface/level2`, `radius/r12` (title/avatar placeholders), `radius/r20` (card placeholders), `shadow/e1` (cards)
- Avatar placeholders: `radius/full`
- No hex colors or arbitrary px/rem outside the token scale.
