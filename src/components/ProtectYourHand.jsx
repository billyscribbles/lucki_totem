import Reveal from './Reveal.jsx'
import './ProtectYourHand.css'

const FEATURES = [
  { glyph: '◇', title: 'Premium clarity', sub: 'A crystal-clear read on every card' },
  { glyph: '♛', title: 'Tournament grade', sub: 'Weighted bases, cast to last' },
  { glyph: '♥', title: 'Adorable design', sub: 'A whale that earns its seat' },
]

const CORNERS = ['tl', 'tr', 'bl', 'br']

// Protect Your Hand — the protectors pitch inside one framed panel.
export default function ProtectYourHand() {
  return (
    <section className="container protect" id="protect">
      <Reveal>
        <div className="protect__panel">
          {CORNERS.map((c) => (
            <span key={c} className={`protect__corner protect__corner--${c}`} aria-hidden="true" />
          ))}

          <div className="protect__grid">
            <div className="protect__copy">
              <h2 className="protect__title">
                Protect your hand.
                <br />
                <span className="protect__title-accent">Show your luck.</span>
              </h2>
              <p className="protect__lede">
                Premium acrylic card protectors with weighted bases. Cast to last,
                designed to be seen.
              </p>

              <ul className="protect__features">
                {FEATURES.map((f) => (
                  <li key={f.title} className="protect__feature">
                    <span className="protect__feature-glyph" aria-hidden="true">
                      {f.glyph}
                    </span>
                    <span className="protect__feature-title">{f.title}</span>
                    <span className="protect__feature-sub">{f.sub}</span>
                  </li>
                ))}
              </ul>

              <a className="btn btn--line btn--sm protect__cta" href="#featured">
                Shop Protectors <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="protect__tableau">
              <img
                className="protect__photo"
                src="/images/protect-your-hand.png"
                alt="A glossy blue whale card protector resting on playing cards amid poker chips on a green felt table"
                loading="lazy"
                width="1672"
                height="941"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
