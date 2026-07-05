# Styles — named directions, exact tokens, and where each turns to garbage

Pick **ONE** direction per product. Mixing is allowed ONLY for these pairs:
editorial+swiss, luxe-dark+soft-depth, and data-ink (§8) inside any host direction. Any
other pair: pick one — the loud directions (brutalist, terminal, luxe dark) never mix
with each other. Every direction below is: *use when* / *signature tokens* / *dies when*.

**Quick map:** long-form & launches → editorial · serious tools → swiss · indie/dev energy
→ brutalist · dashboards & monitoring → terminal (+ data-ink for charts) · premium/creative
→ luxe dark · consumer & friendly → soft-depth · docs/blogs/reading → warm paper.

**The hexes below are register anchors, not the palette.** Shift paper tint and accent
hue toward the SUBJECT (`taste.md` §7) before copying — identical hexes across unrelated
products is this bundle's own brand of slop.

## 1 · Editorial print
- **Use when:** manifestos, launches with a story, portfolios, long-form marketing.
- **Signature:** high-contrast serif display at 64–120px (Fraunces, Libre Caslon,
  Playfair, Newsreader — pick by subject, don't default to one) over a quiet text face
  (a humanist sans, or a restrained text serif like Source Serif — never a second
  display serif); cream paper `#FAF9F6` + ink `#1A1A18`; one printer's accent — Klein
  blue `#002FA7` (10.2:1 on cream, safe at any size) or vermilion `#D64541` for
  display/marks only, darkened to `#C03B37` for body-size text (4.17:1 → 5.1:1 on
  `#FAF9F6`); hairline rules `1px rgb(0 0 0 / .12)`; small-caps kickers 12px `+0.08em`;
  numbered sections (`01 —`); asymmetric grid (8+4 columns); section padding 120–160px.
- **Dies when:** applied to dense app UI; a second decorative font appears; body drops
  below 16px to look "printy".

## 2 · Swiss / International
- **Use when:** product marketing for serious tools, agencies, technical brands, covers.
- **Signature:** ONE grotesk family across many weights; hierarchy from size+weight only;
  black/white plus one signal color (red `#E5322D` — display/marks only, 4.35:1 on
  white; or blue `#1F3EFF`, 6.6:1, safe at body size); no shadows, radii
  0–4px; flush-left ragged-right; giant numerals; alignment so strict the unseen grid is
  felt; whitespace is the layout.
- **Dies when:** spacing rhythm is uneven (a grid without discipline is just sparse);
  things drift toward centered; a gradient sneaks in.

## 3 · Neo-brutalist
- **Use when:** dev tools, indie products, playful brands, anything wanting garage energy.
- **Signature:** `2px solid #000` borders; hard offset shadows `4px 4px 0 #000`; flat
  saturated fills — black text on lemon `#FFD60A` and mint `#3DDC97`, white text on
  cobalt `#3A5BFF` (black on cobalt is 4.12:1, below the floor); radii 0–8px; type
  at weight 800+; hover = translate the element onto its shadow; visible structure, no
  soft anything.
- **Dies when:** used on trust-sensitive surfaces (billing, medical); fill-vs-text
  contrast slips below 4.5:1; EVERYTHING is loud — brutalism still needs a quiet field
  around the shouting.

## 4 · Terminal / instrument
- **Use when:** dashboards, monitoring, dev tools, logs — anything genuinely data-dense.
- **Signature:** monospace for data (grotesk for prose is fine); dense 8px rhythm; dark
  `#0B0D10`; text `#E6E9EF`; 1px borders `rgb(255 255 255 / .08)`; ONE phosphor accent —
  green `#4ADE80`, amber `#FFB224`, or cyan `#22D3EE`; `tabular-nums` everywhere;
  uppercase micro-labels 11px `+0.08em`; status as small color dots, not tinted rows.
- **Dies when:** CRT cosplay appears (scanlines, glow text, flicker); density without
  alignment — dense means *more grid*, not less.

## 5 · Luxe dark
- **Use when:** premium products, creative tools, hero surfaces meant to feel expensive.
- **Signature:** hue-tinted near-black (`#0C0D12` cold or `#12100E` warm — never `#000`);
  text `#E8E6E3`, never `#FFF`; hairlines `rgb(255 255 255 / .08)`; ONE accent on <2%
  of the surface — champagne `#D4B483`, brushed gold `#C8A96A`, or electric periwinkle
  `#7C8CF8` (a "metallic" read comes from a subtle lightness gradient on the glyph or
  rule, never from a silver-gray hex); gradients only as 2–6% lightness drift or a
  single glow behind the hero object; display in a refined serif or tight grotesk.
- **Dies when:** glow spreads everywhere; body text sinks into gray-on-gray below 4.5:1;
  a second accent arrives.

## 6 · Soft-depth / tactile (the honest glass)
- **Use when:** consumer apps, friendly tools, surfaces meant to feel touchable.
- **Signature:** layered surfaces with real z-meaning; radii 16–24px; soft hue-tinted
  ambient shadows (`0 8px 24px color-mix(in srgb, var(--accent) 10%, transparent)`);
  `backdrop-filter: blur` ONLY over
  actual moving content (sticky header over a scrolling list); warm neutrals; one
  saturated accent plus soft tints of the same hue.
- **Dies when:** blur sits over a solid background; every card gets the same shadow
  (elevation stops meaning anything); radii start mixing.

## 7 · Warm paper
- **Use when:** docs, blogs, reading surfaces, personal sites — anything read for minutes.
- **Signature:** warm paper `#F7F4EE`; ink `#2E2C29` (soft but still ~12:1); serif body at
  17–18px / line-height 1.7; measure 60–70ch; muted-ink accents — forest `#3A5F41`,
  oxblood `#7C2D2D`, ochre darkened to `#8A6508` (raw `#B8860B` is 2.96:1 on this paper:
  decorative use only); hairlines `rgb(0 0 0 / .08)`; optional faint grain on
  large empty areas only.
- **Dies when:** contrast is sacrificed for "softness"; grain or texture sits under data
  or body text; it gets app-like chrome it doesn't need.

## 8 · Data-ink (for charts, inside any direction above)
- **Use when:** charts, reports, analytics — combines with terminal, swiss, or paper.
- **Signature:** maximize data-ink — no chart borders; gridlines at 6% of the ink over
  the surface (light: `rgb(0 0 0 / .06)`, dark: `rgb(255 255 255 / .06)`) or lighter;
  direct labels at line ends instead of legends; ≤6 muted categorical colors;
  the highlight pattern (all series gray, ONE colored); small multiples over tabs;
  annotations on the data as first-class content.
- **Dies when:** rainbow categorical palettes; 3D anything; dual y-axes; donut charts
  with more than 3 slices; a legend forcing eye ping-pong.

## Choosing under uncertainty

If the brief names no direction: match the product's *material* (what the product is made
of — text? numbers? images? code?) and set the boldness dial by surface type
(`process.md` §1). When two directions fit, pick the one you did NOT use last time —
and since a fresh session has no "last time", check the project's `memory/` for a design
record; absent one, treat your training favorites (dark theme, electric blue, monospace)
as already used and derive from the subject (`taste.md` §7). After shipping, record the
chosen direction + accent in project memory so the next session has a record.
