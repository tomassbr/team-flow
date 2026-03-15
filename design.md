# design.md — Smart Office Design Contract (for Cursor)

This file is the single source of truth for UI implementation (LIGHT ONLY).  
**Rule:** do not invent new colors, spacing values, radii, font sizes, shadows, or gradients. Use only the tokens and rules below.

**Dark mode:** not supported right now. Do not add dark tokens, media queries, or alternate palettes.

---

## 1) Token usage rules

### 1.1 Semantic tokens only
Use tokens by *role* (e.g., `color/text/primary`), never by ad-hoc hex values.

### 1.2 No drift
- No custom spacing values outside the spacing scale.
- No custom border radii outside the radius scale.
- No custom text sizes outside the type scale.
- No new shadows beyond `effect/shadow/*`.
- Gradient usage is limited to `gradient/brand` only.

### 1.3 Source of truth in code
In the codebase, tokens must be referenced via:
- CSS variables (recommended): `var(--token-...)` from `tokens.css`
- or the TS token map: `tokens.config.ts`

No hardcoded hex colors in components.

---

## 2) Color system

### 2.1 Backgrounds
- `color/bg/base` = `#F3F5F9`
- `color/bg/canvas` = `#F3F5F9`

**Usage**
- App/root background: `color/bg/base`
- Screen canvas: `color/bg/canvas`

### 2.2 Surfaces
- `color/surface/level1` = `#FFFFFF`  
  **Usage:** primary cards, sheets, primary containers
- `color/surface/level2` = `#F8FAFC`  
  **Usage:** secondary surfaces, grouped list backgrounds, subtle sections
- `color/surface/glassTint` = `rgba(241, 245, 249, 0.8)`  
  **Usage:** glass overlays only (paired with blur in code if applicable)

### 2.3 Text
- `color/text/primary` = `#0F172A`
- `color/text/secondary` = `#475569`
- `color/text/muted` = `#64748B`
- `color/text/onAccent` = `#FFFFFF`

**Usage**
- Titles / primary labels: `color/text/primary`
- Body text / secondary labels: `color/text/secondary`
- Meta, hints, placeholders: `color/text/muted`
- Text on accent backgrounds/buttons: `color/text/onAccent`

### 2.4 Borders
- `color/border/subtle` = `#F1F5F9`
- `color/border/strong` = `#CBD5E1`

**Usage**
- Default dividers / hairlines: `color/border/subtle`
- Emphasis borders / input rings: `color/border/strong` (or use accent when appropriate)

### 2.5 Accents
- `color/accent/primary` = `#0A1024`
- `color/accent/secondary` = `#06B6D4`

**Usage**
- Primary CTAs, key highlights: `color/accent/primary`
- Secondary accents, links, indicators: `color/accent/secondary`

### 2.6 Status colors
- `color/status/success` = `#10B981`
- `color/status/info` = `#3B82F6`
- `color/status/warning` = `#F59E0B`
- `color/status/error` = `#EF4444`

**Usage**
- Toasts, banners, validation states, status chips.

---

## 3) Spacing (layout rhythm)

Spacing scale (rem):
- `space/4`  = `0.25rem`
- `space/8`  = `0.5rem`
- `space/12` = `0.75rem`
- `space/16` = `1rem`
- `space/24` = `1.5rem`
- `space/32` = `2rem`
- `space/40` = `2.5rem`

**Rules**
- Use only these spacing steps.
- Screen padding: start with `space/24` (or `space/16` on dense layouts).
- Card padding: `space/16` (compact) or `space/24` (default).
- Inter-section spacing: `space/24`–`space/32`.

---

## 4) Radius

Radius scale (rem):
- `radius/12` = `0.75rem`
- `radius/16` = `1rem`
- `radius/20` = `1.25rem`
- `radius/24` = `1.5rem`

**Rules**
- Use only these radii.
- Buttons/inputs: `radius/16` (default) or `radius/20` (large/hero).
- Cards/sheets: `radius/20` (default), `radius/24` (modal/sheet).

---

## 5) Typography

> Font family is defined in the Figma UI Kit. In code, keep one primary UI font and match weights/sizes below.

### 5.1 Type tokens (rem)
- `typography/display`
  - fontSize: `1.875rem`
  - fontWeight: `500`
  - letterSpacing: `-0.025em`

- `typography/h1`
  - fontSize: `1.5rem`
  - fontWeight: `500`
  - letterSpacing: `-0.025em`

- `typography/h2`
  - fontSize: `1.25rem`
  - fontWeight: `500`
  - letterSpacing: `-0.025em`

- `typography/body`
  - fontSize: `1rem`
  - fontWeight: `400`

- `typography/bodyStrong`
  - fontSize: `1rem`
  - fontWeight: `500`

- `typography/caption`
  - fontSize: `0.875rem`
  - fontWeight: `400`

- `typography/micro`
  - fontSize: `0.75rem`
  - fontWeight: `500`

### 5.2 Usage rules
- Screen titles: `typography/h1` + `color/text/primary`
- Section headers: `typography/h2` + `color/text/primary`
- Body content: `typography/body` + `color/text/secondary`
- Emphasis inside body: `typography/bodyStrong`
- Metadata / helper: `typography/caption` or `typography/micro` + `color/text/muted`

---

## 6) Shadows / elevation

Shadow tokens:
- `effect/shadow/e1` = `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `effect/shadow/e2` = `0 2px 12px 0 rgba(0, 0, 0, 0.02)`
- `effect/shadow/e3` = `0 8px 40px 0 rgba(0, 0, 0, 0.03)`

**Usage**
- Cards: `e1`
- Floating panels / dropdowns / sheets: `e2`
- Modals / top-level overlays: `e3`

---

## 7) Gradient

- `gradient/brand`  
  `linear-gradient(to right, rgba(37,99,235,0.4), rgba(34,211,238,0.4), rgba(79,70,229,0.4))`

**Rules**
- Use sparingly: primary CTAs, highlights, hero accents.
- Do not invent additional gradients.

---

## 8) Component states (implementation requirement)

For interactive components, implement these states using the same tokens:

### Buttons
- Default
- Pressed
- Disabled
- Loading

### Inputs
- Default
- Focused
- Filled
- Disabled
- Error

### Feedback
- Toast: info/success/warning/error
- Empty state
- Loading skeleton (static is acceptable; shimmer optional)

---

## 9) Cursor implementation constraints

When generating UI code:
1) Prefer tokens over literals (colors, spacing, radius, type).
2) Reuse existing components (from the UI kit) instead of creating new one-off styles.
3) Enforce the spacing and type scales strictly.
4) If something is missing, extend **this file first**, then implement.

End of contract.