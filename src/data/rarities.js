// The seven rarity tiers. Used by the lineup, product cards, the reveal
// flow and the inventory drawer, so it lives in one place.
// `color` is a CSS var reference — valid anywhere it lands on a custom
// property or a color property. `weight` drives the weighted draw and is
// the single source of truth — the `odds` string shown across the UI is
// derived from it below, so the displayed odds can never drift from the
// real drop rate.

const TIERS = [
  {
    key: 'common',
    label: 'Common',
    whale: 'Pale Whale',
    image: '/whale/common.png',
    color: 'var(--rar-common)',
    glow: 'rgba(212, 219, 229, 0.55)',
    weight: 48,
    tagline: ['Calm and steady.', 'Clear hands.'],
    suit: '♠',
    lore:
      'The first to surface. Pale Whale carries no streak and no debt — just a clean slate and a steady tail. Every run starts here, calm hands and clear water.',
  },
  {
    key: 'uncommon',
    label: 'Uncommon',
    whale: 'Clover Whale',
    image: '/whale/uncommon.png',
    color: 'var(--rar-uncommon)',
    glow: 'rgba(74, 222, 128, 0.55)',
    weight: 25,
    tagline: ['One move.', 'All in.'],
    suit: '♣',
    lore:
      "Clover Whale doesn't hedge. It picks one current and commits the whole pod to it. Lucky, yes — but luck it walked straight into on purpose.",
  },
  {
    key: 'rare',
    label: 'Rare',
    whale: 'Flow Whale',
    image: '/whale/rare.png',
    color: 'var(--rar-rare)',
    glow: 'rgba(59, 130, 246, 0.6)',
    weight: 13,
    tagline: ['Go with it.', 'Trust the current.'],
    suit: '♦',
    lore:
      'Flow Whale stopped fighting the tide a long time ago. It reads the water, leans in, and lets the current do the work. Trust the drift.',
  },
  {
    key: 'rose',
    label: 'Super Rare',
    whale: 'Rose Whale',
    image: '/whale/rose.png',
    color: 'var(--rar-rose)',
    glow: 'rgba(244, 114, 182, 0.55)',
    weight: 7,
    tagline: ['In full bloom.', 'Luck runs warm.'],
    suit: '♡',
    lore:
      'Rose Whale surfaces on the good nights — the ones where the table tilts your way and stays there. It never forces a hand; it just lets the warm streak carry the whole pod.',
  },
  {
    key: 'ultra',
    label: 'Ultra Rare',
    whale: 'Ember Whale',
    image: '/whale/ultra.png',
    color: 'var(--rar-ultra)',
    glow: 'rgba(255, 106, 61, 0.6)',
    weight: 4,
    tagline: ['Feeling it.', "Can't miss."],
    suit: '♥',
    lore:
      'Ember Whale runs hot. When the streak catches, it stops counting odds and starts trusting the heat. Some nights it simply cannot miss.',
  },
  {
    key: 'noir',
    label: 'Secret Rare',
    whale: 'Noir Whale',
    image: '/whale/noir.png',
    color: 'var(--rar-noir)',
    glow: 'rgba(167, 139, 250, 0.6)',
    weight: 2,
    tagline: ['Reads the dark.', 'Keeps the secret.'],
    suit: '♚',
    lore:
      "Noir Whale moves where the light doesn't. It surfaces without a wake, takes what the night offers, and is gone before the pod notices it came. Few ever see it; fewer admit they did.",
  },
  {
    key: 'legend',
    label: 'Legendary',
    whale: 'Crown Whale',
    image: '/whale/legend.png',
    color: 'var(--rar-legend)',
    glow: 'rgba(245, 197, 66, 0.7)',
    weight: 1,
    tagline: ['Your time.', 'Your legacy.'],
    suit: '♛',
    lore:
      "Crown Whale surfaces once a season, if that. It doesn't chase the moment — it waits for the moment to arrive, then takes it. Your time, your legacy.",
  },
]

// Total of every tier's draw weight — the denominator pickWinner() rolls
// against. Deriving the displayed odds from this exact sum means the UI
// stays accurate even if the weights are retuned and no longer total 100.
export const TOTAL_WEIGHT = TIERS.reduce((sum, t) => sum + t.weight, 0)

// Format a tier's true probability as the `XX%` string the UI prints.
// Rounds to one decimal so adjusted, non-integer weights still display
// cleanly; whole-number percentages print without a trailing `.0`.
export function formatOdds(weight) {
  const pct = Math.round((weight / TOTAL_WEIGHT) * 1000) / 10
  return `${pct}%`
}

// `odds` is computed, never typed by hand — it is guaranteed to match the
// weight pickWinner() actually draws against.
export const RARITIES = TIERS.map((t) => ({ ...t, odds: formatOdds(t.weight) }))

const BY_KEY = Object.fromEntries(RARITIES.map((r) => [r.key, r]))

export function getRarity(key) {
  return BY_KEY[key] || RARITIES[0]
}
