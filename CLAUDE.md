# CLAUDE.md — Foundation Starter Repo

This repo is **Billy's agency foundation template**. It is NOT a client site. It is the clean, opinionated scaffold that every new client site starts from.

When Billy opens this repo and tells you to start a new business site, your job is to perform **"The Big Switch"** — reskin this foundation into a new site end-to-end — without touching component internals unless strictly necessary.

---

## What this repo is

A marketing/landing-site starter distilled from `my_studio` (Onrai Studio). It covers the ~80% case: homepage, services, about, contact, legal, 404. Commerce sites are out of scope — for those, fork `elusive-racing` instead.

**Sibling reference repos on this machine** (read-only, for patterns):
- `/Users/billyhuynh/Github/my_studio` — the source marketing site this foundation was distilled from. When in doubt about a pattern, look here.
- `/Users/billyhuynh/Github/elusive-racing` — the commerce reference. Only look here if Billy asks for cart/checkout/product features.

## Tech stack (do not change without asking)

- React 18 + Vite 5
- React Router v7 (SPA, BrowserRouter, lazy-loaded pages)
- Plain CSS with CSS variables — **no Tailwind**
- Framer Motion 11 (scroll-in `whileInView` pattern)
- Lucide React icons
- Yarn 4.12 with `.pnp` caching
- `react-helmet-async` for per-page SEO
- Formspree for the contact form (env-driven)
- Railway deployment (`railway.json`)
- JSX, **no TypeScript**

## The Three-File Swap Model

Every client-specific value lives in one of three layers. Components are "dumb" — they read from config/content and contain zero client strings, colors, or links.

1. **`src/config/theme.config.js`** — design tokens (colors, fonts, radii, shadows, transitions, breakpoints). A boot helper (`src/lib/applyTheme.js`) flattens this to CSS custom properties on `:root` at app start, so all CSS keeps using `var(--color-accent)` etc.

2. **`src/config/site.config.js`** — brand identity and integrations:
   ```
   brand:        { name, logoSrc, logoText, tagline }
   nav:          [{ label, href }]
   footer:       { columns, legal, copyright }
   social:       { instagram, linkedin, ... }
   seo:          { defaultTitle, titleTemplate, description, ogImage, siteUrl }
   integrations: { formspreeId, gaId }
   contact:      { email, phone, address }
   ```

3. **`src/content/*.js`** — per-section copy, one file per section: `hero.js`, `stats.js`, `services.js`, `howItWorks.js`, `testimonials.js`, `faq.js`, `legal.js`. Section components import directly from their content file. No prop drilling, no context.

Plus: **`public/brand/`** for `logo.svg`, `logo-mark.svg`, `favicon.svg`, `og-image.png`, and `public/fonts/` for self-hosted woff2 display + body fonts (preloaded in `index.html`).

## Directory structure

```
foundation/
├── public/
│   ├── brand/          logo.svg, logo-mark.svg, favicon.svg, og-image.png
│   ├── fonts/          default display + body (woff2, preloaded)
│   └── images/         placeholder hero/section imagery
├── src/
│   ├── config/
│   │   ├── theme.config.js
│   │   └── site.config.js
│   ├── content/
│   │   ├── hero.js
│   │   ├── stats.js
│   │   ├── services.js
│   │   ├── howItWorks.js
│   │   ├── testimonials.js
│   │   ├── faq.js
│   │   └── legal.js
│   ├── lib/
│   │   ├── applyTheme.js   writes theme.config -> CSS vars on :root
│   │   └── seo.js          Helmet wrapper using site.config.seo
│   ├── components/
│   │   ├── Navbar.jsx / .css
│   │   ├── Footer.jsx / .css
│   │   ├── Hero.jsx / .css
│   │   ├── Stats.jsx / .css
│   │   ├── Services.jsx / .css
│   │   ├── HowItWorks.jsx / .css
│   │   ├── Testimonials.jsx / .css
│   │   ├── FAQ.jsx / .css
│   │   └── Contact.jsx / .css
│   ├── pages/
│   │   ├── Home.jsx            composes all sections
│   │   ├── ServicesPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── LegalPage.jsx       renders privacy or terms from legal.js
│   │   └── NotFoundPage.jsx
│   ├── App.jsx
│   ├── main.jsx                calls applyTheme() then mounts
│   └── index.css               base resets + utility classes
├── .env.example                VITE_FORMSPREE_ID, VITE_SITE_URL, VITE_GA_ID
├── index.html
├── package.json
├── vite.config.js              manual vendor chunks (react, motion)
├── railway.json
└── README.md                   "How to fork" checklist
```

### Components included

Lifted from `my_studio`: `Navbar`, `Footer`, `Hero`, `Stats`, `Services`, `HowItWorks`, `Testimonials`, `FAQ`, `Contact`.

Explicitly **excluded** as too site-specific (add back per-project only if asked): `Industries`, `AIFeatures`, `Shop` pricing cards, `Portfolio`, `TechStack`, `BacklinkSourcesDiagram`, `ContentClusterDiagram`, `CaseStudyElusiveRacing`, `TheClimbPage`, `AIPage`.

### CSS utility classes kept

`.container`, `.section`, `.section--dark`, `.section-label`, `.section-sub`, `.glow-card` — all copied from `my_studio/src/index.css`. These are the shared styling primitives; keep using them rather than inventing new ones.

### Routes

```
/            Home
/services    ServicesPage
/about       AboutPage
/contact     ContactPage
/privacy     LegalPage (section="privacy")
/terms       LegalPage (section="terms")
*            NotFoundPage
```

---

## The Big Switch — kicking off a new business site

When Billy says something like *"start a new site for [Client]"*, *"let's build [Client]'s site"*, or *"kick off a new business"*, run this workflow.

### Step 0 — Confirm the client brief first

Before editing anything, ask Billy for the basics if they aren't already in the conversation:

1. **Business name** and one-line tagline
2. **Industry / what they do**
3. **Brand colors** (or a vibe — "dark luxury", "minimal pastel", "bold tech") so you can propose `theme.config.js` values
4. **Logo asset** (file path, or "generate a text logo for now")
5. **Nav pages they want** (default: Home, Services, About, Contact)
6. **Domain** (for SEO) and Formspree ID (or leave the env placeholder)
7. **Any sections they DON'T want** from the default set

Don't guess brand identity. Ask.

### Step 1 — Decide: in-place edit or new repo?

Default: **clone this foundation into a sibling directory** (e.g., `/Users/billyhuynh/Github/<client-name>`) and work there. Never commit client-specific changes back into `foundation/` itself. If Billy explicitly says "just edit in place for a test", you can — but warn him first.

### Step 2 — Execute the swap (in order)

1. **`src/config/site.config.js`** — brand, nav, footer, social, SEO, contact, integration IDs.
2. **`src/config/theme.config.js`** — colors, fonts, radii. Match the brand. If using custom fonts, also update `public/fonts/` and the preload in `index.html`.
3. **`public/brand/`** — drop in `logo.svg`, `favicon.svg`, `og-image.png`. If assets aren't provided, generate clean SVG placeholders that match the brand name + colors.
4. **`src/content/*.js`** — rewrite each section's copy. Write real marketing copy for the client's industry, not lorem ipsum. Match the tone Billy specified (or ask).
5. **`.env`** — copy from `.env.example` and fill `VITE_FORMSPREE_ID`, `VITE_SITE_URL`, `VITE_GA_ID`.
6. **`index.html`** — update the fallback `<title>`, `<meta description>`, og tags, and favicon link. (Helmet will override at runtime, but this is the pre-hydration fallback.)
7. **`public/sitemap.xml`** and **`public/robots.txt`** — update domain.

### Step 3 — Add/remove pages if needed

If Billy asks for extra sections or pages not in the default set:
- **Extra section:** create a new `src/content/<name>.js`, copy the closest existing component as a starting point, and compose it into the relevant page. Prefer composition over editing existing components.
- **Extra page:** add a lazy route in `src/App.jsx` following the existing pattern (lazy + Suspense + chunk retry).
- **Remove a section:** delete it from the page composition in `src/pages/Home.jsx`. Leave the component file in place unless Billy asks to delete it — easier to put back.

### Step 4 — Verify end-to-end before declaring done

Run through this list. Do not claim the site is done until every step passes.

1. `yarn install && yarn dev` — starts with zero warnings.
2. Home page renders every section with real client copy and no layout breakage.
3. Change `site.config.js` → brand name → verify Navbar, Footer, `<title>`, og meta all update without touching components.
4. Change `theme.config.js` → `colors.accent` → verify every accent surface (buttons, hover states, glow cards) updates site-wide.
5. Navigate every route including `/does-not-exist` (404).
6. Submit the contact form against the real Formspree endpoint — verify success state.
7. `yarn build && yarn preview` — production build succeeds, vendor chunks split as expected.
8. Lighthouse on `yarn preview`: performance ≥ 90, SEO ≥ 95, a11y ≥ 90 on the home page.
9. Resize at 375px / 768px / 1280px — hamburger, grids, and footer all respond cleanly.

Report verification results with evidence (command output, observed behavior), not vibes.

---

## Rules for working in this repo

- **Never hardcode client strings, colors, or links in components.** If you're tempted to, the correct answer is to add a field to `site.config.js` or a content file and read it from there.
- **Never introduce Tailwind, styled-components, or any other CSS system.** Plain CSS + CSS variables is the house style.
- **Never add TypeScript.** JSX only, matching the existing sibling repos.
- **Never invent new design tokens.** Add them to `theme.config.js` and expose via `applyTheme.js`. Never write raw hex/rem in component CSS.
- **Never delete the placeholder content files** when reskinning — rewrite them in place. The shape is part of the contract.
- **Prefer lifting a pattern from `my_studio`** over inventing a new one. If `my_studio` does it a certain way and it's reasonable, match it.
- **Keep commits atomic** when editing — one commit per swap step (site config, theme, content, etc.) makes rollback trivial.
- **Don't over-engineer.** This is a template. Small, focused, easy to scan > clever abstractions.

## Known non-blocking considerations

- **Repo hosting:** this should be a GitHub Template repo so "Use this template" gives clean clones.
- **Default typography:** Inter + a display serif as safe defaults; override per client.
- **Commerce:** out of scope. Fork `elusive-racing` if a client needs cart/checkout.
