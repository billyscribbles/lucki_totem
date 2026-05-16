import { useMemo } from 'react'
import { useLucki } from '../store/LuckiContext.jsx'
import { FEATURED } from '../data/products.js'
import './Hero.css'

const HEADLINE = ['Collect', 'Your', 'Luck']

// 16 gold dots scattered once and left to twinkle. Positions are stable
// across renders so they never jump.
function Sparkles({ count = 16 }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: 10 + Math.random() * 80,
        top: 15 + Math.random() * 70,
        dur: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    [count],
  )
  return (
    <div className="hero__sparkles" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="hero__sparkle"
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

// Full-bleed hero. Five stacked layers: base wash, the blended whale
// render, a left darken to anchor type, a vignette, then the copy and
// floating chrome.
export default function Hero() {
  const { addToCart, openDrawer } = useLucki()

  // Pay-first flow: the CTA can't open a box for free — it drops the
  // Series 01 single box into the cart and opens checkout from there.
  const startBuy = () => {
    addToCart(FEATURED[0])
    openDrawer('cart')
  }

  return (
    <section className="hero" id="top">
      <div className="hero__wash" aria-hidden="true" />

      <div className="hero__image-layer" aria-hidden="true">
        <img className="hero__image" src="/images/hero-whales.png" alt="" />
        <div className="hero__bloom" />
      </div>

      <div className="hero__darken" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <div className="container hero__shell">
        <div className="hero__copy">
          <p className="hero__eyebrow hero__rise" style={{ '--d': '0ms' }}>
            <span aria-hidden="true">♠</span> Series 01 · Now Dropping
          </p>

          <h1 className="hero__headline hero__rise" style={{ '--d': '60ms' }}>
            {HEADLINE.map((word, i) => (
              <span
                key={word}
                className={`hero__word${i === HEADLINE.length - 1 ? ' hero__word--accent' : ''}`}
              >
                {word}
              </span>
            ))}
          </h1>

          <div className="hero__divider hero__rise" style={{ '--d': '140ms' }} aria-hidden="true">
            <span className="hero__rule" />
            <span className="hero__pip">♠</span>
            <span className="hero__rule" />
          </div>

          <p className="hero__lede hero__rise" style={{ '--d': '200ms' }}>
            Blind box whales. Poker card protectors. Legendary rarities.
            <br />
            Infinite luck, pulled one box at a time.
          </p>

          <div className="hero__ctas hero__rise" style={{ '--d': '280ms' }}>
            <button type="button" className="btn btn--gold hero__cta" onClick={startBuy}>
              Get a Blind Box <span aria-hidden="true">→</span>
            </button>
            <a className="btn btn--ghost hero__cta" href="#rarities">
              Explore Rarities
            </a>
          </div>

          <div className="hero__trust hero__rise" style={{ '--d': '380ms' }}>
            <span className="hero__stars" aria-hidden="true">
              ★★★★★
            </span>
            <span>
              <strong>4.9</strong> / 5
            </span>
            <span className="hero__trust-rule" aria-hidden="true" />
            <span>
              <strong>10,000+</strong> Collectors
            </span>
          </div>
        </div>
      </div>

      <div className="hero__tag hero__tag--top" aria-hidden="true">
        <span className="hero__pulse" />
        8 Rarities · 1 Box
      </div>

      <div className="hero__tag hero__tag--card" aria-hidden="true">
        <span className="hero__tag-label">
          <span className="hero__tag-eyebrow">Legendary Pull</span>
          <span className="hero__tag-value">1% Odds</span>
        </span>
      </div>

      <a className="hero__scroll" href="#featured" aria-label="Scroll to the collection">
        Scroll
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>

      <Sparkles />
    </section>
  )
}
