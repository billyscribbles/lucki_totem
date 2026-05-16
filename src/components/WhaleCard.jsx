import { Link } from 'react-router-dom'
import './WhaleCard.css'

// A single whale tier card — halo, whale render, tagline and odds.
// Used by the home lineup and the collection page; the whole card links
// to that whale's detail page.
export default function WhaleCard({ rarity }) {
  return (
    <Link
      className="rarity"
      to={`/whale/${rarity.key}`}
      style={{ '--r': rarity.color, '--r-glow': rarity.glow }}
      aria-label={`View ${rarity.whale} — ${rarity.label} tier`}
    >
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
    </Link>
  )
}
