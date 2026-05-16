// Whale series. The collection page renders one row per entry: a `live`
// series shows its whales as cards, a `coming-soon` series shows a dashed
// placeholder. `whales` keys reference rarities.js.

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
