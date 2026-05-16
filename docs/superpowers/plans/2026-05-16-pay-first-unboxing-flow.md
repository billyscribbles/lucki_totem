# Pay-First Buy & Unbox Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make payment mandatory before unboxing — cart → checkout/pay → sealed boxes in inventory → open from inventory → spin → keep digital or ship.

**Architecture:** A dedicated full-screen `CheckoutOverlay` (mirroring `BlindBoxReveal`'s modal shell) handles a dummy card payment. The store splits its single `inventory` array into `purchases` (sealed box groups, each with a `remaining` counter) and `collection` (opened whales). `InventoryDrawer` gains a Sealed section; `BlindBoxReveal` is rebound to a purchase group with a "Box X of N" counter, "Spin Again", and an optional shipping form.

**Tech Stack:** React 18, Vite 5, plain CSS + CSS variables, Framer Motion, lucide-react. No TypeScript, no Tailwind.

**Testing note:** This repo has no test framework, and `CLAUDE.md` says not to introduce one ("Don't over-engineer. This is a template."). Verification per task is therefore `yarn build` (catches syntax/import/reference errors) plus targeted manual checks in `yarn dev`, consistent with the repo's existing verification checklist. Do **not** add vitest/jest.

---

## File Structure

**Create:**
- `src/components/CheckoutOverlay.jsx` — full-screen checkout: card form → processing → success.
- `src/components/CheckoutOverlay.css` — styles for the above.
- `src/components/ShippingForm.jsx` — controlled address form used by the reveal's shipping phase.

**Modify:**
- `src/data/products.js` — add `packSize` to each product.
- `src/store/LuckiContext.jsx` — split `inventory` into `purchases` + `collection`; add checkout state and actions.
- `src/components/CartDrawer.jsx` — "Checkout" opens the checkout overlay; remove the skip button.
- `src/components/InventoryDrawer.jsx` — two sections: Sealed box groups + opened Collection.
- `src/components/Drawer.css` — styles for the sealed-box card and inventory sections.
- `src/components/BlindBoxReveal.jsx` — bind to a purchase group; box counter; Spin Again; shipping phase.
- `src/components/BlindBoxReveal.css` — styles for the box counter, shipping form, and placed phase.
- `src/App.jsx` — mount `<CheckoutOverlay />`.

---

## Task 1: Add `packSize` to products

**Files:**
- Modify: `src/data/products.js`

- [ ] **Step 1: Add a `packSize` field to each `FEATURED` entry**

Add `packSize` immediately after each `price` line. Final file:

```js
// Featured Collection — the four cards above the rarity lineup.
// `orb` references a rarity key so the card glow matches the tier.
// `packSize` is how many sealed boxes the purchase yields.

export const FEATURED = [
  {
    id: 'blind-box-s01',
    tag: 'New',
    tagColor: '#d4dbe5',
    name: 'Lucki Blind Box',
    sub: 'Series 01 · one whale per box',
    price: 19.99,
    packSize: 1,
    orb: 'common',
    image: '/images/blind-box.png',
  },
  {
    id: 'blind-box-3pack',
    tag: '3-Pack',
    tagColor: '#3b82f6',
    name: 'Blind Box 3-Pack',
    sub: 'Three Series 01 boxes · triple the pulls',
    price: 54.99,
    packSize: 3,
    orb: 'rare',
    image: '/images/blind-box-3pack.png',
  },
  {
    id: 'blind-box-5pack',
    tag: '5-Pack',
    tagColor: '#f5c542',
    name: 'Blind Box 5-Pack',
    sub: 'Five Series 01 boxes · best legendary odds',
    price: 84.99,
    packSize: 5,
    orb: 'legend',
    image: '/images/blind-box-5pack.png',
  },
  {
    id: 'blind-box-megabox',
    tag: 'Mega Box',
    tagColor: '#c77dff',
    name: 'Blind Box Mega Box',
    sub: 'Eight Series 01 boxes · the full case',
    price: 129.99,
    packSize: 8,
    orb: 'ultra',
    image: '/images/blind-box-megabox.png',
  },
]
```

- [ ] **Step 2: Build**

Run: `yarn build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/products.js
git commit -m "feat: add packSize to featured products"
```

---

## Task 2: Split the store into `purchases` + `collection`

**Files:**
- Modify: `src/store/LuckiContext.jsx`

This task replaces the whole file. After it, `CartDrawer`/`InventoryDrawer`/`BlindBoxReveal` still reference old props — they are fixed in Tasks 3, 5, 6. `yarn build` still passes (JS does not error on undefined props); runtime is restored by Task 6.

- [ ] **Step 1: Replace `src/store/LuckiContext.jsx` with the new store**

```jsx
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { getRarity } from '../data/rarities.js'
import { makeSerial } from '../lib/draw.js'

// Single store for the buy + unbox loop. Three persisted arrays:
//   cart       — line items awaiting checkout
//   purchases  — sealed box groups (paid for, not yet opened)
//   collection — whales pulled from opened boxes
// Plus the overlay state (drawer / checkout / reveal) and the toast.
// One provider, one hook — the way this codebase stays lean.

const LuckiContext = createContext(null)
const STORE_KEY = 'lucki:v1'

function loadPersisted() {
  const empty = { cart: [], purchases: [], collection: [] }
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw)
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      collection: Array.isArray(parsed.collection) ? parsed.collection : [],
    }
  } catch {
    return empty
  }
}

function formatDate(d) {
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

export function LuckiProvider({ children }) {
  const persisted = useRef(loadPersisted()).current
  const [cart, setCart] = useState(persisted.cart)
  const [purchases, setPurchases] = useState(persisted.purchases)
  const [collection, setCollection] = useState(persisted.collection)
  const [drawer, setDrawer] = useState(null) // 'cart' | 'inventory' | null
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealBoxId, setRevealBoxId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Persist the parts worth keeping across sessions.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ cart, purchases, collection }),
      )
    } catch {
      /* private mode / quota — non-fatal */
    }
  }, [cart, purchases, collection])

  // Lock the page behind any overlay without a layout jump.
  useEffect(() => {
    const locked = revealOpen || checkoutOpen || drawer !== null
    if (!locked) return
    const { body, documentElement } = document
    const gutter = window.innerWidth - documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [revealOpen, checkoutOpen, drawer])

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const addToCart = useCallback(
    (product) => {
      setCart((c) => [...c, { ...product, lineId: `${product.id}-${Date.now()}` }])
      showToast(`Added ${product.name} to cart`)
    },
    [showToast],
  )

  const removeFromCart = useCallback((lineId) => {
    setCart((c) => c.filter((item) => item.lineId !== lineId))
  }, [])

  const openDrawer = useCallback((which) => setDrawer(which), [])
  const closeDrawer = useCallback(() => setDrawer(null), [])

  const openCheckout = useCallback(() => {
    setDrawer(null)
    setCheckoutOpen(true)
  }, [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  // Payment succeeded: turn every cart line into a sealed purchase
  // group, then empty the cart. Each group starts fully sealed
  // (remaining === packSize). Returns the new groups so the caller
  // can jump straight into opening the first one.
  const completePurchase = useCallback(() => {
    const stamp = Date.now()
    const date = formatDate(new Date())
    let groups = []
    setCart((c) => {
      groups = c.map((item, i) => ({
        id: `pur-${stamp}-${i}`,
        productId: item.id,
        name: item.name,
        sub: item.sub,
        orb: item.orb,
        packSize: item.packSize || 1,
        remaining: item.packSize || 1,
        purchasedAt: date,
      }))
      return []
    })
    setPurchases((p) => [...groups, ...p])
    return groups
  }, [])

  const openReveal = useCallback((boxId) => {
    setDrawer(null)
    setCheckoutOpen(false)
    setRevealBoxId(boxId)
    setRevealOpen(true)
  }, [])
  const closeReveal = useCallback(() => {
    setRevealOpen(false)
    setRevealBoxId(null)
  }, [])

  // Records one opened whale into the collection and decrements the
  // sealed box group it came from (dropping the group at zero).
  // `shipping` marks physical fulfilment; `shippingDetails` carries the
  // address when the collector chose to ship.
  const collect = useCallback(
    (rarityKey, { shipping, shippingDetails = null }) => {
      const rarity = getRarity(rarityKey)
      const item = {
        id: `${rarityKey}-${Date.now()}`,
        serial: makeSerial(),
        rarityKey,
        whale: rarity.whale,
        date: formatDate(new Date()),
        shipping,
        shippingDetails,
      }
      setCollection((inv) => [item, ...inv])
      setPurchases((p) =>
        p
          .map((g) =>
            g.id === revealBoxId ? { ...g, remaining: g.remaining - 1 } : g,
          )
          .filter((g) => g.remaining > 0),
      )
      if (shipping) {
        showToast(`Shipping the ${rarity.whale} to you`)
      } else {
        showToast(`${rarity.whale} added to your collection`)
      }
      return item
    },
    [revealBoxId, showToast],
  )

  const sealedCount = purchases.reduce((sum, g) => sum + g.remaining, 0)

  const value = {
    cart,
    purchases,
    collection,
    drawer,
    checkoutOpen,
    revealOpen,
    revealBoxId,
    toast,
    cartCount: cart.length,
    invCount: sealedCount + collection.length,
    addToCart,
    removeFromCart,
    openDrawer,
    closeDrawer,
    openCheckout,
    closeCheckout,
    completePurchase,
    openReveal,
    closeReveal,
    collect,
    showToast,
  }

  return <LuckiContext.Provider value={value}>{children}</LuckiContext.Provider>
}

export function useLucki() {
  const ctx = useContext(LuckiContext)
  if (!ctx) throw new Error('useLucki must be used within <LuckiProvider>')
  return ctx
}
```

- [ ] **Step 2: Build**

Run: `yarn build`
Expected: build succeeds. (Runtime is intentionally broken until Task 6 — that is expected here.)

- [ ] **Step 3: Commit**

```bash
git add src/store/LuckiContext.jsx
git commit -m "feat: split store into purchases and collection"
```

---

## Task 3: Cart drawer opens checkout

**Files:**
- Modify: `src/components/CartDrawer.jsx`

- [ ] **Step 1: Replace `src/components/CartDrawer.jsx`**

```jsx
import { ShoppingBag } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import Drawer from './Drawer.jsx'
import WhaleOrb from './WhaleOrb.jsx'

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
```

- [ ] **Step 2: Build**

Run: `yarn build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/CartDrawer.jsx
git commit -m "feat: cart checkout opens payment overlay"
```

---

## Task 4: Checkout overlay (card form → processing → success)

**Files:**
- Create: `src/components/CheckoutOverlay.jsx`
- Create: `src/components/CheckoutOverlay.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/components/CheckoutOverlay.jsx`**

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Lock, CheckCircle2 } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import './CheckoutOverlay.css'

// Dummy card-payment step. Validates field FORMAT only — no real
// charge, no network. On success the cart is converted into sealed
// purchase groups (see store: completePurchase).

const EMPTY_CARD = { number: '', expiry: '', cvc: '', name: '' }

function formatCardNumber(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function validateCard(card) {
  const errs = {}
  const digits = card.number.replace(/\s/g, '')
  if (digits.length < 13 || digits.length > 19) {
    errs.number = 'Enter a valid card number'
  }
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
    errs.expiry = 'Use MM/YY'
  } else {
    const month = Number(card.expiry.slice(0, 2))
    if (month < 1 || month > 12) errs.expiry = 'Invalid month'
  }
  if (!/^\d{3,4}$/.test(card.cvc)) errs.cvc = '3-digit code'
  if (!card.name.trim()) errs.name = 'Name required'
  return errs
}

export default function CheckoutOverlay() {
  const { checkoutOpen, closeCheckout, cart, completePurchase, openReveal, openDrawer } =
    useLucki()
  const [phase, setPhase] = useState('form') // form | processing | success
  const [card, setCard] = useState(EMPTY_CARD)
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null) // snapshot taken before the cart clears

  const modalRef = useRef(null)
  const closeRef = useRef(null)
  const processTimer = useRef(null)

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  // Reset everything whenever the overlay closes.
  useEffect(() => {
    if (checkoutOpen) return
    clearTimeout(processTimer.current)
    setPhase('form')
    setCard(EMPTY_CARD)
    setErrors({})
    setOrder(null)
  }, [checkoutOpen])

  useEffect(() => () => clearTimeout(processTimer.current), [])

  // Focus trap + Escape, mirroring BlindBoxReveal.
  useEffect(() => {
    if (!checkoutOpen) return undefined
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeCheckout()
        return
      }
      if (e.key !== 'Tab') return
      const f = modalRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input',
      )
      if (!f || f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [checkoutOpen, closeCheckout])

  const setField = (key, value) => {
    setCard((c) => ({ ...c, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handlePay = useCallback(
    (e) => {
      e.preventDefault()
      const errs = validateCard(card)
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
      setOrder({ items: cart, total })
      setPhase('processing')
      processTimer.current = setTimeout(() => {
        completePurchase()
        setPhase('success')
      }, 1500)
    },
    [card, cart, total, completePurchase],
  )

  if (!checkoutOpen) return null

  return (
    <div
      className="checkout-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      ref={modalRef}
    >
      <div className="checkout-modal__topbar">
        <div className="checkout-modal__brand">
          <span className="lucki-mark checkout-modal__mark">LUCKI</span>
          <span className="checkout-modal__status">
            {phase === 'success' ? 'Payment confirmed' : 'Secure checkout'}
          </span>
        </div>
        <button
          type="button"
          className="checkout-modal__close"
          onClick={closeCheckout}
          ref={closeRef}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
          Close
        </button>
      </div>

      <div className="checkout-modal__body">
        {phase === 'form' && (
          <CheckoutForm
            cart={cart}
            total={total}
            card={card}
            errors={errors}
            onField={setField}
            onPay={handlePay}
          />
        )}

        {phase === 'processing' && (
          <div className="checkout-processing">
            <span className="checkout-spinner" aria-hidden="true" />
            <p className="checkout-processing__text">Processing payment…</p>
          </div>
        )}

        {phase === 'success' && (
          <CheckoutSuccess
            order={order}
            onOpenNow={openReveal}
            onInventory={() => {
              closeCheckout()
              openDrawer('inventory')
            }}
          />
        )}
      </div>
    </div>
  )
}

function CheckoutForm({ cart, total, card, errors, onField, onPay }) {
  return (
    <form className="checkout-form" onSubmit={onPay} noValidate>
      <div className="checkout-summary">
        <p className="checkout-summary__label">Order summary</p>
        {cart.map((item) => (
          <div className="checkout-summary__row" key={item.lineId}>
            <span>{item.name}</span>
            <span>${item.price.toFixed(2)}</span>
          </div>
        ))}
        <div className="checkout-summary__total">
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <p className="checkout-form__label">Card details</p>

      <label className="field">
        <span className="field__label">Card number</span>
        <input
          className={`field__input${errors.number ? ' is-error' : ''}`}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={card.number}
          onChange={(e) => onField('number', formatCardNumber(e.target.value))}
        />
        {errors.number && <span className="field__error">{errors.number}</span>}
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Expiry</span>
          <input
            className={`field__input${errors.expiry ? ' is-error' : ''}`}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={(e) => onField('expiry', formatExpiry(e.target.value))}
          />
          {errors.expiry && <span className="field__error">{errors.expiry}</span>}
        </label>
        <label className="field">
          <span className="field__label">CVC</span>
          <input
            className={`field__input${errors.cvc ? ' is-error' : ''}`}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={card.cvc}
            onChange={(e) =>
              onField('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))
            }
          />
          {errors.cvc && <span className="field__error">{errors.cvc}</span>}
        </label>
      </div>

      <label className="field">
        <span className="field__label">Name on card</span>
        <input
          className={`field__input${errors.name ? ' is-error' : ''}`}
          autoComplete="cc-name"
          placeholder="Jane Collector"
          value={card.name}
          onChange={(e) => onField('name', e.target.value)}
        />
        {errors.name && <span className="field__error">{errors.name}</span>}
      </label>

      <button type="submit" className="btn btn--gold btn--block">
        <Lock size={13} strokeWidth={2} aria-hidden="true" />
        Pay ${total.toFixed(2)}
      </button>
      <p className="checkout-form__note">
        Demo checkout — no real card is charged.
      </p>
    </form>
  )
}

function CheckoutSuccess({ order, onOpenNow, onInventory }) {
  const { purchases } = useLucki()
  const firstId = purchases[0]?.id

  return (
    <div className="checkout-success">
      <span className="checkout-success__icon" aria-hidden="true">
        <CheckCircle2 size={44} strokeWidth={1.5} />
      </span>
      <h2 className="checkout-success__title">Payment successful</h2>
      <p className="checkout-success__sub">
        Your sealed boxes are waiting in your inventory.
      </p>

      {order && (
        <div className="checkout-success__recap">
          {order.items.map((item) => (
            <div className="checkout-summary__row" key={item.lineId}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary__total">
            <span>Paid</span>
            <strong>${order.total.toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div className="checkout-success__actions">
        <button
          type="button"
          className="btn btn--gold btn--block btn--sm"
          onClick={() => firstId && onOpenNow(firstId)}
          disabled={!firstId}
        >
          Open a Box Now <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          className="btn btn--line btn--block btn--sm"
          onClick={onInventory}
        >
          Go to Inventory
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/CheckoutOverlay.css`**

```css
.checkout-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(2, 4, 10, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: modal-fade-in 0.4s ease;
}

.checkout-modal__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 32px;
  border-bottom: 1px solid rgba(212, 179, 90, 0.12);
}
.checkout-modal__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.checkout-modal__mark {
  font-size: 18px;
  letter-spacing: 0.25em;
}
.checkout-modal__status {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.checkout-modal__close {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-dim);
  transition:
    color var(--t-hover),
    border-color var(--t-hover),
    transform var(--t-press);
}
.checkout-modal__close:hover {
  color: var(--gold);
  border-color: rgba(212, 179, 90, 0.5);
}
.checkout-modal__close:active {
  transform: scale(0.96);
}

.checkout-modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 24px;
}

/* ── Form ────────────────────────────────────────────────────────── */
.checkout-form {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(16, 20, 32, 0.6);
}
.checkout-summary__label,
.checkout-form__label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
}
.checkout-summary__row {
  display: flex;
  justify-content: space-between;
  font-family: var(--display);
  font-size: 14px;
  color: var(--ink-dim);
}
.checkout-summary__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.checkout-summary__total strong {
  font-family: var(--display);
  font-size: 20px;
  letter-spacing: 0;
  color: var(--gold-hi);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.field__input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(7, 9, 15, 0.7);
  font-family: var(--mono);
  font-size: 14px;
  color: var(--ink);
  transition: border-color var(--t-hover);
}
.field__input::placeholder {
  color: var(--ink-mute);
}
.field__input:focus {
  outline: none;
  border-color: var(--gold);
}
.field__input.is-error {
  border-color: var(--rar-ultra);
}
.field__error {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--rar-ultra);
}
.field-row {
  display: flex;
  gap: 12px;
}
.field-row .field {
  flex: 1;
}

.checkout-form__note {
  text-align: center;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--ink-mute);
}

/* ── Processing ──────────────────────────────────────────────────── */
.checkout-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin: auto 0;
}
.checkout-spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(212, 179, 90, 0.2);
  border-top-color: var(--gold);
  animation: checkout-spin 0.8s linear infinite;
}
@keyframes checkout-spin {
  to {
    transform: rotate(360deg);
  }
}
.checkout-processing__text {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

/* ── Success ─────────────────────────────────────────────────────── */
.checkout-success {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.checkout-success__icon {
  color: var(--rar-uncommon);
}
.checkout-success__title {
  font-family: var(--display);
  font-size: 26px;
  color: var(--ink);
}
.checkout-success__sub {
  font-size: 13px;
  color: var(--ink-dim);
  max-width: 280px;
}
.checkout-success__recap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 4px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(16, 20, 32, 0.6);
}
.checkout-success__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .checkout-modal__status {
    display: none;
  }
  .checkout-modal__body {
    padding: 28px 16px;
  }
}
```

- [ ] **Step 3: Mount the overlay in `src/App.jsx`**

Add the import alongside the other component imports:

```jsx
import CheckoutOverlay from './components/CheckoutOverlay.jsx'
```

And add `<CheckoutOverlay />` to the app-level overlay block so it reads:

```jsx
        <BlindBoxReveal />
        <CheckoutOverlay />
        <CartDrawer />
        <InventoryDrawer />
        <Toast />
```

- [ ] **Step 4: Build**

Run: `yarn build`
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/CheckoutOverlay.jsx src/components/CheckoutOverlay.css src/App.jsx
git commit -m "feat: add dummy checkout payment overlay"
```

---

## Task 5: Inventory drawer — Sealed + Collection sections

**Files:**
- Modify: `src/components/InventoryDrawer.jsx`
- Modify: `src/components/Drawer.css`

- [ ] **Step 1: Replace `src/components/InventoryDrawer.jsx`**

```jsx
import { Gem } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import { getRarity } from '../data/rarities.js'
import Drawer from './Drawer.jsx'
import WhaleOrb from './WhaleOrb.jsx'

// Inventory: sealed boxes still to open, plus the collection of whales
// already pulled.
export default function InventoryDrawer() {
  const { drawer, closeDrawer, purchases, collection, openReveal } = useLucki()
  const open = drawer === 'inventory'
  const isEmpty = purchases.length === 0 && collection.length === 0

  return (
    <Drawer open={open} onClose={closeDrawer} title="Your Inventory">
      {isEmpty ? (
        <div className="drawer-empty">
          <span className="drawer-empty__icon">
            <Gem size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="drawer-empty__title">Your inventory is empty</p>
          <p className="drawer-empty__sub">Buy a blind box to start collecting.</p>
        </div>
      ) : (
        <div className="inv">
          {purchases.length > 0 && (
            <section className="inv__section">
              <p className="inv__heading">Sealed Boxes</p>
              {purchases.map((group) => (
                <div className="seal-card" key={group.id}>
                  <div className="seal-card__top">
                    <WhaleOrb rarity={group.orb} size={50} animated={false} />
                    <span className="seal-card__info">
                      <span className="seal-card__name">{group.name}</span>
                      <span className="seal-card__sub">{group.sub}</span>
                    </span>
                    <span className="seal-card__count">×{group.remaining}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--gold btn--block btn--sm"
                    onClick={() => openReveal(group.id)}
                  >
                    Open Box <span aria-hidden="true">→</span>
                  </button>
                </div>
              ))}
            </section>
          )}

          {collection.length > 0 && (
            <section className="inv__section">
              <p className="inv__heading">Collection</p>
              {collection.map((item) => {
                const rarity = getRarity(item.rarityKey)
                return (
                  <div
                    className="inv-row"
                    key={item.id}
                    style={{ '--r': rarity.color }}
                  >
                    <WhaleOrb rarity={item.rarityKey} size={64} animated={false} />
                    <span className="inv-row__info">
                      <span className="inv-row__tier">{rarity.label}</span>
                      <span className="inv-row__name">{item.whale}</span>
                      <span className="inv-row__meta">
                        #{item.serial} · {item.date}
                      </span>
                    </span>
                    {item.shipping && <span className="inv-row__ship">Shipping</span>}
                  </div>
                )
              })}
            </section>
          )}
        </div>
      )}
    </Drawer>
  )
}
```

- [ ] **Step 2: Append section + sealed-card styles to `src/components/Drawer.css`**

Add at the end of the file:

```css
/* ── Inventory sections ──────────────────────────────────────────── */
.inv__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.inv__section + .inv__section {
  margin-top: 24px;
}
.inv__heading {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}

.seal-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(212, 179, 90, 0.28);
  border-radius: var(--radius-md);
  background: rgba(16, 20, 32, 0.6);
}
.seal-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.seal-card__info {
  flex: 1;
  min-width: 0;
}
.seal-card__name {
  display: block;
  font-family: var(--display);
  font-size: 15px;
  color: var(--ink);
}
.seal-card__sub {
  display: block;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.seal-card__count {
  display: grid;
  place-items: center;
  min-width: 38px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--gold);
  border-radius: var(--radius-sm);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--gold-hi);
}
```

- [ ] **Step 3: Build**

Run: `yarn build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/InventoryDrawer.jsx src/components/Drawer.css
git commit -m "feat: inventory shows sealed boxes and collection"
```

---

## Task 6: Reveal — box counter, Spin Again, optional shipping

**Files:**
- Create: `src/components/ShippingForm.jsx`
- Modify: `src/components/BlindBoxReveal.jsx`
- Modify: `src/components/BlindBoxReveal.css`

- [ ] **Step 1: Create `src/components/ShippingForm.jsx`**

```jsx
import { useState } from 'react'

// Dummy shipping form shown after a whale is pulled and the collector
// chooses physical fulfilment. Required fields must be non-empty;
// nothing is sent anywhere.

const EMPTY = {
  fullName: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  postal: '',
  country: '',
}

const REQUIRED = ['fullName', 'address1', 'city', 'region', 'postal', 'country']

export default function ShippingForm({ onSubmit, onBack }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    for (const key of REQUIRED) {
      if (!form[key].trim()) errs[key] = 'Required'
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form className="ship-form" onSubmit={handleSubmit} noValidate>
      <p className="ship-form__title">Where should we send it?</p>

      <label className="field">
        <span className="field__label">Full name</span>
        <input
          className={`field__input${errors.fullName ? ' is-error' : ''}`}
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
        />
        {errors.fullName && <span className="field__error">{errors.fullName}</span>}
      </label>

      <label className="field">
        <span className="field__label">Address</span>
        <input
          className={`field__input${errors.address1 ? ' is-error' : ''}`}
          autoComplete="address-line1"
          value={form.address1}
          onChange={(e) => setField('address1', e.target.value)}
        />
        {errors.address1 && <span className="field__error">{errors.address1}</span>}
      </label>

      <label className="field">
        <span className="field__label">Apartment, suite (optional)</span>
        <input
          className="field__input"
          autoComplete="address-line2"
          value={form.address2}
          onChange={(e) => setField('address2', e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">City</span>
          <input
            className={`field__input${errors.city ? ' is-error' : ''}`}
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
          />
          {errors.city && <span className="field__error">{errors.city}</span>}
        </label>
        <label className="field">
          <span className="field__label">State / Province</span>
          <input
            className={`field__input${errors.region ? ' is-error' : ''}`}
            autoComplete="address-level1"
            value={form.region}
            onChange={(e) => setField('region', e.target.value)}
          />
          {errors.region && <span className="field__error">{errors.region}</span>}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Postal code</span>
          <input
            className={`field__input${errors.postal ? ' is-error' : ''}`}
            autoComplete="postal-code"
            value={form.postal}
            onChange={(e) => setField('postal', e.target.value)}
          />
          {errors.postal && <span className="field__error">{errors.postal}</span>}
        </label>
        <label className="field">
          <span className="field__label">Country</span>
          <input
            className={`field__input${errors.country ? ' is-error' : ''}`}
            autoComplete="country-name"
            value={form.country}
            onChange={(e) => setField('country', e.target.value)}
          />
          {errors.country && <span className="field__error">{errors.country}</span>}
        </label>
      </div>

      <div className="ship-form__actions">
        <button type="button" className="btn btn--line btn--sm" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn--gold btn--sm">
          Confirm Shipping <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Replace `src/components/BlindBoxReveal.jsx`**

```jsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X } from 'lucide-react'
import { getRarity } from '../data/rarities.js'
import {
  BOX_LINEUP,
  pickWinner,
  shuffle,
  makeSerial,
  POOF_GAPS,
  SPIN_DECAY_START_MS,
} from '../lib/draw.js'
import { useLucki } from '../store/LuckiContext.jsx'
import MysteryBox from './MysteryBox.jsx'
import WhaleOrb from './WhaleOrb.jsx'
import ShippingForm from './ShippingForm.jsx'
import './BlindBoxReveal.css'

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// 28 shards flung from the centre outward — each carries its own
// destination through --tx / --ty custom properties.
function ParticleBurst() {
  const shards = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4
        const dist = 180 + Math.random() * 200
        return {
          id: i,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist,
          dur: 1.2 + Math.random() * 1.2,
          delay: Math.random() * 0.15,
          size: 4 + Math.random() * 8,
        }
      }),
    [],
  )
  return (
    <div className="reveal__particles" aria-hidden="true">
      {shards.map((s) => (
        <span
          key={s.id}
          className="reveal__particle"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--tx': `${s.tx}px`,
            '--ty': `${s.ty}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function RevealSparkles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    [],
  )
  return (
    <div className="reveal__sparkles" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="reveal__sparkle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// The reveal modal. Bound to one sealed box group (revealBoxId): eight
// boxes spin, vanish one by one, the survivor bursts open. After each
// pull the collector keeps the whale digitally or ships it. Multi-pack
// groups expose "Spin Again" until every box is opened.
export default function BlindBoxReveal() {
  const { revealOpen, revealBoxId, closeReveal, collect, purchases } = useLucki()

  // idle | ready | spinning | suspense | opening | revealed | shipping | placed
  const [phase, setPhase] = useState('idle')
  const [boxes, setBoxes] = useState([])
  const [winnerKey, setWinnerKey] = useState(null)
  const [winnerIdx, setWinnerIdx] = useState(-1)
  const [serial, setSerial] = useState(null)
  const [group, setGroup] = useState(null) // { packSize, startRemaining }
  const [openedCount, setOpenedCount] = useState(0)
  const [shipped, setShipped] = useState(false) // how the last box was placed

  const timers = useRef([])
  const modalRef = useRef(null)
  const closeRef = useRef(null)
  const spinRef = useRef(null)
  const actionRef = useRef(null)
  // Read purchases without making the open effect re-run on every collect().
  const purchasesRef = useRef(purchases)
  purchasesRef.current = purchases

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Draw and lay out a single box. Used on open and on Spin Again.
  const startBox = useCallback(() => {
    clearTimers()
    const win = pickWinner()
    setWinnerKey(win)
    setSerial(makeSerial())
    if (reducedMotion()) {
      setBoxes([])
      setWinnerIdx(-1)
      timers.current.push(setTimeout(() => setPhase('revealed'), 420))
      return
    }
    setBoxes(BOX_LINEUP.map((rarity, i) => ({ id: i, rarity, vanished: false })))
    setWinnerIdx(BOX_LINEUP.indexOf(win))
    setPhase('ready')
  }, [clearTimers])

  // Snapshot the box group and start the first box whenever the modal
  // opens; tear everything down when it closes.
  useEffect(() => {
    if (!revealOpen) {
      clearTimers()
      setPhase('idle')
      setBoxes([])
      setWinnerKey(null)
      setWinnerIdx(-1)
      setSerial(null)
      setGroup(null)
      setOpenedCount(0)
      setShipped(false)
      return undefined
    }
    const g = purchasesRef.current.find((x) => x.id === revealBoxId)
    setGroup(
      g
        ? { packSize: g.packSize, startRemaining: g.remaining }
        : { packSize: 1, startRemaining: 1 },
    )
    setOpenedCount(0)
    startBox()
    return clearTimers
  }, [revealOpen, revealBoxId, startBox, clearTimers])

  // Player hit Spin: boxes spin, the seven non-winners poof one by one
  // (slowing down), the survivor opens.
  const startSpin = useCallback(() => {
    if (phase !== 'ready') return
    const order = shuffle(boxes.map((b) => b.id).filter((id) => id !== winnerIdx))
    let t = SPIN_DECAY_START_MS
    order.forEach((id, n) => {
      const at = t
      timers.current.push(
        setTimeout(() => {
          setBoxes((b) => b.map((x) => (x.id === id ? { ...x, vanished: true } : x)))
        }, at),
      )
      t += POOF_GAPS[n]
    })
    timers.current.push(setTimeout(() => setPhase('suspense'), t - 200))
    timers.current.push(setTimeout(() => setPhase('opening'), t + 800))
    timers.current.push(setTimeout(() => setPhase('revealed'), t + 1900))
    setPhase('spinning')
  }, [phase, boxes, winnerIdx])

  // Place the just-pulled whale into the collection, then move to the
  // post-box screen.
  const placeWhale = useCallback(
    (shipping, shippingDetails) => {
      if (!winnerKey) return
      collect(winnerKey, { shipping, shippingDetails })
      setShipped(shipping)
      setOpenedCount((n) => n + 1)
      setPhase('placed')
    },
    [winnerKey, collect],
  )

  // Focus management: trap Tab inside the dialog, close on Escape.
  useEffect(() => {
    if (!revealOpen) return undefined
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeReveal()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = modalRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [revealOpen, closeReveal])

  // Move focus to the primary action as the flow advances.
  useEffect(() => {
    if (phase === 'ready') spinRef.current?.focus()
    else if (phase === 'revealed' || phase === 'placed') actionRef.current?.focus()
  }, [phase])

  if (!revealOpen) return null

  const winner = winnerKey ? getRarity(winnerKey) : null
  const remaining = boxes.filter((b) => !b.vanished).length
  const onStage =
    phase === 'ready' ||
    phase === 'spinning' ||
    phase === 'suspense' ||
    phase === 'opening'
  const stageStyle = winner ? { '--r': winner.color, '--r-glow': winner.glow } : undefined

  const packSize = group?.packSize || 1
  const startRemaining = group?.startRemaining || 1
  const boxNumber = Math.min(packSize - startRemaining + openedCount + 1, packSize)
  const hasMore = openedCount < startRemaining // more boxes left to open

  const boxLabel = packSize > 1 ? `Box ${boxNumber} of ${packSize} · ` : ''
  let status = `${boxLabel}Lucki Blind Box Series 01`
  if (phase === 'ready') status = `${boxLabel}Tap spin to draw your whale`
  else if (phase === 'spinning') status = `Drawing from the deck · ${remaining} remain`
  else if (phase === 'suspense') status = 'Your luck is sealed'
  else if (phase === 'revealed' && winner) status = `${winner.label} pulled`
  else if (phase === 'shipping') status = 'Shipping details'
  else if (phase === 'placed') status = hasMore ? `${boxLabel}Box opened` : 'All boxes opened'

  return (
    <div
      className="reveal-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Blind box opening"
      ref={modalRef}
    >
      <div className="reveal-modal__topbar">
        <div className="reveal-modal__brand">
          <span className="lucki-mark reveal-modal__mark">LUCKI</span>
          <span className="reveal-modal__status" aria-live="polite">
            {status}
          </span>
        </div>
        <button
          type="button"
          className="reveal-modal__close"
          onClick={closeReveal}
          ref={closeRef}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
          Close
        </button>
      </div>

      <div className="reveal-modal__stage" style={stageStyle}>
        {winner &&
          (phase === 'suspense' || phase === 'opening' || phase === 'revealed') && (
            <div className="reveal__aura" aria-hidden="true" />
          )}

        {onStage && (
          <div className="reveal__lineup">
            {boxes.map((b) => (
              <MysteryBox
                key={b.id}
                rarity={b.rarity}
                spinning={phase === 'spinning' && !b.vanished}
                vanished={b.vanished}
                isWinner={b.id === winnerIdx && phase !== 'ready'}
                opening={phase === 'opening' && b.id === winnerIdx}
                size={120}
              />
            ))}
          </div>
        )}

        {(phase === 'spinning' || phase === 'suspense') && (
          <p
            className={`reveal__caption${phase === 'suspense' ? ' reveal__caption--sealed' : ''}`}
          >
            {phase === 'suspense' ? 'Your luck is sealed' : `${remaining} boxes remain`}
          </p>
        )}

        {phase === 'ready' && (
          <button
            type="button"
            className="btn btn--gold reveal__spin"
            onClick={startSpin}
            ref={spinRef}
          >
            Spin to Open <span aria-hidden="true">→</span>
          </button>
        )}

        {phase === 'revealed' && winner && (
          <div className="reveal__prize">
            <RevealSparkles />
            <ParticleBurst />

            <p className="reveal__tier">{winner.label}</p>
            <span className="reveal__tier-rule" aria-hidden="true" />

            <div className="reveal__orb">
              <WhaleOrb rarity={winner.key} size={220} />
            </div>

            <h2 className="reveal__name">{winner.whale}</h2>
            <p className="reveal__quote">“{winner.tagline.join(' ')}”</p>
            <p className="reveal__serial">
              #{serial} · Series 01 · Odds {winner.odds}
            </p>

            <div className="reveal__actions">
              <button
                type="button"
                className="btn btn--line btn--sm"
                onClick={() => placeWhale(false, null)}
                ref={actionRef}
              >
                Keep Digital
              </button>
              <button
                type="button"
                className="btn btn--gold btn--sm"
                onClick={() => setPhase('shipping')}
              >
                Ship It to Me <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'shipping' && winner && (
          <div className="reveal__ship">
            <p className="reveal__ship-tier" style={{ color: winner.color }}>
              {winner.label} · {winner.whale}
            </p>
            <ShippingForm
              onSubmit={(details) => placeWhale(true, details)}
              onBack={() => setPhase('revealed')}
            />
          </div>
        )}

        {phase === 'placed' && winner && (
          <div className="reveal__placed">
            <div className="reveal__placed-orb">
              <WhaleOrb rarity={winner.key} size={120} animated={false} />
            </div>
            <p className="reveal__placed-msg">
              {shipped
                ? `${winner.whale} is on its way to you.`
                : `${winner.whale} added to your collection.`}
            </p>
            <div className="reveal__actions">
              {hasMore ? (
                <button
                  type="button"
                  className="btn btn--gold btn--sm"
                  onClick={startBox}
                  ref={actionRef}
                >
                  Spin Again <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--gold btn--sm"
                  onClick={closeReveal}
                  ref={actionRef}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Append shipping/placed styles to `src/components/BlindBoxReveal.css`**

Add at the end of the file:

```css
/* ── Shipping phase ──────────────────────────────────────────────── */
.reveal__ship {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.reveal__ship-tier {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  text-align: center;
}
.ship-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ship-form__title {
  font-family: var(--display);
  font-size: 18px;
  color: var(--ink);
  text-align: center;
}
.ship-form__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
}

/* ── Placed phase ────────────────────────────────────────────────── */
.reveal__placed {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  animation: reveal-in 0.6s ease-out;
}
.reveal__placed-msg {
  font-family: var(--display);
  font-size: 18px;
  color: var(--ink-dim);
  max-width: 320px;
}
```

> **Note:** the `.field`, `.field__label`, `.field__input`, `.field__error`
> and `.field-row` classes used by `ShippingForm` are defined in
> `CheckoutOverlay.css` (Task 4) and are global, so they apply here too.
> Do not redefine them.

- [ ] **Step 4: Build**

Run: `yarn build`
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ShippingForm.jsx src/components/BlindBoxReveal.jsx src/components/BlindBoxReveal.css
git commit -m "feat: reveal box counter, spin again, and shipping form"
```

---

## Task 7: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `yarn build`
Expected: build succeeds; vendor chunks split as before.

- [ ] **Step 2: Run the preview server**

Run: `yarn dev`
Expected: starts with zero warnings.

- [ ] **Step 3: Manually walk the full flow**

In the browser, confirm each of these:

1. Add a single Blind Box to cart → cart drawer shows it; only a
   "Checkout" button is present (no "Skip — Open Box Now").
2. Click Checkout → checkout overlay opens with the order summary.
3. Submit the form empty → inline errors appear on every field.
4. Enter `4242 4242 4242 4242`, `12/29`, `123`, a name → Pay →
   processing spinner → "Payment successful".
5. Click "Go to Inventory" → inventory shows a Sealed Boxes section
   with the box and an `×1` counter.
6. Click "Open Box" → reveal opens → Spin → whale revealed.
7. Click "Keep Digital" → "placed" screen → "Done" closes the modal.
8. Reopen inventory → the sealed box is gone; the whale is under
   Collection.
9. Buy a 3-Pack → after paying, click "Open a Box Now" → reveal shows
   "Box 1 of 3" → spin → "Ship It to Me" → fill the shipping form →
   Confirm → "placed" screen → "Spin Again" → counter reads
   "Box 2 of 3" → repeat to box 3 → "Done".
10. Inventory: the 3-Pack group is gone; three whales are in
    Collection, the shipped one tagged "Shipping".
11. Refresh the page → cart, sealed boxes and collection all persist.
12. Resize to 375px → checkout form, shipping form and inventory cards
    all lay out cleanly.

- [ ] **Step 4: Commit (only if verification surfaced fixes)**

If any fix was needed, commit it:

```bash
git add -A
git commit -m "fix: address pay-first flow verification issues"
```

If no fixes were needed, this task produces no commit.

---

## Self-Review Notes

- **Spec coverage:** packSize (T1), purchases/collection split + checkout
  state + scroll lock (T2), mandatory checkout / skip removed (T3),
  full card form + processing + success + Open Now/Inventory (T4),
  inventory Sealed + Collection sections with ×N badge (T5), box
  counter + Spin Again + optional shipping form (T6). All spec sections
  map to a task.
- **Type consistency:** purchase group shape
  `{ id, productId, name, sub, orb, packSize, remaining, purchasedAt }`
  is produced in `completePurchase` (T2) and consumed in `InventoryDrawer`
  (T5) and `BlindBoxReveal` (T6). `collect(rarityKey, { shipping,
  shippingDetails })` signature is defined in T2 and called in T6
  (`placeWhale`). `openReveal(boxId)` defined T2, called in T4/T5.
- **Known deliberate intermediate breakage:** after T2 the app is
  runtime-broken until T6 completes; every task in between still builds.
- **Placeholder scan:** no TBD/TODO/stub code remains; every step
  carries the complete content the implementer needs.
