import { FEATURED } from '../data/products.js'
import SectionHeader from './SectionHeader.jsx'
import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

// Featured Collection — four cards leading into the rarity lineup.
export default function FeaturedCollection() {
  return (
    <section className="container section" id="featured">
      <SectionHeader
        eyebrow="Featured Collection"
        ornament="✦"
        action="View all products →"
        actionTo="/shop"
      />
      <div className="product-grid">
        {FEATURED.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.07}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
