import { RARITIES } from '../data/rarities.js'
import SectionHeader from './SectionHeader.jsx'
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
      />
      <div className="rarity-grid">
        {RARITIES.map((rarity, i) => (
          <Reveal key={rarity.key} delay={i * 0.06}>
            <article className="rarity" style={{ '--r': rarity.color, '--r-glow': rarity.glow }}>
              <span className="rarity__plate" aria-hidden="true" />
              <header className="rarity__head">
                <span className="rarity__label">{rarity.label}</span>
                <span className="rarity__suit" aria-hidden="true">
                  {rarity.suit}
                </span>
              </header>
              <div className="rarity__stage">
                <img
                  className="rarity__whale"
                  src={rarity.image}
                  alt={`${rarity.whale} — ${rarity.label} tier whale figurine`}
                  loading="lazy"
                  width="600"
                  height="600"
                />
              </div>
              <p className="rarity__tagline">
                <span>{rarity.tagline[0]}</span>
                <span>{rarity.tagline[1]}</span>
              </p>
              <footer className="rarity__odds">
                Odds <strong>{rarity.odds}</strong>
              </footer>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
