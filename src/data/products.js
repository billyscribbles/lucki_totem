// Featured Collection — the four cards above the rarity lineup.
// `orb` references a rarity key so the card glow matches the tier.
// `packSize` is how many sealed boxes the purchase yields.

export const FEATURED = [
  {
    id: 'blind-box-s01',
    tag: 'New',
    tagColor: '#d4dbe5',
    name: 'Lucki Blind Box',
    sub: 'Series 01 · one whale per box',
    price: 19.99,
    packSize: 1,
    orb: 'common',
    image: '/images/blind-box.png',
  },
  {
    id: 'blind-box-3pack',
    tag: '3-Pack',
    tagColor: '#3b82f6',
    name: 'Blind Box 3-Pack',
    sub: 'Three Series 01 boxes · triple the pulls',
    price: 54.99,
    packSize: 3,
    orb: 'rare',
    image: '/images/blind-box-3pack.png',
  },
  {
    id: 'blind-box-5pack',
    tag: '5-Pack',
    tagColor: '#f5c542',
    name: 'Blind Box 5-Pack',
    sub: 'Five Series 01 boxes · best legendary odds',
    price: 84.99,
    packSize: 5,
    orb: 'legend',
    image: '/images/blind-box-5pack.png',
  },
  {
    id: 'blind-box-megabox',
    tag: 'Mega Box',
    tagColor: '#c77dff',
    name: 'Blind Box Mega Box',
    sub: 'Eight Series 01 boxes · the full case',
    price: 129.99,
    packSize: 8,
    orb: 'ultra',
    image: '/images/blind-box-megabox.png',
  },
]
