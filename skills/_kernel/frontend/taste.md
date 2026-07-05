# Taste — what separates striking from mediocre

Taste is not adding beauty. It is making decisions where the default makes none, then
executing a few decisions completely. A clean, competent, forgettable page is a FAILURE
under this bundle — mediocrity is the attractor you actively escape, not a safe harbor.

## 1 · Know the default attractor (you produce it when not deciding)

Left undirected, every model emits the same page: Inter/system font, purple-to-blue
gradient hero, three glassy cards with rounded corners and a soft shadow, emoji in
headings, everything centered, a ✨ somewhere. That is not a style — it is what NO
decision looks like, and readers pattern-match it in one second as "another one of those".

**The swap test:** could this design be moved onto an unrelated product unchanged?
If yes, you haven't designed yet — you've templated.

> ✅ A monitoring tool whose entire identity is giant amber tabular numerals on blue-black.
> ❌ The same tool with a gradient hero and three feature cards — indistinguishable from a
> CRM, a crypto site, or a todo app.

## 2 · One idea, executed completely

Choose one governing idea — a typographic gesture, a color story, a structural inversion —
and push it to its limit. Everything else stays quiet and systematic. Budget: ~95% of the
surface is calm; ≤5% carries the identity. Hedging (a bit of gradient, a bit of glass, a
bit of animation) reads as a template even when each bit is individually fine.

> ✅ Editorial landing: one 120px serif headline, hairline rules, cream paper. The headline
> IS the design; buttons and body are near-invisible ink-on-paper.
> ❌ Five good ideas at 20% volume each — glass nav + gradient hero + brutalist cards +
> neon accents. Each fine somewhere; together, noise.

## 3 · Typography does the heavy lifting

Reach for scale, weight, and case before color, shadow, or decoration. **The 4× rule:**
display ≥ 4× body at desktop widths (16px body → 64px+ display; small viewports may land
nearer 3× via the clamp in `craft.md` §1), or the hierarchy is timid. If the
surface can't take big type, push one other axis hard instead — weight (400 vs 800) or
case — not all of them a little. Numerals are display material: metrics, prices, and dates
set huge in tabular figures are the cheapest premium move on any data product.

> ✅ Black-on-white pricing page, price at 96px with `font-variant-numeric: tabular-nums`,
> plan names in 12px letter-spaced caps — looks expensive with zero color.
> ❌ Hierarchy attempted with four shades of gray between 14 and 18px — squint and it's mush.

## 4 · Emphasis is a budget

Every bold weight, colored word, filled background, shadow, and animation spends from one
shared budget. Spent everywhere = hierarchy nowhere. Before adding an emphasis, name which
existing emphasis you're demoting to pay for it.

> ✅ One accent color appearing exactly three times on the page: logo mark, primary CTA,
> one key stat. That's what visitors remember.
> ❌ Colored icons on every feature, a badge on every card, three button styles per view.

## 5 · Signature moves — where "eye-catching" comes from

The formula: **break ONE expectation cleanly, and be MORE disciplined than expected
everywhere else.** The break draws the eye; the surrounding discipline is what makes it
read as intent instead of accident. Moves that reliably work (on expressive surfaces —
see `process.md` §1 for where these belong):

- **Scale inversion** — one element at 10× expected size: a numeral, an ampersand, the word "free".
- **Exposed structure** — visible grid lines, coordinates, section numbers (`01 —`), rulers. Blueprint honesty.
- **Hard shadow** — `4px 4px 0 #000` offset instead of blur. Instantly non-default.
- **Type as image** — a headline cropped by the viewport, overlapping a photo, or set vertical.
- **Single-hue commitment** — the whole page in one hue family plus ink and paper.
- **Data as hero** — a real chart, terminal, or log stream as the hero instead of an illustration.
- **The huge footer** — a 200px wordmark as the last thing seen. Oddly memorable.
- **One rotated element** — a stamp, a sticker, one tilted label. Exactly one.

Pick ONE per surface. Two is an expert maybe. Three cancel each other out.

## 6 · Break visual convention, never interaction grammar

Aesthetic risk is welcome exactly where the user's control isn't taxed. Giant type, raw
borders, strange palettes: yes. Scroll-hijacking, hidden navigation, unlabeled icon mazes,
cursor replacement, disabled zoom: never — the user pays for those with control, and no
aesthetic covers that debt.

> ✅ A marquee banner (decorative, ignorable) on an otherwise normally-scrolling page.
> ❌ A scroll-jacked horizontal "experience" where the browser's back button breaks.

## 7 · Vary the signature, keep the discipline

Any move repeated every time becomes your new slop — one level up. If your last three
surfaces used the same accent hue or the same trick, the fourth must draw from elsewhere.
A fresh session has no memory of "last time": check the project's `memory/` for a design
record; absent one, treat your training-prior favorites (dark + electric blue +
monospace) as already used. Derive accent and mood from the SUBJECT — the product's
domain, era, material, culture — and after shipping, record the chosen direction +
accent in project memory.

> ✅ Fintech → engraved-banknote green and security-print hairlines; music tool → chromatic
> excess; legal tool → paper, ink, one seal-red.
> ❌ Electric blue + dark mode + monospace for the fourth unrelated product in a row.

## 8 · To improve, subtract or enlarge — never first add

When a design feels weak, the weak instinct is to add (a background, a border, an icon, a
gradient). Work this ladder in order instead: **more space → bigger scale contrast →
stronger weight contrast → simpler structure → then color → effects last.** Nine of ten
"meh" designs are fixed on the first two rungs.

> ✅ Dead-feeling section → double its padding, triple the heading size. Fixed.
> ❌ Dead-feeling section → add a gradient background and a floating blob. Now it's dead AND noisy.
