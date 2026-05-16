# Pay-First Buy & Unbox Loop — Design

**Date:** 2026-05-16
**Status:** Approved

## Goal

Rework the LUCKI shopping/collecting loop so the user must pay before
unboxing. New flow:

1. User selects a product → cart drawer opens.
2. Cart → Checkout → a (dummy) card-payment step. Payment is mandatory.
3. On payment success, purchased boxes land in inventory as **sealed**
   (unopened) box groups.
4. From inventory the user enters **unboxing mode** for a box group.
5. Each spin reveals a whale; the user may **Keep digital** or **Ship it**
   (a dummy shipping form).

## Approach

Approach B — a dedicated full-screen `CheckoutOverlay`, with the existing
`InventoryDrawer` and `BlindBoxReveal` extended. `CartDrawer` stays lean.
No new routes — the app remains a single-scroll site (router exists only
for the 404).

## Data Model

### `src/data/products.js`

Add an explicit `packSize` to each `FEATURED` product:

- `blind-box-s01` → `1`
- `blind-box-3pack` → `3`
- `blind-box-5pack` → `5`
- `blind-box-megabox` → `8`

### `src/store/LuckiContext.jsx`

The single `inventory` array splits into two, both persisted to
localStorage under `STORE_KEY`:

- **`purchases`** — sealed box groups. Each cart line item becomes one
  group:
  `{ id, productId, name, sub, orb, packSize, remaining, purchasedAt }`.
  `remaining` starts equal to `packSize` and decrements as boxes are
  opened. A group with `remaining === 0` is dropped.
- **`collection`** — opened whales:
  `{ id, serial, rarityKey, whale, date, shipping, shippingDetails }`.
  `shippingDetails` is `null` unless the whale was shipped.

New overlay state:

- `checkoutOpen` — boolean, the `CheckoutOverlay` visibility.
- `revealBoxId` — id of the `purchases` group the reveal is currently
  working through (`null` when the reveal is closed).

`drawer` stays `'cart' | 'inventory' | null`.

The page-scroll lock must also account for `checkoutOpen`.

### Persistence migration

A returning user may have an old `lucki:v1` payload with an `inventory`
key. `loadPersisted()` ignores unknown keys and defaults `purchases` and
`collection` to `[]`. No data is migrated — acceptable for a demo site.

## Components

### `CheckoutOverlay.jsx` / `.css` (new)

Full-screen overlay reusing the shell, focus-trap and Escape-to-close
pattern from `BlindBoxReveal`. Mounted at app level in `App.jsx`.

Phases:

- **`form`** — order summary (line items + total) plus a card form:
  card number, expiry (`MM/YY`), CVC, name on card. **Format-only
  validation** — card-number length, `MM/YY` shape, 3-digit CVC. No real
  charge. Invalid fields show inline errors; the Pay button is blocked
  until the form is valid.
- **`processing`** — a fake processing spinner (~1.5 s).
- **`success`** — "Payment successful", order recap, and two buttons:
  - **"Open a Box Now"** → closes checkout, opens the reveal on the
    first purchased group.
  - **"Go to Inventory"** → closes checkout, opens the inventory drawer.
  On entering this phase: the cart is cleared and each cart line item is
  pushed into `purchases` as a sealed group.

### `CartDrawer.jsx` (edited)

- "Checkout →" calls `openCheckout()` instead of `openReveal()`.
- The "Skip — Open Box Now" button is **removed** (payment is now
  mandatory).

### `InventoryDrawer.jsx` (restructured)

Two sections inside the drawer:

- **Sealed** — one card per `purchases` group, showing a `×N` counter
  badge (`remaining`) and an **"Open Box"** button → `openReveal(group.id)`.
- **Collection** — opened whales, newest first, using the existing row
  UI; a "Shipping" tag appears on shipped whales.

Empty-state copy adapts: shown only when both sections are empty.

### `BlindBoxReveal.jsx` / `.css` (extended)

Opened via `openReveal(boxId)` and bound to one `purchases` group.

- The top bar shows a **"Box X of N"** counter derived from the group's
  `packSize` and `remaining`.
- Per-box phases stay: `ready → spinning → suspense → opening →
  revealed`, then new phases below.
- At **`revealed`** the whale offers two choices:
  - **"Keep digital"** → whale pushed to `collection` with
    `shipping: false`.
  - **"Ship it →"** → enters the **`shipping`** phase.
- **`shipping`** phase — a form: full name, address line 1, address
  line 2 (optional), city, state/province, postal code, country.
  Dummy, light validation (required fields non-empty). Submit → whale
  pushed to `collection` with `shipping: true` and `shippingDetails`,
  then a confirmation is shown.
- After either choice the group's `remaining` decrements by one.
  - If `remaining > 0` → a **"Spin Again"** button resets the modal to
    `ready` for the next box; the "Box X of N" counter updates.
  - If `remaining === 0` → a **"Done"** button closes the modal. The
    group is now gone from the Sealed section.

### `App.jsx` (edited)

Mount `<CheckoutOverlay />` alongside the other app-level overlays.

## Store API Changes

- `openCheckout()` / `closeCheckout()` — new.
- `openReveal(boxId)` — now takes a purchase-group id.
- `collect(rarityKey, { shipping, shippingDetails })` — now also
  decrements the active `purchases` group's `remaining` and pushes to
  `collection` instead of the old `inventory`.
- New helpers as needed: a payment-success action that moves `cart`
  into `purchases`.

## End-to-End Flow

```
select product
  → cart drawer
  → Checkout
  → CheckoutOverlay: card form → processing → success
  → (Open a Box Now | Go to Inventory)
  → InventoryDrawer Sealed section: box groups with ×N badge
  → Open Box
  → BlindBoxReveal: spin → whale revealed
  → Keep digital  OR  Ship it → shipping form
  → Spin Again (×N until remaining 0) → Done
  → opened whales appear in InventoryDrawer Collection section
```

## Out of Scope

- Real payment processing or a real shipping backend — both are dummy.
- Server-side draw (the existing client-side `pickWinner()` note in
  `draw.js` still applies).
- Migrating any pre-existing localStorage `inventory` data.
