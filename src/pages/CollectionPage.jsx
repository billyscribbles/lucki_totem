import { useEffect } from 'react'
import { COLLECTIONS } from '../data/collections.js'
import { getRarity } from '../data/rarities.js'
import SEO from '../lib/seo.jsx'
import WhaleCard from '../components/WhaleCard.jsx'
import Reveal from '../components/Reveal.jsx'
import './CollectionPage.css'

// The Lucki Collection — every whale series, one row per collection.
// A live series shows its whales as cards; a coming-soon series shows a
// dashed placeholder panel.
export default function CollectionPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="collection">
      <SEO
        title="Collection"
        description="Every LUCKI whale series — meet the full pod, tier by tier."
        path="/collection"
      />
      <div className="container section">
        <header className="collection__intro">
          <p className="collection__eyebrow">
            <span aria-hidden="true">♠</span> The Lucki Collection
          </p>
          <h1 className="collection__title">
            Meet the <span className="collection__title-accent">whole pod.</span>
          </h1>
          <p className="collection__sub">
            Every series, every tier — one row per collection, surfaced and
            still on its way up.
          </p>
        </header>

        {COLLECTIONS.map((collection) => (
          <section className="coll" key={collection.id}>
            <div className="coll__head">
              <span className="coll__name">{collection.name}</span>
              {collection.label && (
                <span className="coll__label">{collection.label}</span>
              )}
              <span className="coll__status" data-status={collection.status}>
                {collection.status === 'live' ? 'Available' : 'Coming Soon'}
              </span>
            </div>

            {collection.status === 'live' ? (
              <div className="coll__row">
                {collection.whales.map((key, i) => (
                  <Reveal key={key} delay={i * 0.06}>
                    <WhaleCard rarity={getRarity(key)} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div
                className="coll__soon"
                aria-label={`${collection.name} — coming soon`}
              >
                <span className="coll__soon-name">{collection.name}</span>
                <span className="coll__soon-text">Coming Soon</span>
                <span className="coll__soon-sub">
                  A new pod is surfacing. Sit tight.
                </span>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
