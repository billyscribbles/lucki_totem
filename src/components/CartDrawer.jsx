import { ShoppingBag } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import Drawer from './Drawer.jsx'
import WhaleOrb from './WhaleOrb.jsx'

// Cart panel. Checkout and the prototype "skip" shortcut both jump
// straight into the reveal — there is no real payment step here.
export default function CartDrawer() {
  const { drawer, closeDrawer, cart, removeFromCart, openReveal } = useLucki()
  const open = drawer === 'cart'
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <Drawer open={open} onClose={closeDrawer} title="Your Cart">
      {cart.length === 0 ? (
        <div className="drawer-empty">
          <span className="drawer-empty__icon">
            <ShoppingBag size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="drawer-empty__title">Your cart is empty</p>
          <p className="drawer-empty__sub">Add a blind box to get a pull going.</p>
        </div>
      ) : (
        <div className="cart">
          <div className="cart__items">
            {cart.map((item) => (
              <div className="cart-row" key={item.lineId}>
                <WhaleOrb rarity={item.orb} size={50} animated={false} />
                <span className="cart-row__info">
                  <span className="cart-row__name">{item.name}</span>
                  <span className="cart-row__sub">{item.sub}</span>
                </span>
                <span className="cart-row__price">${item.price.toFixed(2)}</span>
                <button
                  type="button"
                  className="cart-row__remove"
                  onClick={() => removeFromCart(item.lineId)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart__footer">
            <p className="cart__total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </p>
            <div className="cart__actions">
              <button type="button" className="btn btn--gold btn--block btn--sm" onClick={openReveal}>
                Checkout <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="btn btn--line btn--block btn--sm" onClick={openReveal}>
                Skip — Open Box Now
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
