# Collection Page & Whale Detail Pages — Design

**Date:** 2026-05-16
**Status:** Approved (design), pending implementation plan

## Problem

The LUCKI home page has a "View rarity guide →" link in the rarity lineup
section header that currently does nothing. There is also no way to view an
individual whale in detail. We want:

1. Clicking "View rarity guide →" opens a dedicated **Collection page** that
   shows every whale series, one row per series, including a "Coming Soon"
   series rendered as a dashed-outline placeholder.
2. Clicking any whale (on the home lineup or the collection page) opens a
   dedicated **Whale detail page** with a larger image, tier info, and
   written lore.

## Decisions

- The collection view is a **real route**, not a modal. Whale detail pages
  need routes regardless, so routing is in play either way; routes also give
  shareable links and per-page SEO.
- A "collection" means a **whale series**. Series 01 is the row of 5 existing
  whales. The "Coming Soon" collection is Series 02. Blind-box products are
  not collections and do not appear on this page.
- Each whale page shows **written lore** (new copy, specified below) plus the
  existing tier / suit / odds / tagline data.
- Component reuse: the whale card markup currently inlined in
  `RarityLineup.jsx` is extracted into a shared `WhaleCard` component used by
  both the home lineup and the collection page.

## Routes

Added to `src/App.jsx` as direct imports (the site does not lazy-load pages):

| Path             | Component        | Notes                                         |
|------------------|------------------|-----------------------------------------------|
| `/collection`    | `CollectionPage` | One section per collection.                   |
| `/whale/:key`    | `WhalePage`      | `:key` is a rarity key. Unknown key → 404.     |

`:key` is one of: `common`, `uncommon`, `rare`, `ultra`, `legend`. An
unrecognised key renders `NotFoundPage` (or redirects to it).

## Data

### New file — `src/data/collections.js`

```js
export const COLLECTIONS = [
  {
    id: 'series-01',
    name: 'Series 01',
    label: 'The Origin Pod',
    status: 'live',
    whales: ['common', 'uncommon', 'rare', 'ultra', 'legend'],
  },
  {
    id: 'series-02',
    name: 'Series 02',
    status: 'coming-soon',
  },
]
```

### `src/data/rarities.js` — one new field per whale

Add a `lore` string to each rarity object. Everything else (label, whale,
image, color, glow, odds, weight, tagline, suit) already exists and is
unchanged.

Lore copy (final):

- **common — Pale Whale:** "The first to surface. Pale Whale carries no
  streak and no debt — just a clean slate and a steady tail. Every run starts
  here, calm hands and clear water."
- **uncommon — Clover Whale:** "Clover Whale doesn't hedge. It picks one
  current and commits the whole pod to it. Lucky, yes — but luck it walked
  straight into on purpose."
- **rare — Flow Whale:** "Flow Whale stopped fighting the tide a long time
  ago. It reads the water, leans in, and lets the current do the work.
  Trust the drift."
- **ultra — Ember Whale:** "Ember Whale runs hot. When the streak catches,
  it stops counting odds and starts trusting the heat. Some nights it simply
  cannot miss."
- **legend — Crown Whale:** "Crown Whale surfaces once a season, if that.
  It doesn't chase the moment — it waits for the moment to arrive, then takes
  it. Your time, your legacy."

## Components

### `WhaleCard.jsx` / `WhaleCard.css` (new — extracted)

The whale card markup currently inside `RarityLineup.jsx` (the `<article
className="rarity">` block: plate halo, head with label + suit, image stage,
tagline, odds footer) moves into this component. The card is wrapped in a
React Router `<Link to={`/whale/${rarity.key}`}>`. Props: `rarity` object.

Visual output is identical to today's home lineup card, plus a pointer
cursor and the existing hover lift now signalling a real link.

The `.rarity*` CSS class names and styles move from `RarityLineup.css` into
`WhaleCard.css` (or `WhaleCard.css` is created and `RarityLineup.css` keeps
only the `.rarity-grid` layout). No visual change on the home page.

### `RarityLineup.jsx` (refactored)

Replaces the inlined `<article>` with `<WhaleCard rarity={rarity} />`. Keeps
its `SectionHeader`, the `Reveal` stagger wrapper, and the `.rarity-grid`
layout. The section header's action becomes a router link to `/collection`
(see `SectionHeader` change below).

### `CollectionPage.jsx` / `CollectionPage.css` (new)

- Renders `<SEO title="Collection" ... />` and scrolls to top on mount.
- Iterates `COLLECTIONS`. For each:
  - `status: 'live'` → a section with the collection name/label heading and a
    1-row, 5-column grid (`repeat(5, 1fr)`, same as `.rarity-grid`) of
    `WhaleCard`s, one per key in `whales`.
  - `status: 'coming-soon'` → a single **dashed-outline panel** spanning the
    full row width, the height of a card row, with centered text: the
    collection name ("Series 02") and "Coming Soon". This is the "dotted
    line it" treatment.
- Responsive: the live grid collapses to 2 columns / 1 column at the same
  breakpoints the home lineup uses (760px, 480px).

### `WhalePage.jsx` / `WhalePage.css` (new)

- Reads `:key` from the route, resolves the rarity via `getRarity`. If the
  key is not a real rarity key, render `NotFoundPage`.
- Renders `<SEO title={whale name} description={lore excerpt} path={...} />`
  and scrolls to top on mount.
- Layout: a large zoomed whale image with the tier glow halo on one side;
  on the other, the tier label + suit, the odds, the italic tagline, and the
  lore paragraph.
- A "← Back to collection" link to `/collection`.
- Prev / next whale navigation (arrows) cycling through `RARITIES` order, so
  visitors can browse the pod without returning to the collection page.

### `SectionHeader.jsx` (small change)

Add an optional `actionTo` prop. When `actionTo` is set, the action renders
as a React Router `<Link to={actionTo}>` instead of an `<a href>`. When only
`actionHref` is set, behaviour is unchanged. The home lineup passes
`actionTo="/collection"`; `FeaturedCollection`'s "View all products →" is
left untouched.

## Out of scope

- Navbar is not changed. The collection page is reached via the section-header
  link. (A nav item can be added later if wanted.)
- Featured Collection / blind-box products are unchanged.
- Cart, reveal, and inventory drawers are unchanged.
- Series 02 content — only the placeholder is built.

## Verification

1. `yarn dev` starts with zero warnings.
2. Home page rarity lineup looks visually identical to before the refactor.
3. "View rarity guide →" navigates to `/collection` without a full reload.
4. `/collection` shows Series 01 as one 5-whale row and Series 02 as a
   dashed-outline "Coming Soon" panel.
5. Clicking a whale on the home lineup and on the collection page both open
   `/whale/:key` with the larger image, lore, tier info, and prev/next nav.
6. `/whale/not-a-real-key` renders the 404 page.
7. Each new page sets its own `<title>` and og tags.
8. Resize at 375 / 768 / 1280px — collection grid and whale page respond
   cleanly.
9. `yarn build && yarn preview` succeeds.
