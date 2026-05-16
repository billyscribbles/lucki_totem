import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../lib/seo.jsx'
import Reveal from '../components/Reveal.jsx'
import './AboutPage.css'

const CORNERS = ['tl', 'tr', 'bl', 'br']

// What LUCKI stands for — the protect-block feature pattern, reused.
const VALUES = [
  {
    glyph: '♠',
    title: 'Built to last',
    sub: 'Cast acrylic, weighted bases — made to ride out a thousand sessions.',
  },
  {
    glyph: '♦',
    title: 'Honest drops',
    sub: 'Real odds, printed on the box. The pull is luck, never a trick.',
  },
  {
    glyph: '♥',
    title: 'Collectible joy',
    sub: 'Eight rarities, one sealed box. The fun is in not knowing.',
  },
]

// About — LUCKI's origin story: toys, gachapon, and the poker table.
export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="about">
      <SEO
        title="About"
        description="LUCKI began with two obsessions — the toys we never grew out of and the poker table we never left. Collectible whales, born from gachapon, made for the poker community."
        path="/about"
      />

      <div className="container section">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <Reveal>
          <header className="about__hero">
            <p className="about__eyebrow">
              <span aria-hidden="true">♠</span> Our Story
            </p>
            <h1 className="about__title">
              We make luck you can{' '}
              <span className="about__title-accent">hold.</span>
            </h1>
            <p className="about__lede">
              LUCKI began with two obsessions — the toys we never grew out of,
              and the poker table we never left. This is what happened when we
              put them in the same box.
            </p>
          </header>
        </Reveal>

        {/* ── Origin story ──────────────────────────────────────── */}
        <Reveal>
          <section className="about__block">
            <h2 className="about__heading">
              It started with a quarter and a machine.
            </h2>
            <div className="about__prose">
              <p>
                Some of us grew up feeding coins into gachapon machines — that
                little mechanical heartbeat, the twist, the rattle, the capsule
                dropping into your palm. You never knew what you'd get. That was
                the whole point.
              </p>
              <p>
                The rest of us grew up at the poker table. Late nights, felt
                under our forearms, a card protector that meant something — a
                lucky charm doing a real job. Two rituals, one feeling: the
                thrill of the unknown, and the comfort of something you can
                hold.
              </p>
              <p>
                LUCKI is those two worlds cast in acrylic. Collectible whales
                that ride in a sealed blind box, then earn a permanent seat on
                your cards.
              </p>
            </div>
          </section>
        </Reveal>

        {/* ── The pull ──────────────────────────────────────────── */}
        <Reveal>
          <section className="about__split">
            <div className="about__split-copy">
              <h2 className="about__heading">The pull is the point.</h2>
              <div className="about__prose">
                <p>
                  We could just sell you the whale you want — and we do, over
                  in the Protector Shop. But the blind box exists because the
                  best part of collecting isn't the having. It's the
                  not-knowing, right up until you do.
                </p>
                <p>
                  Eight rarities. One sealed box. Honest odds printed right on
                  it. Every box is a small bet with yourself — and like any
                  good poker hand, the story is in the reveal.
                </p>
              </div>
              <Link
                className="btn btn--line btn--sm about__inline-cta"
                to="/blind-boxes"
              >
                Open a Blind Box <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="about__split-media">
              <img
                className="about__photo"
                src="/images/about-whale.png"
                alt="A gold crowned LUCKI whale resting on a stack of poker chips"
                loading="lazy"
              />
            </div>
          </section>
        </Reveal>

        {/* ── For the poker community ───────────────────────────── */}
        <Reveal>
          <section className="about__panel">
            {CORNERS.map((c) => (
              <span
                key={c}
                className={`about__corner about__corner--${c}`}
                aria-hidden="true"
              />
            ))}
            <h2 className="about__heading about__heading--center">
              Made for the people at the table.
            </h2>
            <div className="about__prose about__prose--center">
              <p>
                We love poker. Not the myth of it — the actual room. The
                regulars who nod when you sit down. The superstitions nobody
                admits to. The protector that's been on your cards for six
                years because it was there the night everything broke right.
              </p>
              <p>
                LUCKI is our love letter to that community. We build for the
                home game and the card room, for the grinder and the
                once-a-month crew. If you've ever set something small and lucky
                on top of your hand, you already get it.
              </p>
            </div>
          </section>
        </Reveal>

        {/* ── Values / craft ────────────────────────────────────── */}
        <Reveal>
          <section className="about__block">
            <h2 className="about__heading">What we stand on.</h2>
            <ul className="about__values">
              {VALUES.map((v) => (
                <li key={v.title} className="about__value">
                  <span className="about__value-glyph" aria-hidden="true">
                    {v.glyph}
                  </span>
                  <span className="about__value-title">{v.title}</span>
                  <span className="about__value-sub">{v.sub}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* ── Closing CTA ───────────────────────────────────────── */}
        <Reveal>
          <section className="about__cta">
            <h2 className="about__cta-title">Pull your luck.</h2>
            <p className="about__cta-sub">
              Series 01 is live. One twist of the box and you're in.
            </p>
            <div className="about__cta-actions">
              <Link className="btn btn--gold" to="/blind-boxes">
                Open a Blind Box
              </Link>
              <Link className="btn btn--line" to="/shop">
                Browse the Shop
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  )
}
