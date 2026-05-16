import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { RARITIES } from '../data/rarities.js'
import SEO from '../lib/seo.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './WhalePage.css'

// Dedicated whale detail page — a zoomed render, tier stats and lore,
// with prev/next navigation cycling through the pod.
export default function WhalePage() {
  const { key } = useParams()
  const index = RARITIES.findIndex((r) => r.key === key)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [key])

  // An unknown :key is a real not-found, not a whale.
  if (index === -1) return <NotFoundPage />

  const rarity = RARITIES[index]
  const prev = RARITIES[(index - 1 + RARITIES.length) % RARITIES.length]
  const next = RARITIES[(index + 1) % RARITIES.length]

  return (
    <main
      className="whale"
      style={{ '--r': rarity.color, '--r-glow': rarity.glow }}
    >
      <SEO
        title={rarity.whale}
        description={rarity.lore}
        path={`/whale/${rarity.key}`}
      />
      <div className="container section">
        <Link to="/collection" className="whale__back">
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Back to collection
        </Link>

        <div className="whale__layout">
          <div className="whale__stage">
            <span className="whale__halo" aria-hidden="true" />
            <img
              className="whale__img"
              src={rarity.image}
              alt={`${rarity.whale} — ${rarity.label} tier whale figurine`}
              width="600"
              height="600"
            />
          </div>

          <div className="whale__info">
            <p className="whale__tier">
              <span className="whale__suit" aria-hidden="true">
                {rarity.suit}
              </span>
              {rarity.label} Tier
            </p>
            <h1 className="whale__name">{rarity.whale}</h1>
            <p className="whale__tagline">
              {rarity.tagline[0]} {rarity.tagline[1]}
            </p>
            <p className="whale__lore">{rarity.lore}</p>

            <dl className="whale__stats">
              <div className="whale__stat">
                <dt>Pull Odds</dt>
                <dd>{rarity.odds}</dd>
              </div>
              <div className="whale__stat">
                <dt>Tier</dt>
                <dd>{rarity.label}</dd>
              </div>
              <div className="whale__stat">
                <dt>Suit</dt>
                <dd aria-hidden="true">{rarity.suit}</dd>
              </div>
            </dl>
          </div>
        </div>

        <nav className="whale__nav" aria-label="Whale navigation">
          <Link to={`/whale/${prev.key}`} className="whale__nav-link">
            <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>
              <em>Previous</em>
              {prev.whale}
            </span>
          </Link>
          <Link
            to={`/whale/${next.key}`}
            className="whale__nav-link whale__nav-link--next"
          >
            <span>
              <em>Next</em>
              {next.whale}
            </span>
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  )
}
