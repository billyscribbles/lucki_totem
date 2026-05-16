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

// Demo toggle: card-detail validation is disabled so any (or empty)
// card details go through. Flip back to `false` to require real input.
const SKIP_CARD_VALIDATION = true

function validateCard(card) {
  if (SKIP_CARD_VALIDATION) return {}
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
            onClose={closeCheckout}
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

function CheckoutSuccess({ order, onOpenNow, onInventory, onClose }) {
  const { purchases } = useLucki()
  // A protector-only order has no sealed boxes to open — it just ships.
  const hasBox = order?.items.some((item) => item.type !== 'protector')
  const firstId = purchases[0]?.id

  return (
    <div className="checkout-success">
      <span className="checkout-success__icon" aria-hidden="true">
        <CheckCircle2 size={44} strokeWidth={1.5} />
      </span>
      <h2 className="checkout-success__title">
        {hasBox ? 'Payment successful' : 'Order confirmed'}
      </h2>
      <p className="checkout-success__sub">
        {hasBox
          ? 'Your sealed boxes are waiting in your inventory.'
          : 'Your card protectors are on the way.'}
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
        {hasBox ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            className="btn btn--gold btn--block btn--sm"
            onClick={onClose}
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
