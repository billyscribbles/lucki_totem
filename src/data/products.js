// Featured Collection — the four cards above the rarity lineup.
// `orb` references a rarity key so the card glow matches the tier.

export const FEATURED = [
  {
    id: 'blind-box-s01',
    tag: 'New',
    tagColor: '#d4dbe5',
    name: 'Lucki Blind Box',
    sub: 'Series 01 · one whale per box',
    price: 19.99,
    orb: 'common',
    image: '/images/blind-box.png',
  },
  {
    id: 'flow-whale',
    tag: 'Hot',
    tagColor: '#ff6a3d',
    name: 'Flow Whale',
    sub: 'Ride the current. Trust the flow.',
    price: 34.99,
    orb: 'rare',
  },
  {
    id: 'card-protectors',
    tag: 'Best Seller',
    tagColor: '#4ade80',
    name: 'Poker Card Protectors',
    sub: '60 protectors plus a display stand',
    price: 24.99,
    orb: 'uncommon',
  },
  {
    id: 'collectors-jackpot',
    tag: 'Bundle',
    tagColor: '#c77dff',
    name: "Collector's Jackpot",
    sub: 'Box, protectors and a sealed extra',
    price: 79.99,
    orb: 'legend',
  },
]
