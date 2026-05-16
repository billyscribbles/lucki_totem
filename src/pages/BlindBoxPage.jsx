import { useEffect } from 'react'
import { FEATURED } from '../data/products.js'
import { COLLECTIONS } from '../data/collections.js'
import SEO from '../lib/seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import './ShopPage.css'
import './CollectionPage.css'

// The Blind Box shop — blind boxes only, no protectors. One section per
// series: a live series shows its boxes, a coming-soon series shows the
// dashed placeholder. Series come from collections.js; each box carries a
// `series` id that ties it to a collection.
export default function BlindBoxPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="shop">
      <SEO
        title="Blind Boxes"
        description="Shop LUCKI blind boxes by series — one sealed whale per box, every rarity in play."
        path="/blind-boxes"
      />
      <div className="container section">
        <header className="shop__intro">
          <p className="shop__eyebrow">
            <span aria-hidden="true">✦</span> Blind Boxes
          </p>
          <h1 className="shop__title">
            Pull your <span className="shop__title-accent">luck.</span>
          </h1>
          <p className="shop__sub">
            Sealed whales by series — one box, one mystery rarity. Pick a pack
            size and start the pod.
          </p>
        </header>

        {COLLECTIONS.map((collection) => {
          const boxes = FEATURED.filter((p) => p.series === collection.id)

          return (
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

              {collection.status === 'live' && boxes.length > 0 ? (
                <div className="product-grid">
                  {boxes.map((product, i) => (
                    <Reveal key={product.id} delay={i * 0.06}>
                      <ProductCard product={product} />
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
          )
        })}
      </div>
    </main>
  )
}
