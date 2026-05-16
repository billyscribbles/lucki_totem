import { useEffect } from 'react'
import { PROTECTORS } from '../data/products.js'
import SEO from '../lib/seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import './ShopPage.css'

// The Protector Shop — standalone card protectors sold directly, no
// blind box. Same product grid as the Featured Collection, its own page.
export default function ShopPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="shop">
      <SEO
        title="Card Protectors"
        description="Shop standalone LUCKI whale card protectors — pick the whale you want, no blind box required."
        path="/shop"
      />
      <div className="container section">
        <header className="shop__intro">
          <p className="shop__eyebrow">
            <span aria-hidden="true">♦</span> The Protector Shop
          </p>
          <h1 className="shop__title">
            Pick your <span className="shop__title-accent">card protector.</span>
          </h1>
          <p className="shop__sub">
            Standalone acrylic whales — no mystery, no blind box. Choose the
            whale you want and it ships straight to your table.
          </p>
        </header>

        <div className="product-grid">
          {PROTECTORS.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
