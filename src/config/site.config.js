// LUCKI — brand identity, navigation, footer, SEO.
// The site is a single scroll, so nav + footer links are in-page anchors.

export const site = {
  brand: {
    name: 'LUCKI',
    wordmark: 'LUCKI',
    tagline: 'Collect your luck. One blind box at a time.',
    series: 'Series 01',
  },

  // Route paths, except `#footer` which targets the app-level footer on
  // every page. Navbar renders a router Link for paths, an <a> for anchors.
  nav: [
    { label: 'Shop', href: '/shop' },
    { label: 'Blind Boxes', href: '/blind-boxes' },
    { label: 'Protectors', href: '/protectors' },
    { label: 'Collectors Club', href: '/collection' },
    { label: 'About', href: '/about' },
  ],

  footer: {
    columns: [
      {
        title: 'Shop',
        links: ['Blind Boxes', 'Protectors', 'Bundles', 'Apparel'],
      },
      {
        title: 'The Game',
        links: ['Rarity Guide', 'Collectors Club', 'Drop Schedule', 'FAQ'],
      },
      {
        title: 'Studio',
        links: ['About', 'Press', 'Contact', 'Terms'],
      },
    ],
    copyright: '© 2026 LUCKI STUDIO · ALL RIGHTS RESERVED',
    notice: 'MUST BE 18+ TO COLLECT',
  },

  social: {
    instagram: '',
    tiktok: '',
  },

  seo: {
    defaultTitle: 'LUCKI — Collect Your Luck',
    titleTemplate: '%s · LUCKI',
    description:
      'Luxury blind box whales that double as poker card protectors. Eight rarities, one sealed box. Pull your luck.',
    siteUrl: import.meta.env.VITE_SITE_URL || 'https://lucki.studio',
    ogImage: '/brand/og-image.png',
    locale: 'en_US',
  },

  integrations: {
    gaId: import.meta.env.VITE_GA_ID || '',
  },
}
