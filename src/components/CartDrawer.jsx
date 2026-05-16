import { ShoppingBag, ImageOff } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import Drawer from './Drawer.jsx'

// Cart panel. Checkout now hands off to the payment overlay — there is
// no longer a way to skip straight into the reveal.
export default function CartDrawer() {
  const { drawer, closeDrawer, cart, removeFromCart, openCheckout } = useLucki()
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
                <span className="cart-row__media">
                  {item.image ? (
                    <img
                      className="cart-row__image"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <ImageOff size={18} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </span>
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
              <button
                type="button"
                className="btn btn--gold btn--block btn--sm"
                onClick={openCheckout}
              >
                Checkout <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
