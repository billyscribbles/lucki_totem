# Blind Box — Odds Legend + Black/Pink in the Box Mix

**Date:** 2026-05-16
**Status:** Implemented — 2026-05-16

## Goal

Two changes to the blind-box unboxing experience (`BlindBoxReveal`):

1. **Odds legend** — a side panel on the reveal modal that lists every rarity
   tier and its drop chance (%), visible the whole time the modal is open.
2. **Box mix** — add the pink (Rose / Super Rare) and black (Noir / Secret
   Rare) tiers to the visible box lineup that spins on stage.

## Background

- The reveal modal (`src/components/BlindBoxReveal.jsx`) is a full-screen
  overlay. Its stage runs through phases: `ready → spinning → suspense →
  opening → revealed`, plus `shipping`/`placed`.
- `pickWinner()` in `src/lib/draw.js` already draws from **all 7 tiers**
  (it iterates `RARITIES`), so Rose and Noir already *can* be won. The
  actual odds are not changing.
- `BOX_LINEUP` in `src/lib/draw.js` is the **cosmetic** set of boxes shown
  spinning on stage. Today it is 8 boxes — `common×3, uncommon×2, rare,
  ultra, legend` — and deliberately omits Rose and Noir. "Add black and
  pink into the mix" means adding them to `BOX_LINEUP`.
- `RARITIES` (`src/data/rarities.js`) is the single source of truth for
  tier `label`, `color`, `glow`, and `odds` (a display string like `'7%'`).

## Feature A — Odds legend

### Component

New self-contained component **`src/components/OddsLegend.jsx`** + **`OddsLegend.css`**,
kept separate so `BlindBoxReveal` stays focused.

**Props:**
- `winnerKey` — the drawn tier's key, or `null`.
- `revealed` — boolean; `true` once the prize is being shown.

**Render:** maps all 7 `RARITIES` in order. Each row shows: a color swatch
(the tier's `color`), the tier `label`, and the `odds` string. A `<aside>`
with `aria-label="Rarity drop odds"` and a `"Drop Odds"` title.

**Winner highlight:** when `revealed` is `true`, the row whose `key` matches
`winnerKey` gets a `--win` modifier — a glowing border and a slight scale,
driven by that tier's `color` / `glow` set as `--r` / `--r-glow` CSS vars on
the row. Other rows are unaffected.

### Visibility

Always visible — rendered as a direct child of the stage for every phase
(`ready`, `spinning`, `suspense`, `opening`, `revealed`, `shipping`,
`placed`). It is purely informational and does not gate on phase.

### Layout change to `BlindBoxReveal`

`.reveal-modal__stage` currently is `display: grid; place-items: center`
and is the positioning context for the absolutely-positioned aura, spin
button, and caption.

Restructure:

- `.reveal-modal__stage` becomes `display: grid; grid-template-columns: auto 1fr`
  (no padding, no `place-items`, no `overflow`).
- **Column 1:** `<OddsLegend>`.
- **Column 2:** a new wrapper `<div className="reveal__stage-main">` that
  contains *all* the current stage children (aura, lineup, caption, spin
  button, prize, ship, placed). This wrapper takes over the old stage
  styles: `position: relative; display: grid; place-items: center;
  overflow: hidden; padding: 32px`. The `stageStyle` (`--r` / `--r-glow`)
  moves from the stage onto this wrapper.

This keeps the centered prize and the absolutely-positioned spin
button/caption centered within the **content area**, not skewed by the
legend's width.

### Mobile (≤600px)

The stage grid flips to rows: `grid-template-columns: 1fr; grid-template-rows: auto 1fr`.
The legend collapses to a compact **horizontal strip** directly under the
topbar — color swatch + odds % per tier, wrapping/scrolling as needed. No
vertical side panel on narrow screens. The tier label may be dropped on
mobile to keep the strip compact (swatch + % only).

### Styling

Plain CSS using existing theme tokens only — `var(--mono)`, `var(--ink-dim)`,
`var(--ink-mute)`, `var(--gold)`, `var(--line)`, `var(--panel)`, radii, etc.
No new design tokens. The panel border uses the same faint gold seam as the
topbar (`rgba(212, 179, 90, 0.12)`), consistent with `BlindBoxReveal.css`.

## Feature B — Black + pink in the box lineup

### `BOX_LINEUP`

In `src/lib/draw.js`, add `'rose'` and `'noir'` in rarity order:

```js
export const BOX_LINEUP = [
  'common', 'common', 'common',
  'uncommon', 'uncommon',
  'rare', 'rose', 'ultra', 'noir', 'legend',
]
```

10 boxes total. Update the leading comment from "8 boxes" accordingly.

### `POOF_GAPS` — required extension

`startSpin` poofs every non-winner box and reads `POOF_GAPS[n]` for each.
With 8 boxes there were 7 non-winners and `POOF_GAPS` had 7 values. With
10 boxes there are **9 non-winners** — `POOF_GAPS` must grow to 9 values,
or `POOF_GAPS[n]` is `undefined` for `n ≥ 7` and produces `NaN` timers.

New value (9 entries), preserving the steep wind-down and the dramatic
final two values:

```js
export const POOF_GAPS = [300, 340, 410, 500, 620, 780, 980, 1410, 900]
```

No other change is needed: `SPIN_DECAY_END_MS` and `spinVelocity()` derive
the decay window from `POOF_GAPS` automatically, so the spin velocity
curve adapts to the longer sequence.

### Lineup rendering

`.reveal__lineup` is `flex-wrap: wrap` and `justify-content: center`, so 10
boxes simply wrap. No layout code change. The narrower content column
(legend takes the left) means slightly more wrapping — acceptable.

## Out of scope

- Drop odds / weights are **not** changing.
- The `placed`/`shipping` flow is untouched (the separate spin-again plan
  is independent of this work).
- Server-side draw hardening (already noted as future work in `draw.js`).

## Verification

Per `CLAUDE.md`, this repo has no test runner; verification is `yarn build`
plus manual browser checks:

1. `yarn build` succeeds with no errors.
2. Open the reveal modal: legend panel shows all 7 tiers with swatches and
   odds, on the left, in rarity order.
3. Legend stays visible through ready → spinning → revealed → shipping.
4. On reveal, the won tier's row highlights with its color glow.
5. Spin a box: 10 boxes appear; all 9 non-winners poof smoothly with no
   stutter or stuck box; the survivor opens. (Confirms `POOF_GAPS` fix.)
6. At 375px the legend is a horizontal strip under the topbar, no side
   panel, stage content not cramped off-screen.
