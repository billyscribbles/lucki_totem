// The seven rarity tiers. Used by the lineup, product cards, the reveal
// flow and the inventory drawer, so it lives in one place.
// `color` is a CSS var reference — valid anywhere it lands on a custom
// property or a color property. `weight` drives the weighted draw.

export const RARITIES = [
  {
    key: 'common',
    label: 'Common',
    whale: 'Pale Whale',
    image: '/whale/common.png',
    color: 'var(--rar-common)',
    glow: 'rgba(212, 219, 229, 0.55)',
    odds: '48%',
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
    odds: '25%',
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
    odds: '13%',
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
    odds: '7%',
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
    odds: '4%',
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
    odds: '2%',
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
    odds: '1%',
    weight: 1,
    tagline: ['Your time.', 'Your legacy.'],
    suit: '♛',
    lore:
      "Crown Whale surfaces once a season, if that. It doesn't chase the moment — it waits for the moment to arrive, then takes it. Your time, your legacy.",
  },
]

const BY_KEY = Object.fromEntries(RARITIES.map((r) => [r.key, r]))

export function getRarity(key) {
  return BY_KEY[key] || RARITIES[0]
}
