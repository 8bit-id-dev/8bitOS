# 8bitOS UI/UX Design System (Doc 04)

**Status:** Design system — re-captured at session restart
**Date:** 2026-09-03
**Source:** Original Doc 04 (Pixel Minimalist + Stylus First Edition) provided by user

## Design direction

"Minimal Pixel Productivity OS for Teachers" — modern B&W with retro-futuristic pixel character, professional for teachers, stylus-friendly.

Inspirations: retro computer terminal, pixel art modern, e-ink notebook, digital handwriting tablet, Apple Notes + Notion + 8-bit.

## Keywords

Pixel · Minimal · Monochrome · Digital Notebook · Teacher Workspace · Handwriting Friendly · Precision

## Typography

- **Pixel font for identity:** Pixelify Sans (UI, headings, labels, status, logo). Weight 500/600/700. Size 14-42px depending on hierarchy. Letter-spacing +2px for display.
- **Reading font for body:** Inter. 16px @ 1.7 line-height.
- **No VT323 / Press Start 2P in Spec 1** (reserved for splash/large display in future).

## Color (strict monochrome per §15)

- `--c-bg: #050505` (or `#000000` per §17)
- `--c-fg: #ffffff`
- `--c-fg-mute: #aaaaaa`
- NO decorative accent colors in Spec 1.

## Icon system

16-bit monochrome, sharp edges, sizes 16/24/32px. Lucide style. No emoji-style icons.

## Button style

Pixel-cut corners (clip-path polygon), no rounded modern. 2px border, hard offset shadow.

## Dashboard concept

"Teacher Command Center" — greeting + next class card + quick actions + recent.

## Assessment Studio, AI Assistant (8bit AI), Launcher Mode

Documented but out of Spec 1 scope.

## Animation

Pixel transition (█░░░ pattern for loading). 150ms fades. No bounce, no color animation.

## Dark mode (default)

- Background `#050505` (or `#000000`)
- Text `#ffffff`
- Secondary `#aaaaaa`

## Final design character

"A pixel-inspired digital workstation where teachers write, teach, assess, and manage their classroom using one device and one stylus."

## Stylus (future, not Spec 1)

Pen Mode overlay (Draw/Select/Text/Eraser/Undo). 2-5px stroke. Pressure-enabled. Medium smoothing. Pixel Paper background with 4px grid at 5% opacity. Handwriting recognition → AI converts to text.
