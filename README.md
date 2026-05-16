# Foundation — Agency Starter Template

Opinionated React + Vite starter for spinning up marketing/landing sites in minutes.
Distilled from `onrai_studio`. Not a client site — a scaffold every client site forks from.

Read `CLAUDE.md` for the full contract (design system, routes, component rules, "Big Switch" workflow).

## Quick start

```bash
yarn install
cp .env.example .env      # fill VITE_FORMSPREE_ID + VITE_SITE_URL
yarn dev
```

Open http://localhost:5173. You should see a fully-rendered site with placeholder content.

## The three-file swap

Every new client site is built by editing these — **not** components:

1. **`src/config/site.config.js`** — brand name, logo, nav, footer, SEO, social, contact, integration IDs.
2. **`src/config/theme.config.js`** — colors, fonts, radii, shadows, transitions. Flows into CSS variables automatically.
3. **`src/content/*.js`** — one file per section (`hero.js`, `services.js`, `testimonials.js`, …). Rewrite copy in place.

Plus **`public/brand/`** — drop in `logo.svg`, `favicon.svg`, `og-image.png`.

## How to fork for a new client

1. Copy this repo: `cp -R foundation /path/to/client-name` (or use GitHub "Use this template").
2. Edit `src/config/site.config.js` — brand name, nav, footer, SEO, contact, social.
3. Edit `src/config/theme.config.js` — colors and fonts for the brand.
4. Drop assets into `public/brand/` (`logo.svg`, `favicon.svg`, `og-image.png`).
5. Rewrite each file in `src/content/` with real copy.
6. Copy `.env.example` → `.env`, set `VITE_FORMSPREE_ID` and `VITE_SITE_URL`.
7. `yarn dev` — verify, then `yarn build && yarn preview` for the production check.

## What's included

**Routes:** `/`, `/services`, `/about`, `/contact`, `/privacy`, `/terms`, `*` (404).

**Components:** `Navbar`, `Footer`, `Hero`, `Stats`, `Services`, `HowItWorks`, `Testimonials`, `FAQ`, `Contact`.

**Utilities:** `SEO` wrapper (`src/lib/seo.jsx`), `applyTheme()` bootstrap (`src/lib/applyTheme.js`).

## House rules

- No Tailwind. Plain CSS + CSS variables only.
- No TypeScript. JSX only.
- No hardcoded client strings, colors, or links in components — read from `site.config`/`content` files.
- New design tokens go in `theme.config.js`, not as raw hex/rem in CSS.
- Section components keep the Framer Motion `whileInView` pattern for scroll-in animations.

## Adding a new section

1. Create `src/content/mySection.js` exporting the data.
2. Create `src/components/MySection.jsx` (+`.css`) that imports it.
3. Compose it into the relevant page in `src/pages/`.

## Adding a new page

1. Create `src/pages/MyPage.jsx`.
2. Add a lazy route in `src/App.jsx` following the `lazyWithRetry` pattern.
3. Add the nav link in `site.config.js` under `nav`.

## Deployment

Ready for Railway out of the box (`railway.json` included). `yarn start` serves the production build on port 4173.
