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

  // Payment succeeded: turn every blind-box cart line into a sealed
  // purchase group, then empty the cart. Standalone protectors ship
  // directly — they never become openable boxes. Each group starts
  // fully sealed (remaining === packSize). Returns the new groups so
  // the caller can jump straight into opening the first one.
  const completePurchase = useCallback(() => {
    const stamp = Date.now()
    const date = formatDate(new Date())
    let groups = []
    setCart((c) => {
      groups = c
        .filter((item) => item.type !== 'protector')
        .map((item, i) => ({
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
  // sealed box stack. Every pack pools into one Series 01 stack, so a
  // pull just draws down the first group with boxes left (dropping the
  // group at zero). `shipping` marks physical fulfilment;
  // `shippingDetails` carries the address when the collector chose to ship.
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
      setPurchases((p) => {
        const idx = p.findIndex((g) => g.remaining > 0)
        if (idx === -1) return p
        return p
          .map((g, i) => (i === idx ? { ...g, remaining: g.remaining - 1 } : g))
          .filter((g) => g.remaining > 0)
      })
      if (shipping) {
        showToast(`Shipping the ${rarity.whale} to you`)
      } else {
        showToast(`${rarity.whale} added to your collection`)
      }
      return item
    },
    [showToast],
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
