# Visual Design Patterns for Slides

## Design Principles

Before creating any presentation:

1. **Subject matter** — What is this about? What tone, industry, mood does it suggest?
2. **Branding** — If user mentions company/organization, consider their brand identity.
3. **Match palette to content** — Select colors reflecting the subject. See [palettes.md](palettes.md).
4. **State your approach** — Explain design choices BEFORE writing code.

### Requirements

- ✅ State content-informed design approach BEFORE code
- ✅ Web-safe fonts only: Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact
- ✅ Clear visual hierarchy: size, weight, color
- ✅ Strong contrast, appropriate text sizing, clean alignment
- ✅ Consistent patterns, spacing, visual language across slides

## Geometric Patterns

- Diagonal section dividers instead of horizontal
- Asymmetric column widths (30/70, 40/60, 25/75)
- Rotated text headers at 90° or 270°
- Circular/hexagonal frames for images
- Triangular accent shapes in corners
- Overlapping shapes for depth

## Border & Frame Treatments

- Thick single-color borders (10–20pt) on one side only
- Double-line borders with contrasting colors
- Corner brackets instead of full frames
- L-shaped borders (top+left or bottom+right)
- Underline accents beneath headers (3–5pt thick)

## Typography Treatments

- Extreme size contrast (72pt headlines vs 11pt body)
- All-caps headers with wide letter spacing
- Numbered sections in oversized display type
- Monospace (Courier New) for data/stats/technical
- Condensed fonts (Arial Narrow) for dense info
- Outlined text for emphasis

## Chart & Data Styling

- Monochrome charts with single accent color for key data
- Horizontal bar charts instead of vertical
- Dot plots instead of bar charts
- Minimal gridlines or none
- Data labels directly on elements (no legends)
- Oversized numbers for key metrics

## Layout Innovations

- Full-bleed images with text overlays
- Sidebar column (20–30%) for navigation/context
- Modular grid systems (3×3, 4×4 blocks)
- Z-pattern or F-pattern content flow
- Floating text boxes over colored shapes
- Magazine-style multi-column layouts

## Background Treatments

- Solid color blocks occupying 40–60% of slide
- Gradient fills (vertical or diagonal only)
- Split backgrounds (two colors, diagonal or vertical)
- Edge-to-edge color bands
- Negative space as a design element

## Layout Tips for Charts/Tables

- **Two-column (PREFERRED)** — Header spans full width, two columns below. Text/bullets in one, featured content (chart/table) in the other. Flexbox with unequal widths (e.g., 40/60) optimizes for each content type.
- **Full-slide** — Featured content takes entire slide for maximum impact.
- **NEVER vertically stack** — Don't place charts/tables below text in single column.
