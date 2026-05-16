import { RARITIES } from '../data/rarities.js'
import SectionHeader from './SectionHeader.jsx'
import WhaleCard from './WhaleCard.jsx'
import Reveal from './Reveal.jsx'
import './RarityLineup.css'

// The home lineup showcases the chase tiers — the everyday Common and
// Rare whales sit this one out so the rarer pulls (Rose, Noir, Ultra,
// Legendary) carry the row. The full seven-tier set lives on /collection.
const LINEUP_KEYS = ['uncommon', 'rose', 'ultra', 'noir', 'legend']
const LINEUP = LINEUP_KEYS.map((key) => RARITIES.find((r) => r.key === key))

// The Lucki Lineup — five showcase tiers, each with its halo, whale and odds.
export default function RarityLineup() {
  return (
    <section className="container section" id="rarities">
      <SectionHeader
        eyebrow="The Lucki Lineup"
        ornament="♠"
        action="View rarity guide →"
        actionTo="/collection"
      />
      <div className="rarity-grid">
        {LINEUP.map((rarity, i) => (
          <Reveal key={rarity.key} delay={i * 0.06}>
            <WhaleCard rarity={rarity} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
