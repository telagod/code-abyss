# Garbage — the anti-catalog: signals, why, fixes

Garbage design is rarely ugliness. It is **defaults shipped as decisions and effects
substituted for choices**. Every entry below is observable — you can point at it in the
CSS or a screenshot. Use this file as a review checklist (`process.md` §5) and as the
vocabulary for critiquing any design, yours or anyone's.

## A · Identity garbage

1. **The slop uniform.** Purple-to-blue gradient hero, three glass cards `rounded-2xl
   shadow-lg`, emoji in headings, ✨, everything centered, Inter everywhere.
   *Why:* it is the statistical average of the web — the absence of decisions.
   *Fix:* write the concept sentence (`process.md` §2); pick a direction from `styles.md`.
2. **Corporate Memphis & stock decoration.** Flat bendy-armed people, generic 3D blob
   mascots, undraw-style clip art. *Why:* borrowed friendliness; announces "template".
   *Fix:* show the real thing — product UI, data, typography — or nothing.
3. **Trend cosplay.** Glassmorphism over a solid background (nothing to blur); neumorphism
   anywhere (contrast disaster); particle/starfield backgrounds; tilt-on-hover cards.
   *Why:* the effect's justifying mechanism is absent — decoration with no referent.
   *Fix:* every effect must answer "what does this communicate?" or be deleted.

## B · Hedging garbage (the mediocrity engine)

4. **No system.** 3+ fonts, 5+ colors, two shadow languages, four radii on one page.
   *Why:* reads amateur instantly; nothing repeats, so nothing feels intentional.
   *Fix:* tokens first (`process.md` §3); one of each per `craft.md`.
5. **Even emphasis.** Every section a tinted background, every card a shadow, bold
   sprinkled everywhere. *Why:* emphasis spent everywhere buys hierarchy nowhere.
   *Fix:* `taste.md` §4 — demote before you add.
6. **Off-scale values.** Paddings of 13/18/22px; `#777`, `#888`, `#999` coexisting; a
   lone 15px font. *Why:* each is a decision nobody made. *Fix:* only token values exist.

## C · Legibility garbage

7. **Contrast crimes.** Body text under 4.5:1 (`#999` on white is 2.8:1); thin weights
   below 16px; long passages in ALL CAPS. *Why:* "elegant" that can't be read is failed
   design, full stop. *Fix:* floors in `craft.md` §9 — check, don't eyeball.
8. **Text over busy images with no scrim.** *Fix:* `linear-gradient(transparent,
   rgb(0 0 0 / .6))` behind it, or move the text.
9. **Type crimes.** Justified text on the web (rivers); letter-spacing on lowercase body;
   fake small-caps; centered multi-paragraph body text. *Fix:* `craft.md` §1.

## D · Depth & effect garbage

10. **Shadow soup.** `box-shadow` on every card at full strength. *Why:* if everything
    floats, nothing does — elevation must encode z-order meaning. *Fix:* ≤3 levels
    (`craft.md` §4); borders for structure, shadows for things that float.
11. **Dirty shadows.** Pure-black high-opacity shadows read as grime, not depth.
    *Fix:* low opacity (≤10%), hue-tinted, two-layer.
12. **Gradient wallpaper.** Decorative blobs and glows unrelated to content or any light
    logic. *Fix:* gradients are either subtle (2–6% lightness shift on a large surface)
    or THE committed concept (duotone) — never ambience filler.

## E · Motion garbage

13. **Everything fades up on scroll** at 600ms+. *Why:* ceremony that taxes every visit;
    by the second visit it's rage. *Fix:* animate the hero once, or nothing (`craft.md` §6).
14. **Slow or misplaced hover.** 400ms hover transitions; hover effects on non-clickables.
    *Fix:* hover feedback ≤150ms; only interactive elements respond.
15. **Interaction vandalism.** Scroll-hijacking, autoplay with sound, laggy custom
    cursors, carousels holding critical content, disabled zoom. *Why:* `taste.md` §6 — the
    user pays with control. *Fix:* never; no aesthetic justifies it.
16. **Spinner flash.** A spinner for a <300ms operation. *Fix:* show nothing until
    ~200ms, then a skeleton — not a strobe.

## F · Dark mode garbage

17. **Inversion darkness.** Pure `#000` bg, pure `#FFF` text, the same saturated brand
    colors now vibrating. *Why:* dark UIs are built, not filtered. *Fix:* `craft.md` §7.

## G · Craft-tell garbage (the small things that shout)

18. **Focus outline removed, nothing replacing it.** An aesthetic crime and an a11y crime
    in one line of CSS. *Fix:* style `:focus-visible`, never delete it.
19. **Layout shift.** Font flash, images without dimensions, content jumping on load —
    motion nobody chose. *Fix:* `craft.md` §8.
20. **Unintentional defaults.** Default-blue links, mixed icon sets/stroke widths, native
    controls inside an otherwise styled page. *Why:* the tell is unintentionality —
    deliberate anti-design is an expert move that must look obviously deliberate.
21. **Emoji as UI chrome.** Emoji in headings, buttons, bullets, empty states.
    *Fix:* emoji belong to user content only; use a consistent icon set or a real glyph.

## The meta-signal

Every entry above reduces to one failure: **an effect was added where a decision was
needed.** When you catch yourself reaching for an addition, stop and climb the subtraction
ladder first (`taste.md` §8).
