// LUCKI — design tokens. Single source of truth for the look.
// applyTheme.js writes these onto :root as CSS custom properties at boot,
// so every .css file references them via var(--gold), var(--display), etc.

export const theme = {
  colors: {
    // surfaces
    bg: '#07090f',
    'bg-soft': '#0d111c',
    panel: 'rgba(16, 20, 32, 0.62)',
    line: '#22293a',
    'line-soft': '#1a2030',

    // text
    ink: '#f4eedd',
    'ink-dim': '#a8a99f',
    'ink-mute': '#6b6c66',

    // brand gold
    gold: '#d4b35a',
    'gold-hi': '#f0d480',
    'gold-deep': '#8a6f29',
    'gold-glow': 'rgba(212, 179, 90, 0.35)',
    'gold-ink': '#1a1408', // text on top of a gold fill

    // rarity tiers
    'rar-common': '#d4dbe5',
    'rar-uncommon': '#4ade80',
    'rar-rare': '#3b82f6',
    'rar-ultra': '#ff6a3d',
    'rar-legend': '#f5c542',
  },
  fonts: {
    display: "'Cinzel', 'Times New Roman', serif", // headlines, wordmark, product names
    body: "'DM Sans', system-ui, sans-serif", // body copy, ledes
    mono: "'DM Mono', ui-monospace, 'SFMono-Regular', monospace", // eyebrows, labels, meta
  },
  radii: {
    sm: '2px', // pills, buttons, tags
    md: '8px', // product cards, drawer rows
    lg: '14px', // panels
    xl: '18px', // protect-your-hand container
  },
}
