# Blind Box Reveal — Spin Again + Box Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the blind-box reveal screen the end of the flow — add a "Spin Again" action and a remaining-boxes counter, and delete the separate `placed` confirmation screen.

**Architecture:** All changes live in one component, `BlindBoxReveal.jsx`, plus its CSS. The `placed` phase and `shipped` state are removed; the `revealed` screen gains a third button and three dedicated handlers (`keepDigital`, `shipWhale`, `spinAgain`). A counter pill is added to the modal topbar, derived from a snapshot of the bound purchase group taken when the modal opens.

**Tech Stack:** React 18, plain CSS with CSS variables, lucide-react icons, Vite 5. No test framework in this repo — verification is via `yarn build` and manual browser checks per `CLAUDE.md`.

---

### Task 1: Remove the `placed` phase and split the placement handler

**Files:**
- Modify: `src/components/BlindBoxReveal.jsx`

- [ ] **Step 1: Add `openDrawer` to the context destructure**

In `BlindBoxReveal.jsx` line 98, change:

```jsx
const { revealOpen, revealBoxId, closeReveal, collect, purchases } = useLucki()
```

to:

```jsx
const { revealOpen, revealBoxId, closeReveal, collect, openDrawer, purchases } =
  useLucki()
```

- [ ] **Step 2: Update the phase comment and remove the `shipped` state**

Change the phase comment on line 100 from:

```jsx
  // idle | ready | spinning | suspense | opening | revealed | shipping | placed
```

to:

```jsx
  // idle | ready | spinning | suspense | opening | revealed | shipping
```

Delete line 108 entirely:

```jsx
  const [shipped, setShipped] = useState(false) // how the last box was placed
```

- [ ] **Step 3: Remove the `shipped` reset in the close cleanup**

In the `useEffect` that resets state when the modal closes, delete this line (line 153):

```jsx
      setShipped(false)
```

(Keep `setOpenedCount(0)` and the surrounding resets.)

- [ ] **Step 4: Replace `placeWhale` with three handlers**

Replace the entire `placeWhale` callback (lines 188-199, the block starting with the `// Place the just-pulled whale` comment) with:

```jsx
  // Keep the pulled whale as a digital collectible, then exit to the
  // inventory drawer — the reveal flow ends here.
  const keepDigital = useCallback(() => {
    if (!winnerKey) return
    collect(winnerKey, { shipping: false })
    openDrawer('inventory')
    closeReveal()
  }, [winnerKey, collect, openDrawer, closeReveal])

  // Submit shipping details for a physical whale, then close the reveal.
  const shipWhale = useCallback(
    (shippingDetails) => {
      if (!winnerKey) return
      collect(winnerKey, { shipping: true, shippingDetails })
      closeReveal()
    },
    [winnerKey, collect, closeReveal],
  )

  // Keep this whale digitally and immediately draw the next box in the run.
  const spinAgain = useCallback(() => {
    if (!winnerKey) return
    collect(winnerKey, { shipping: false })
    setOpenedCount((n) => n + 1)
    startBox()
  }, [winnerKey, collect, startBox])
```

- [ ] **Step 5: Drop `placed` from the focus effect**

In the focus-management effect, change line 232 from:

```jsx
    else if (phase === 'revealed' || phase === 'placed') actionRef.current?.focus()
```

to:

```jsx
    else if (phase === 'revealed') actionRef.current?.focus()
```

- [ ] **Step 6: Verify it still builds (placed screen now references removed handler)**

Run: `yarn build`
Expected: build will FAIL or warn because the JSX still calls `placeWhale` and renders the `placed` block — that is fixed in Task 2. If `yarn build` fails here, that is expected; proceed to Task 2 before committing.

---

### Task 2: Rework the reveal-screen actions and remove the `placed` block

**Files:**
- Modify: `src/components/BlindBoxReveal.jsx`

- [ ] **Step 1: Replace the box-progress derived values with counter values**

Replace the `packSize` / `startRemaining` / `boxNumber` / `hasMore` block (lines 246-249) with:

```jsx
  const startRemaining = group?.startRemaining || 1
  // Boxes still sealed in this run, not counting the one on screen now.
  const boxesLeft = Math.max(startRemaining - openedCount - 1, 0)
  const hasMore = boxesLeft > 0
  const counterLabel = hasMore
    ? `${boxesLeft} ${boxesLeft === 1 ? 'box' : 'boxes'} left`
    : 'Last box'
```

- [ ] **Step 2: Remove the `boxLabel` prefix and `placed` status line**

Replace the status block (lines 251-259) with:

```jsx
  let status = 'Lucki Blind Box Series 01'
  if (phase === 'ready') status = 'Tap spin to draw your whale'
  else if (phase === 'spinning') status = `Drawing from the deck · ${remaining} remain`
  else if (phase === 'suspense') status = 'Your luck is sealed'
  else if (phase === 'revealed' && winner) status = `${winner.label} pulled`
  else if (phase === 'shipping') status = 'Shipping details'
```

- [ ] **Step 3: Replace the `revealed` action buttons**

In the `phase === 'revealed'` block, replace the `<div className="reveal__actions">` block (lines 346-362) with:

```jsx
            <div className="reveal__actions">
              <button
                type="button"
                className="btn btn--line btn--sm"
                onClick={keepDigital}
                ref={actionRef}
              >
                Keep Digital
              </button>
              <button
                type="button"
                className="btn btn--gold btn--sm"
                onClick={() => setPhase('shipping')}
              >
                Ship It to Me <span aria-hidden="true">→</span>
              </button>
              {hasMore && (
                <button
                  type="button"
                  className="btn btn--line btn--sm"
                  onClick={spinAgain}
                >
                  Spin Again <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
```

- [ ] **Step 4: Point the shipping form at `shipWhale`**

In the `phase === 'shipping'` block, change the `ShippingForm` `onSubmit` (line 372) from:

```jsx
              onSubmit={(details) => placeWhale(true, details)}
```

to:

```jsx
              onSubmit={shipWhale}
```

- [ ] **Step 5: Delete the entire `placed` JSX block**

Remove the whole `{phase === 'placed' && winner && ( ... )}` block (lines 378-410), from `{phase === 'placed' && winner && (` through its closing `)}`.

- [ ] **Step 6: Verify the build passes**

Run: `yarn build`
Expected: PASS — production build succeeds with no errors. `placeWhale` and `shipped` are no longer referenced. `counterLabel` is defined but not yet consumed until Task 3 — that is fine, Vite does not error on unused variables.

- [ ] **Step 7: Commit**

```bash
git add src/components/BlindBoxReveal.jsx
git commit -m "feat: reveal screen ends the flow with spin-again and direct exits

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Add the remaining-boxes counter

**Files:**
- Modify: `src/components/BlindBoxReveal.jsx`
- Modify: `src/components/BlindBoxReveal.css`

- [ ] **Step 1: Import the `Package` icon**

Change line 2 of `BlindBoxReveal.jsx` from:

```jsx
import { X } from 'lucide-react'
```

to:

```jsx
import { X, Package } from 'lucide-react'
```

- [ ] **Step 2: Add the counter pill to the topbar**

Replace the topbar markup — the `<div className="reveal-modal__topbar">` block (lines 269-285) — with:

```jsx
      <div className="reveal-modal__topbar">
        <div className="reveal-modal__brand">
          <span className="lucki-mark reveal-modal__mark">LUCKI</span>
          <span className="reveal-modal__status" aria-live="polite">
            {status}
          </span>
        </div>
        <div className="reveal-modal__topbar-end">
          <span className="reveal-modal__counter" aria-live="polite">
            <Package size={13} strokeWidth={2} aria-hidden="true" />
            <strong>{counterLabel}</strong>
          </span>
          <button
            type="button"
            className="reveal-modal__close"
            onClick={closeReveal}
            ref={closeRef}
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
            Close
          </button>
        </div>
      </div>
```

- [ ] **Step 3: Add the counter CSS**

In `BlindBoxReveal.css`, after the `.reveal-modal__close` rules (after the `.reveal-modal__close:hover` block that ends around line 61), add:

```css
.reveal-modal__topbar-end {
  display: flex;
  align-items: center;
  gap: 12px;
}
.reveal-modal__counter {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid rgba(212, 179, 90, 0.22);
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-dim);
  white-space: nowrap;
}
.reveal-modal__counter strong {
  font-weight: 600;
  color: var(--gold);
}
```

- [ ] **Step 4: Verify the build passes**

Run: `yarn build`
Expected: PASS — production build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/BlindBoxReveal.jsx src/components/BlindBoxReveal.css
git commit -m "feat: show remaining-boxes counter in reveal topbar

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Remove the dead `placed` CSS

**Files:**
- Modify: `src/components/BlindBoxReveal.css`

- [ ] **Step 1: Delete the `Placed phase` CSS section**

In `BlindBoxReveal.css`, delete the entire trailing section (lines 278-295), from the comment `/* ── Placed phase ──...` through the closing brace of `.reveal__placed-msg`:

```css
/* ── Placed phase ────────────────────────────────────────────────── */
.reveal__placed {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  animation: reveal-in 0.6s ease-out;
}
.reveal__placed-msg {
  font-family: var(--display);
  font-size: 18px;
  color: var(--ink-dim);
  max-width: 320px;
}
```

- [ ] **Step 2: Verify the build passes**

Run: `yarn build`
Expected: PASS — production build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/BlindBoxReveal.css
git commit -m "chore: drop unused placed-phase styles

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Manual end-to-end verification

**Files:** none — manual verification in the browser.

- [ ] **Step 1: Start the dev server**

Run: `yarn dev`
Expected: starts with zero warnings.

- [ ] **Step 2: Buy a multi-box pack and open it**

In the browser, buy a 3-pack (or Mega Box) blind box, complete the dummy checkout, and open the reveal modal from the inventory.
Expected: the topbar shows a counter pill (e.g. `2 boxes left` for a 3-pack on the first box). No "Box N of 8" text appears in the status line.

- [ ] **Step 3: Verify "Spin Again"**

On the reveal screen, tap **Spin Again**.
Expected: the just-pulled whale is added to the collection (toast appears), the next box draws immediately, and the counter decrements by one. On the final box, the Spin Again button is absent and the counter reads `Last box`.

- [ ] **Step 4: Verify "Keep Digital"**

On a reveal screen, tap **Keep Digital**.
Expected: the whale is added to the collection, the reveal modal closes, and the inventory drawer opens showing the new whale.

- [ ] **Step 5: Verify "Ship It to Me"**

On a reveal screen, tap **Ship It to Me**, fill the shipping form, and submit.
Expected: the whale is recorded as shipping (toast appears), and the reveal modal closes with no inventory drawer.

- [ ] **Step 6: Verify a single-box purchase**

Buy and open a single (1-box) blind box.
Expected: the counter reads `Last box`, and only **Keep Digital** and **Ship It to Me** are shown — no Spin Again.

---

## Self-Review Notes

- **Spec coverage:** phase removal (Task 1–2), three reveal actions (Task 2), counter pill (Task 3), dead CSS removal (Task 4) — all spec sections mapped.
- **Type consistency:** `keepDigital`, `shipWhale`, `spinAgain` are defined once in Task 1 and consumed in Task 2. `boxesLeft` / `hasMore` / `counterLabel` are defined in Task 2 Step 1; `hasMore` is consumed in Task 2 Step 3 (Spin Again gate) and `counterLabel` in Task 3 Step 2 (topbar pill). The derived-value redefinition happens before the Spin Again button is added, so the button is always gated on the counter-aware `hasMore`.
- **Build-only verification:** this repo has no test runner; `yarn build` plus the Task 5 manual checks are the verification path defined by `CLAUDE.md`.
