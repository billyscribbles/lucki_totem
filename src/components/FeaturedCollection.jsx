import { Plus } from 'lucide-react'
import { FEATURED } from '../data/products.js'
import { getRarity } from '../data/rarities.js'
import { useLucki } from '../store/LuckiContext.jsx'
import SectionHeader from './SectionHeader.jsx'
import WhaleOrb from './WhaleOrb.jsx'
import Reveal from './Reveal.jsx'
import './FeaturedCollection.css'

function ProductCard({ product }) {
  const { addToCart } = useLucki()
  const rarity = getRarity(product.orb)

  return (
    <article
      className="product"
      style={{ '--r': rarity.color, '--r-glow': rarity.glow }}
    >
      <span className="product__tag" style={{ '--tag': product.tagColor }}>
        {product.tag}
      </span>

      <div className="product__media">
        {product.image ? (
          <img
            className="product__image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <WhaleOrb rarity={product.orb} animated={false} />
        )}
      </div>

      <div className="product__body">
        <h3 className="product__name">{product.name}</h3>
        <p className="product__sub">{product.sub}</p>
      </div>

      <div className="product__footer">
        <span className="product__price">${product.price.toFixed(2)}</span>
        <button
          type="button"
          className="product__add"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

// Featured Collection — four cards leading into the rarity lineup.
export default function FeaturedCollection() {
  return (
    <section className="container section" id="featured">
      <SectionHeader
        eyebrow="Featured Collection"
        ornament="✦"
        action="View all products →"
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
