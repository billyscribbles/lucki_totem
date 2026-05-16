// Product data. `orb` references a rarity key so the card glow matches
// the tier. `type` separates the blind-box loop ('box') from standalone
// card protectors ('protector') — checkout branches on it.
// `packSize` is how many sealed boxes a blind-box purchase yields.
// `series` references a collections.js id so /blind-boxes can group them.
// `blurb` is the longer description shown on the /product/:id detail page.

export const FEATURED = [
  {
    id: 'blind-box-s01',
    type: 'box',
    series: 'series-01',
    tag: 'New',
    tagColor: '#d4dbe5',
    name: 'Lucki Blind Box',
    sub: 'Series 01 · one whale per box',
    blurb:
      "One sealed Series 01 box, one whale of the Origin Pod inside. Could be the calm Pale Whale, could be the Crown — you won't know until the seal breaks.",
    price: 19.99,
    packSize: 1,
    orb: 'common',
    image: '/images/blind-box.png',
  },
  {
    id: 'blind-box-3pack',
    type: 'box',
    series: 'series-01',
    tag: '3-Pack',
    tagColor: '#3b82f6',
    name: 'Blind Box 3-Pack',
    sub: 'Three Series 01 boxes · triple the pulls',
    blurb:
      'Three sealed Series 01 boxes, three pulls at the Origin Pod. Triple the chances of surfacing something rare without committing to the full case.',
    price: 54.99,
    packSize: 3,
    orb: 'rare',
    image: '/images/blind-box-3pack.png',
  },
  {
    id: 'blind-box-5pack',
    type: 'box',
    series: 'series-01',
    tag: '5-Pack',
    tagColor: '#f5c542',
    name: 'Blind Box 5-Pack',
    sub: 'Five Series 01 boxes · best legendary odds',
    blurb:
      'Five sealed Series 01 boxes — the sweet spot. Enough pulls to swing the legendary odds in your favour while you build out the pod.',
    price: 84.99,
    packSize: 5,
    orb: 'legend',
    image: '/images/blind-box-5pack.png',
  },
  {
    id: 'blind-box-megabox',
    type: 'box',
    series: 'series-01',
    tag: 'Mega Box',
    tagColor: '#c77dff',
    name: 'Blind Box Mega Box',
    sub: 'Eight Series 01 boxes · the full case',
    blurb:
      'Eight sealed Series 01 boxes — the complete case. The deepest run at the Origin Pod and your strongest shot at the Crown Whale.',
    price: 129.99,
    packSize: 8,
    orb: 'ultra',
    image: '/images/blind-box-megabox.png',
  },
]

// Standalone card protectors — no mystery, pick the collectable you want.
// Sold directly through /shop and /protectors; they skip the unboxing
// reveal. No `image` — artwork isn't ready, so ProductCard shows a
// coming-soon placeholder.
export const PROTECTORS = [
  {
    id: 'protector-monkey',
    type: 'protector',
    tag: 'New',
    tagColor: '#d4dbe5',
    name: 'Monkey Protector',
    sub: 'Weighted acrylic · clear-read finish',
    blurb:
      'A weighted acrylic protector cut for a clear read at the table. The Monkey holds your card flat, square and easy to see all night.',
    price: 24.0,
    orb: 'common',
  },
  {
    id: 'protector-fish',
    type: 'protector',
    tag: 'Best Seller',
    tagColor: '#4ade80',
    name: 'Fish Protector',
    sub: 'Weighted acrylic · emerald cast',
    blurb:
      'Our best-selling protector in an emerald cast. Weighted acrylic with polished edges — the Fish keeps your card pinned and catches the light doing it.',
    price: 26.0,
    orb: 'uncommon',
  },
  {
    id: 'protector-cat',
    type: 'protector',
    tag: 'Acrylic',
    tagColor: '#3b82f6',
    name: 'Cat Protector',
    sub: 'Weighted acrylic · sapphire cast',
    blurb:
      'Weighted acrylic in a deep sapphire cast. The Cat sits low and steady — a quiet bit of luck within reach on every hand.',
    price: 28.0,
    orb: 'rare',
  },
  {
    id: 'protector-fox',
    type: 'protector',
    tag: 'Acrylic',
    tagColor: '#ff6a3d',
    name: 'Fox Protector',
    sub: 'Weighted acrylic · molten cast',
    blurb:
      'Weighted acrylic in a molten cast that runs warm under the lights. The Fox is built for players who like their luck loud.',
    price: 30.0,
    orb: 'ultra',
  },
  {
    id: 'protector-owl',
    type: 'protector',
    tag: 'Limited',
    tagColor: '#f5c542',
    name: 'Owl Protector',
    sub: 'Weighted acrylic · gilded edition',
    blurb:
      'A limited gilded-edition protector. Weighted acrylic with a gold-leaf cast — the Owl is the one you bring out when the night matters.',
    price: 34.0,
    orb: 'legend',
  },
  {
    id: 'protector-bear',
    type: 'protector',
    tag: 'Acrylic',
    tagColor: '#d4dbe5',
    name: 'Bear Protector',
    sub: 'Weighted acrylic · clear-read finish',
    blurb:
      'Weighted acrylic with a clear-read finish. The Bear is heavy in the hand and honest on the felt — a steady guardian for your card.',
    price: 22.0,
    orb: 'common',
  },
  {
    id: 'protector-frog',
    type: 'protector',
    tag: 'Best Seller',
    tagColor: '#4ade80',
    name: 'Frog Protector',
    sub: 'Weighted acrylic · emerald cast',
    blurb:
      'A best-selling protector in an emerald cast. Weighted acrylic with smooth edges — the Frog keeps your card locked down hand after hand.',
    price: 25.0,
    orb: 'uncommon',
  },
  {
    id: 'protector-rabbit',
    type: 'protector',
    tag: 'Acrylic',
    tagColor: '#3b82f6',
    name: 'Rabbit Protector',
    sub: 'Weighted acrylic · sapphire cast',
    blurb:
      'Weighted acrylic in a sapphire cast. The Rabbit is light luck made solid — quick to reach for, easy to read.',
    price: 27.0,
    orb: 'rare',
  },
  {
    id: 'protector-tiger',
    type: 'protector',
    tag: 'New',
    tagColor: '#ff6a3d',
    name: 'Tiger Protector',
    sub: 'Weighted acrylic · molten cast',
    blurb:
      'Weighted acrylic in a molten cast. The Tiger runs hot and bold — built for players who play to be seen.',
    price: 31.0,
    orb: 'ultra',
  },
  {
    id: 'protector-panda',
    type: 'protector',
    tag: 'Limited',
    tagColor: '#f5c542',
    name: 'Panda Protector',
    sub: 'Weighted acrylic · gilded edition',
    blurb:
      'A limited gilded-edition protector. Weighted acrylic with a gold-leaf cast — the Panda is a rare guardian for a rare hand.',
    price: 33.0,
    orb: 'legend',
  },
]

// Every purchasable product in one list, boxes first. Backs the
// /product/:id detail page and its prev/next navigation.
export const ALL_PRODUCTS = [...FEATURED, ...PROTECTORS]

const BY_ID = Object.fromEntries(ALL_PRODUCTS.map((p) => [p.id, p]))

// Look up a product by id. Returns undefined for an unknown id so the
// detail page can fall through to a real 404.
export function getProduct(id) {
  return BY_ID[id]
}
