import { useLayoutEffect, useRef } from 'react'
import { Gem, ShoppingBag } from 'lucide-react'
import { site } from '../config/site.config.js'
import { useLucki } from '../store/LuckiContext.jsx'
import './Navbar.css'

// Sticky glass nav: wordmark, in-page links, and the two collection
// chrome buttons. Center links collapse on narrow viewports.
export default function Navbar() {
  const { cartCount, invCount, openDrawer } = useLucki()
  const headerRef = useRef(null)

  // Publish the live nav height as --nav-h so the hero can lock itself to
  // exactly one screen below it, on any viewport. ResizeObserver covers
  // logo load, font scaling and window resizes.
  useLayoutEffect(() => {
    const header = headerRef.current
    if (!header) return
    const publish = () =>
      document.documentElement.style.setProperty('--nav-h', `${header.offsetHeight}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  return (
    <header className="nav" ref={headerRef}>
      <div className="container nav__inner">
        <a className="nav__wordmark" href="#top" aria-label="LUCKI, back to top">
          <img className="nav__logo" src="/brand/logo-wordmark.png" alt="LUCKI" />
        </a>

        <nav className="nav__links" aria-label="Primary">
          {site.nav.map((item, i) => (
            <a key={`${item.label}-${i}`} className="nav__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__icon"
            onClick={() => openDrawer('inventory')}
            aria-label={`Open collection, ${invCount} ${invCount === 1 ? 'whale' : 'whales'}`}
          >
            <Gem size={18} strokeWidth={1.5} aria-hidden="true" />
            {invCount > 0 && <span className="nav__badge">{invCount}</span>}
          </button>
          <button
            type="button"
            className="nav__icon"
            onClick={() => openDrawer('cart')}
            aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} aria-hidden="true" />
            {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
