# Blind Box Reveal — Spin Again + Box Counter

**Date:** 2026-05-16
**Scope:** `src/components/BlindBoxReveal.jsx`, `src/components/BlindBoxReveal.css`

## Goal

The reveal screen (`revealed` phase) is the end of the flow. Add a "Spin Again"
action and a counter showing remaining unopened boxes. Remove the separate
"added to collection" confirmation (`placed`) screen entirely.

## Current behaviour

After the box opens, the `revealed` screen offers **Keep Digital** and **Ship It
to Me**. Both route to a `placed` confirmation screen, which then offers **Spin
Again** or **Done**. The topbar status carries a `Box N of 8` prefix for
multi-pack runs.

## Target behaviour

### Phases

Drop the `placed` phase and the `shipped` state. Phases become:
`idle | ready | spinning | suspense | opening | revealed | shipping`.

### Reveal screen actions

The `revealed` screen carries three buttons:

| Button | Behaviour |
|---|---|
| **Spin Again** | Collects the current whale as digital, increments `openedCount`, then calls `startBox()` to draw the next box. Rendered only while boxes remain in the run. |
| **Keep Digital** | Collects the current whale as digital, opens the inventory drawer, closes the reveal. |
| **Ship It to Me** | Routes to the `shipping` phase. On form submit, collects the whale with shipping details, then closes the reveal (no inventory drawer). |

"Spin Again" and "Keep Digital" both keep the whale digitally — the difference
is *continue the run* vs *exit to inventory*.

### Box counter

A pill in the modal topbar, positioned left of the Close button, visible across
all phases. It shows the remaining unopened boxes for the current run:

- `6 boxes left`, `1 box left` (singular), `Last box` on the final box.
- Value = `startRemaining - openedCount - 1`, where `startRemaining` is the
  snapshot of the bound group's `remaining` taken when the modal opens, and
  `openedCount` ticks up on each Spin Again.
- For a single-box run this evaluates to `Last box`.

This counter replaces the `Box N of 8` prefix in the topbar status line.

## Implementation notes

- `placeWhale(shipping, details)` splits into three handlers: `keepDigital()`,
  `shipWhale(details)`, and `spinAgain()`. Each calls `collect(...)`; only
  `spinAgain()` increments `openedCount` and calls `startBox()`.
- `keepDigital()` calls `openDrawer('inventory')` then `closeReveal()`.
  `openDrawer` is already exposed by `useLucki()`.
- `hasMore` becomes `startRemaining - openedCount - 1 > 0`, evaluated on the
  `revealed` screen (before the current whale is collected).
- Status messages: remove the `boxLabel` prefix; the `placed` status line is
  deleted with the phase.
- Focus management: the `placed` branch in the focus effect is removed;
  `actionRef` still targets the primary action on `revealed`.
- CSS: add a `.reveal-modal__counter` pill rule; remove `.reveal__placed`,
  `.reveal__placed-orb`, `.reveal__placed-msg` and related rules.

## Out of scope

- Closing the modal mid-`revealed` still abandons the uncollected whale — this
  is existing behaviour and unchanged.
- The counter is scoped to the current run's bound group, not the global
  sealed-box total.
