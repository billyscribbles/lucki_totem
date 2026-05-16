import { RARITIES } from '../data/rarities.js'
import SectionHeader from './SectionHeader.jsx'
import WhaleCard from './WhaleCard.jsx'
import Reveal from './Reveal.jsx'
import './RarityLineup.css'

// The Lucki Lineup — all five tiers, each with its halo, whale and odds.
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
        {RARITIES.map((rarity, i) => (
          <Reveal key={rarity.key} delay={i * 0.06}>
            <WhaleCard rarity={rarity} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
