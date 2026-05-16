import { Plus, ImageOff } from 'lucide-react'
import { getRarity } from '../data/rarities.js'
import { useLucki } from '../store/LuckiContext.jsx'
import './ProductCard.css'

// One purchasable card — shared by the Featured Collection (blind boxes)
// and the /shop page (standalone protectors). `orb` keys the card glow
// to a rarity tier; products without an `image` show a coming-soon
// placeholder (the protectors have no artwork yet).
export default function ProductCard({ product }) {
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
          <div className="product__placeholder">
            <ImageOff size={26} strokeWidth={1.5} aria-hidden="true" />
            <span>Image coming soon</span>
          </div>
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
