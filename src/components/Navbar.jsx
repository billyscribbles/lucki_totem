import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Gem, ShoppingBag, Menu, X } from 'lucide-react'
import { site } from '../config/site.config.js'
import { useLucki } from '../store/LuckiContext.jsx'
import './Navbar.css'

// Sticky glass nav: wordmark, in-page links, and the two collection
// chrome buttons. On narrow viewports the center links collapse into a
// hamburger that opens a full-screen menu overlay.
export default function Navbar() {
  const { cartCount, invCount, openDrawer } = useLucki()
  const headerRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // While the mobile menu is open, freeze body scroll and let Escape
  // close it. Both are torn down the moment the menu closes.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <>
      <header className="nav" ref={headerRef}>
        <div className="container nav__inner">
          <Link className="nav__wordmark" to="/" aria-label="LUCKI, home">
            <img className="nav__logo" src="/brand/logo-wordmark.png" alt="LUCKI" />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {site.nav.map((item, i) =>
              item.href.startsWith('#') ? (
                <a key={`${item.label}-${i}`} className="nav__link" href={item.href}>
                  {item.label}
                </a>
              ) : (
                <Link key={`${item.label}-${i}`} className="nav__link" to={item.href}>
                  {item.label}
                </Link>
              ),
            )}
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
            <button
              type="button"
              className="nav__icon nav__burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu. Portalled to <body> so position:fixed is
          viewport-relative — the nav's backdrop-filter would otherwise make
          the header a containing block and clamp the overlay to nav height.
          Rendered always so it can fade both ways. */}
      {createPortal(
        <div
          className={`nav__overlay${menuOpen ? ' nav__overlay--open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <div className="container nav__overlay-bar">
            <img className="nav__overlay-logo" src="/brand/logo-wordmark.png" alt="LUCKI" />
            <button
              type="button"
              className="nav__icon"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <nav className="container nav__overlay-links" aria-label="Mobile">
            {site.nav.map((item, i) => {
              const close = () => setMenuOpen(false)
              const style = { '--d': `${i * 50}ms` }
              return item.href.startsWith('#') ? (
                <a
                  key={`${item.label}-${i}`}
                  className="nav__overlay-link"
                  href={item.href}
                  style={style}
                  onClick={close}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={`${item.label}-${i}`}
                  className="nav__overlay-link"
                  to={item.href}
                  style={style}
                  onClick={close}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>,
        document.body,
      )}
    </>
  )
}
