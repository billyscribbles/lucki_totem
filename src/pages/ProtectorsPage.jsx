import { useEffect } from 'react'
import { PROTECTORS } from '../data/products.js'
import SEO from '../lib/seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import './ShopPage.css'

// The Protector Shop — standalone card protectors only, no blind box.
// Shares the .shop* layout with ShopPage; /shop is the everything cut.
export default function ProtectorsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="shop">
      <SEO
        title="Protectors"
        description="Shop standalone LUCKI card protectors — pick the collectable you want, no blind box required."
        path="/protectors"
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
            Standalone acrylic collectables — no mystery, no blind box. Choose
            the one you want and it ships straight to your table.
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
