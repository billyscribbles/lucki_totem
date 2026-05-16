import { site } from '../config/site.config.js'
import './Footer.css'

// Best-effort in-page targets for footer links on this single-scroll site.
const LINK_TARGETS = {
  'Blind Boxes': '#featured',
  Protectors: '/shop',
  Bundles: '#featured',
  Apparel: '#featured',
  'Rarity Guide': '#rarities',
  'Collectors Club': '#protect',
  'Drop Schedule': '#featured',
  FAQ: '#footer',
  About: '#footer',
  Press: '#footer',
  Contact: '#footer',
  Terms: '#footer',
}

export default function Footer() {
  const { footer } = site

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img className="footer__logo" src="/brand/logo-wordmark.png" alt="LUCKI" />
            <p className="footer__tagline">
              Collect your luck.
              <br />
              One blind box at a time.
            </p>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.title} className="footer__col" aria-label={col.title}>
              <h3 className="footer__col-title">{col.title}</h3>
              <ul className="footer__links">
                {col.links.map((label) => (
                  <li key={label}>
                    <a className="footer__link" href={LINK_TARGETS[label] || '#top'}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer__strip">
          <span>{footer.copyright}</span>
          <span>{footer.notice}</span>
        </div>
      </div>
    </footer>
  )
}
