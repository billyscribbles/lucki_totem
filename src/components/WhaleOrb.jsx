import { getRarity } from '../data/rarities.js'
import './WhaleOrb.css'

// The whale figurine for a rarity tier — a studio render shot on black.
// `mix-blend-mode: screen` (in the CSS) drops the black backing so the
// whale and its splash glow sit cleanly on any dark card. Decorative,
// so it carries aria-hidden and an empty alt.
export default function WhaleOrb({ rarity, size = 120, animated = true }) {
  const r = getRarity(rarity)
  return (
    <div
      className={`orb${animated ? ' orb--bob' : ''}`}
      style={{ '--orb-size': `${size}px`, '--r-glow': r.glow }}
      aria-hidden="true"
    >
      <span className="orb__halo" />
      <img className="orb__whale" src={r.image} alt="" loading="lazy" />
    </div>
  )
}
