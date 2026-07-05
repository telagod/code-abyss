# Process — from brief to shipped surface

## 1 · Classify the surface first (sets the boldness budget)

- **Expressive** — landing, marketing, portfolio, launch page, 404/empty states: a
  signature move (`taste.md` §5) is REQUIRED; playing safe here is the failure.
- **Functional** — forms, settings, tables, checkout, auth: zero novelty in interaction;
  identity lives in the tokens (type, color, spacing) and in craft polish only.
- **Hybrid** — dashboards, docs, full apps: expressive shell (nav, page headers, empty
  states, onboarding), functional core.

**Existing design system present → conform to it.** A design system counts as present
when a shared token/theme definition (a `:root` token block, a tailwind theme, a
component library) is consumed by 2+ existing views; scattered per-page CSS or a bare
framework import is NOT a system — design normally, matching only what users already
rely on. When conforming, spend taste on craft details — alignment, spacing rhythm,
motion polish — not on imposing a new direction over someone else's system.

## 2 · Write the concept sentence before any code

> "A **[direction from styles.md]** surface where **[ONE signature move]** carries the
> identity, in **[2–3 word palette]**, set in **[type plan]**."

Example: *"A terminal-style dashboard where giant tabular numerals carry the identity,
phosphor-amber on blue-black, set in mono throughout."*

Run the swap test on the sentence itself (`taste.md` §1): if it could describe any
product, rewrite it before coding. Pull accent and mood from the SUBJECT — domain, era,
material — not from your habits (`taste.md` §7). If you cannot write this sentence, you
are about to produce the default attractor.

## 3 · Tokens before components

Open every build with a `:root` block; components consume only `var(--*)`. A raw hex or
px in a component is a decision leaking out of the system (`garbage.md` §B6).

```css
:root {
  --font-display: /* per direction */;  --font-text: /* … */;
  --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-lg: 21px;
  --text-xl: clamp(28px, 4vw, 36px); --text-display: clamp(48px, 8vw, 104px);
  --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px; --s5: 24px;
  --s6: 32px; --s7: 48px; --s8: 64px; --s9: 96px; --s10: 128px;
  --bg: …; --surface: …; --border: …; --text: …; --text-2: …;
  --accent: …; --accent-ink: …;
  --radius: …; --shadow-raised: …; --shadow-floating: …;
  --ease: cubic-bezier(.2, 0, 0, 1); --ease-enter: cubic-bezier(.16, 1, .3, 1);
  --t-fast: 140ms; --t-med: 240ms;
}
```

Fill values from `craft.md` (§1–§6) and the chosen direction's tokens (`styles.md`).

## 4 · Build the loudest moment first

Hero / display / signature move first, while the concept is fresh; then systematize the
quiet 95% around it. The reverse order — building the quiet parts first — converges on a
template because by the time you reach the hero, "consistent" has hardened into "safe".

## 5 · Review gauntlet before shipping

1. **Arm's-length test:** screenshot, zoom to 50%. Can you tell it from a template? Is
   exactly ONE thing loud?
2. **Squint test (mechanical):** downscale the screenshot to ~25% width and Read it —
   if regions merge into one undifferentiated mass, the contrast is timid (`taste.md` §3).
3. **Garbage sweep:** walk `garbage.md` §A–G and name each violation out loud.
4. **The floor:** `craft.md` §9 — contrast, focus, reduced-motion, targets, semantics.
5. **Text-only test:** read the bare HTML outline — does the structure survive without CSS?

## 6 · Verify in the medium — a design reviewed only as code is hearsay

Rendered output is the runtime; source is one rung below it (`methods/investigate.md` §2).
Open the page (screenshot it and Read the image, or use the artifact/preview path) and
check: light AND dark, 360px AND 1440px wide, with real-length content — not lorem ipsum.

**No render available** (no browser/screenshot path, no preview you can read back): do
NOT claim visual verification. Run the mechanical subset instead — compute contrast
ratios from the hex pairs, grep components for raw hex/px leaking past tokens, walk
`garbage.md` against the CSS — and tell the user exactly which checks were skipped and
why. **Spec/token-only deliverable:** mark gauntlet steps 1–2 and this section
explicitly N/A-unverified; every visual claim is design intent until whoever builds it
re-runs the gauntlet.

**Honest limit:** "does it look *good*" is a taste call that text-reasoning cannot fully
self-certify. After the gauntlet, if you're unsure whether it looks good, don't guess —
show the user a screenshot or two labeled variants and ask. That's a judgment escalation
(`doctrine/02-judgment.md`), not a failure.
