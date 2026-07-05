# Craft — the numbers (write these, not adjectives)

Every value here is a working default, not physics — but deviate ON a scale, never off it.
A weaker model should be able to build a non-embarrassing page from this file alone.
**Precedence when numbers disagree:** the floor (§9) beats everything; the chosen
direction's signature tokens (`styles.md`) beat this file's defaults; this file beats
the `process.md` template.

## 1 · Type

- **Two fonts max:** one display + one text, or one family across weights. Never two
  similar grotesks — if you can't tell them apart at 16px, neither can anyone. This
  includes marks and logotypes: a signature glyph is the display face pushed harder
  (weight, italic, size), never a third family — if a mark truly needs one, it ships as
  an SVG asset, not a loaded font.
- **Sizes:** UI labels 12–13px · secondary/meta 14px · body 16–17px (reading surfaces
  17–18px) · h3 20–24px · h2 28–36px · display `clamp(48px, 8vw, 104px)`. Honor the 4×
  rule (`taste.md` §3) at desktop widths; at ≤480px the clamp lands nearer 3× body — fine.
- **The one escape hatch:** a signature move (`taste.md` §5) may define exactly ONE
  display token beyond these (e.g. `--text-signature`), used in exactly one place; a
  second use makes it an unofficial scale, and both uses become violations.
- **Line-height:** display 0.95–1.1 · headings 1.1–1.2 · body 1.5–1.65. One line-height
  everywhere is a template tell.
- **Letter-spacing:** display −0.02 to −0.04em · body 0 · ALL-CAPS labels +0.06 to
  +0.12em · lowercase body NEVER positive.
- **Measure:** 45–75ch. Constrain with `max-width`, not `text-align: center`; center only
  display text of ≤2 lines.
- **Features:** `font-variant-numeric: tabular-nums` on any column of numbers;
  `text-wrap: balance` on headings; real weights (400/500/650/800), not faux-bold.

## 2 · Space

- **One scale, no other values:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 160 / 192px.
- **Density is a stance** (`styles.md` decides it): airy = section padding 96–160px, card
  padding 32–48px; dense = 8px rhythm, cell padding 8–12px. The garbage zone is the
  unchosen middle — 24px everything.
- Related things closer than unrelated things (proximity IS hierarchy); whitespace before
  divider lines — reach for a border only when space alone fails.

## 3 · Color

- **Define roles, not hues:** `--bg` `--surface` `--border` `--text` `--text-2`
  `--accent` `--accent-ink` (text on accent). Components never see raw hex.
- **If `--accent` sits below 4.5:1 on `--bg`,** also define `--accent-text` — same hue,
  darkened/lightened until ≥4.5:1 — and use it for ALL body-size accent text; `--accent`
  itself is then licensed only for display type, large CTAs, and ≥3:1 UI marks.
- **Neutrals carry hue:** tint grays 2–6% toward the accent (or deliberately against it).
  With accent `#4F7CFF`: bg `#F7F8FB` ✅, `#F7F7F7` ❌ (dead gray next to live blue).
- **Distribution:** ~90% neutral surface · ~9% structure (borders, secondary text) ·
  1–5% accent. If accent covers more, you're in duotone territory — commit or retreat.
- **Contrast floors (check, don't eyeball):** body ≥4.5:1 (aim 7:1) · large text (≥24px,
  or ≥19px at weight 700+) ≥3:1 — smaller bold is still body · UI icons & focus
  indicators ≥3:1 against adjacent colors. Unsure which floor applies → use 4.5:1.
- **Semantic colors** (success/warn/error) get the same muting as the palette — a raw
  `#FF0000` genre red screams against any refined palette. Radix-scale reds/greens fit most.

## 4 · Depth

- **ONE shadow language per surface:** soft ambient
  `0 1px 2px rgb(0 0 0 / .05), 0 8px 24px rgb(0 0 0 / .08)` — OR hard offset
  `4px 4px 0 var(--ink)`. Never both on one page.
- **≤3 elevation levels:** rest → raised (cards, sticky bars) → floating (menus, dialogs).
  Floating gets the largest shadow, and on dark surfaces a border too.
- **Hairlines over shadows for structure:** light `rgb(0 0 0 / .08)`, dark
  `rgb(255 255 255 / .08)`. Shadows are for things that float or move.
- Large shadows: hue-tinted, opacity ≤10%, two layers (contact + ambient).

## 5 · Radii

- One scale: 0 / 4 / 8 / 12 / 16 / 24 / full — pick ONE register per direction (0–4
  reads technical/editorial, 8–12 neutral product, 16–24 friendly consumer, full = pills
  and avatars only) and use only that register's values everywhere; the chosen
  direction's register (`styles.md`) overrides this generic scale.
- **Nested radii:** inner = outer − gap. A 16px-radius card with 8px padding gives its
  children 8px radii — otherwise corners visibly fight.

## 6 · Motion

- **Durations:** micro-feedback 120–180ms · panels/layout 200–300ms · page-level
  300–450ms. Nothing interactive over 500ms. Hover feedback ≤150ms.
- **Easing:** standard `cubic-bezier(0.2, 0, 0, 1)`; entrances
  `cubic-bezier(0.16, 1, 0.3, 1)`; exits ease-in (leave fast). `linear` only for
  marquees/progress; default `ease` never for a signature move.
- **Entrances:** translateY 8–16px + fade, staggered 30–60ms/item, ≤6 items. Animate
  `transform` and `opacity` only.
- **One choreography reused everywhere is an identity; ten different animations is a
  demo scene.**
- `@media (prefers-reduced-motion: reduce)` → kill all non-essential motion. Non-negotiable.

## 7 · Dark mode — built, not inverted

- **When it's required:** whenever the host medium renders both themes (artifacts, apps,
  embedded pages). A single-look direction (paper, print) may ship light-only ONLY if
  the medium honors one look; if viewers get a dark theme regardless, build the dark
  variant in the same material metaphor (slate/chalk for paper — not inverted glare).
- Bg: hue-tinted near-black (`#0B0C0F` cold, `#0E0D0B` warm) — never `#000`.
- Elevation by LIGHTNESS: each surface level ~+3–5% lighter; shadows mostly stop working —
  use borders (`rgb(255 255 255 / .08)`) and the occasional glow.
- Text `#E6E8EB` (~90% white), never `#FFF`; secondary text still ≥4.5:1.
- Accents: desaturate and lighten 10–20% — saturated brand colors vibrate on dark.
- Media: `filter: brightness(.9)` on glaring images; elevated surfaces, not overlays.

## 8 · Finishing details (what reads as craftsmanship)

`::selection` styled to the accent · `:focus-visible` ring `2px` accent with `2px` offset
(NEVER remove an outline without replacing it) · one icon set, one stroke width, sized
1–1.25em to the text it sits with · images get one consistent treatment (same radius +
`box-shadow: inset 0 0 0 1px rgb(0 0 0 / .06)` hairline) · `font-display: swap` with a
metric-compatible fallback stack (kill layout shift) · width/height on images ·
`<title>`, favicon, OG tags set. Custom scrollbars: subtle, and only on dark/dense surfaces.

## 9 · The floor — never trade these for looks

Contrast floors (§3) · visible focus (§8) · `prefers-reduced-motion` respected (§6) ·
semantic HTML (nav is `<nav>`, buttons are `<button>`) · touch targets ≥44px (24px
absolute floor) · zoom never disabled · text is text, not images. Aesthetics that cost
any of these are garbage by definition (`garbage.md` §C, §G).
