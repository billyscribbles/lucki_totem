import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, ImageOff } from 'lucide-react'
import { FEATURED, PROTECTORS, getProduct } from '../data/products.js'
import { COLLECTIONS } from '../data/collections.js'
import { getRarity } from '../data/rarities.js'
import { useLucki } from '../store/LuckiContext.jsx'
import SEO from '../lib/seo.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './ProductPage.css'

// Dedicated product detail page — a zoomed packshot, copy and price with
// add-to-cart. Blind boxes also show the series pull-odds; protectors
// show acrylic specs. Prev/next cycles within the same product family.
export default function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useLucki()
  const product = getProduct(id)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  // An unknown :id is a real not-found, not a product.
  if (!product) return <NotFoundPage />

  const rarity = getRarity(product.orb)
  const isBox = product.type === 'box'

  // Prev/next cycles the same family — boxes through boxes, protectors
  // through protectors — so the nav never jumps between product types.
  const group = isBox ? FEATURED : PROTECTORS
  const index = group.findIndex((p) => p.id === product.id)
  const prev = group[(index - 1 + group.length) % group.length]
  const next = group[(index + 1) % group.length]

  // Blind boxes draw from a series; surface its whale lineup and odds.
  const series = isBox ? COLLECTIONS.find((c) => c.id === product.series) : null
  const lineup = series ? series.whales.map(getRarity) : []
  // Protectors describe their cast in the second half of `sub`.
  const finish = product.sub.split('·').pop().trim()

  return (
    <main
      className="pdp"
      style={{ '--r': rarity.color, '--r-glow': rarity.glow }}
    >
      <SEO
        title={product.name}
        description={product.blurb}
        path={`/product/${product.id}`}
      />
      <div className="container section">
        <Link to="/shop" className="pdp__back">
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Back to shop
        </Link>

        <div className="pdp__layout">
          <div className="pdp__stage">
            <span className="pdp__halo" aria-hidden="true" />
            {product.image ? (
              <img
                className="pdp__img"
                src={product.image}
                alt={product.name}
                width="600"
                height="600"
              />
            ) : (
              <div className="pdp__placeholder">
                <ImageOff size={34} strokeWidth={1.5} aria-hidden="true" />
                <span>Image coming soon</span>
              </div>
            )}
          </div>

          <div className="pdp__info">
            <p className="pdp__tag" style={{ '--tag': product.tagColor }}>
              {product.tag}
            </p>
            <h1 className="pdp__name">{product.name}</h1>
            <p className="pdp__sub">{product.sub}</p>
            <p className="pdp__blurb">{product.blurb}</p>

            <div className="pdp__buy">
              <span className="pdp__price">${product.price.toFixed(2)}</span>
              <button
                type="button"
                className="btn btn--gold"
                onClick={() => addToCart(product)}
              >
                <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
                Add to cart
              </button>
            </div>

            {isBox ? (
              <div className="pdp__panel">
                <h2 className="pdp__panel-title">What&rsquo;s inside</h2>
                <p className="pdp__panel-note">
                  {product.packSize} sealed{' '}
                  {product.packSize === 1 ? 'box' : 'boxes'} · one whale per
                  box · {series?.name} {series?.label}
                </p>
                <ul className="pdp__odds">
                  {lineup.map((whale) => (
                    <li
                      key={whale.key}
                      className="pdp__odd"
                      style={{ '--r': whale.color }}
                    >
                      <span className="pdp__odd-suit" aria-hidden="true">
                        {whale.suit}
                      </span>
                      <span className="pdp__odd-name">{whale.whale}</span>
                      <span className="pdp__odd-tier">{whale.label}</span>
                      <span className="pdp__odd-pct">{whale.odds}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <dl className="pdp__specs">
                <div className="pdp__spec">
                  <dt>Material</dt>
                  <dd>Weighted acrylic</dd>
                </div>
                <div className="pdp__spec">
                  <dt>Finish</dt>
                  <dd>{finish}</dd>
                </div>
                <div className="pdp__spec">
                  <dt>Edition</dt>
                  <dd>{product.tag}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <nav className="pdp__nav" aria-label="Product navigation">
          <Link to={`/product/${prev.id}`} className="pdp__nav-link">
            <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>
              <em>Previous</em>
              {prev.name}
            </span>
          </Link>
          <Link
            to={`/product/${next.id}`}
            className="pdp__nav-link pdp__nav-link--next"
          >
            <span>
              <em>Next</em>
              {next.name}
            </span>
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  )
}
