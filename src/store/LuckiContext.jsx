import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { getRarity } from '../data/rarities.js'
import { makeSerial } from '../lib/draw.js'

// Single store for the shopping + collecting loop: cart, inventory,
// which overlay is open, and the toast. Cart and inventory persist to
// localStorage so a refresh keeps your pulls. No external state lib —
// one provider, one hook, the way the rest of this codebase stays lean.

const LuckiContext = createContext(null)
const STORE_KEY = 'lucki:v1'

function loadPersisted() {
  if (typeof window === 'undefined') return { cart: [], inventory: [] }
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return { cart: [], inventory: [] }
    const parsed = JSON.parse(raw)
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
    }
  } catch {
    return { cart: [], inventory: [] }
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
  const [inventory, setInventory] = useState(persisted.inventory)
  const [drawer, setDrawer] = useState(null) // 'cart' | 'inventory' | null
  const [revealOpen, setRevealOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Persist the parts worth keeping across sessions.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ cart, inventory }))
    } catch {
      /* private mode / quota — non-fatal */
    }
  }, [cart, inventory])

  // Lock the page behind any overlay without a layout jump.
  useEffect(() => {
    const locked = revealOpen || drawer !== null
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
  }, [revealOpen, drawer])

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

  const openReveal = useCallback(() => {
    setDrawer(null)
    setRevealOpen(true)
  }, [])
  const closeReveal = useCallback(() => setRevealOpen(false), [])

  // Records a pulled whale into the collection. `shipping` marks whether
  // the collector chose physical fulfilment over a digital keep.
  const collect = useCallback(
    (rarityKey, { shipping }) => {
      const rarity = getRarity(rarityKey)
      const item = {
        id: `${rarityKey}-${Date.now()}`,
        serial: makeSerial(),
        rarityKey,
        whale: rarity.whale,
        date: formatDate(new Date()),
        shipping,
      }
      setInventory((inv) => [item, ...inv])
      setRevealOpen(false)
      if (shipping) {
        showToast(`Shipping the ${rarity.whale} to you`)
      } else {
        showToast(`${rarity.whale} added to your collection`)
        setTimeout(() => setDrawer('inventory'), 220)
      }
      return item
    },
    [showToast],
  )

  const value = {
    cart,
    inventory,
    drawer,
    revealOpen,
    toast,
    cartCount: cart.length,
    invCount: inventory.length,
    addToCart,
    removeFromCart,
    openDrawer,
    closeDrawer,
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
