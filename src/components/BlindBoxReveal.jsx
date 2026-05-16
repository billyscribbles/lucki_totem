import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X, Package } from 'lucide-react'
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
import OddsLegend from './OddsLegend.jsx'
import './BlindBoxReveal.css'

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Tracks the ≤600px breakpoint so the stage can scale boxes, the orb and
// the burst to fit a phone. Matches the `max-width: 600px` query the CSS
// uses, keeping the JS-driven sizes and the layout in lockstep.
function useIsMobile() {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 600px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)')
    const onChange = (e) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

// 28 shards flung from the centre outward — each carries its own
// destination through --tx / --ty custom properties. On phones the throw
// distance shrinks so the burst stays inside the narrower stage.
function ParticleBurst({ compact = false }) {
  const shards = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4
        const dist = compact ? 90 + Math.random() * 110 : 180 + Math.random() * 200
        return {
          id: i,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist,
          dur: 1.2 + Math.random() * 1.2,
          delay: Math.random() * 0.15,
          size: 4 + Math.random() * 8,
        }
      }),
    [compact],
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

// The reveal modal. Bound to one sealed box group (revealBoxId): ten
// boxes spin, vanish one by one, the survivor bursts open. After each
// pull the collector keeps the whale digitally or ships it. Multi-pack
// groups expose "Spin Again" until every box is opened.
export default function BlindBoxReveal() {
  const { revealOpen, revealBoxId, closeReveal, collect, openDrawer, purchases } =
    useLucki()

  // idle | ready | spinning | suspense | opening | revealed | shipping
  const [phase, setPhase] = useState('idle')
  const [boxes, setBoxes] = useState([])
  const [winnerKey, setWinnerKey] = useState(null)
  const [winnerIdx, setWinnerIdx] = useState(-1)
  const [serial, setSerial] = useState(null)
  const [group, setGroup] = useState(null) // { packSize, startRemaining }
  const [openedCount, setOpenedCount] = useState(0)
  const isMobile = useIsMobile()

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

  // Player hit Spin: boxes spin, the nine non-winners poof one by one
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

  // Keep the pulled whale as a digital collectible, then exit to the
  // inventory drawer — the reveal flow ends here.
  const keepDigital = useCallback(() => {
    if (!winnerKey) return
    collect(winnerKey, { shipping: false })
    openDrawer('inventory')
    closeReveal()
  }, [winnerKey, collect, openDrawer, closeReveal])

  // Submit shipping details for a physical whale, then close the reveal.
  const shipWhale = useCallback(
    (shippingDetails) => {
      if (!winnerKey) return
      collect(winnerKey, { shipping: true, shippingDetails })
      closeReveal()
    },
    [winnerKey, collect, closeReveal],
  )

  // Keep this whale digitally and immediately draw the next box in the run.
  const spinAgain = useCallback(() => {
    if (!winnerKey) return
    collect(winnerKey, { shipping: false })
    setOpenedCount((n) => n + 1)
    startBox()
  }, [winnerKey, collect, startBox])

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
    else if (phase === 'revealed') actionRef.current?.focus()
  }, [phase])

  if (!revealOpen) return null

  const winner = winnerKey ? getRarity(winnerKey) : null
  // Phones get smaller cubes and orb so the 10-box lineup and the prize
  // both fit a narrow viewport without clipping or overlap.
  const boxSize = isMobile ? 72 : 120
  const orbSize = isMobile ? 156 : 220
  const remaining = boxes.filter((b) => !b.vanished).length
  const onStage =
    phase === 'ready' ||
    phase === 'spinning' ||
    phase === 'suspense' ||
    phase === 'opening'
  const stageStyle = winner ? { '--r': winner.color, '--r-glow': winner.glow } : undefined

  const startRemaining = group?.startRemaining || 1
  // Boxes still sealed in this run, not counting the one on screen now.
  const boxesLeft = Math.max(startRemaining - openedCount - 1, 0)
  const hasMore = boxesLeft > 0
  const counterLabel = hasMore
    ? `${boxesLeft} ${boxesLeft === 1 ? 'box' : 'boxes'} left`
    : 'Last box'

  let status = 'Lucki Blind Box Series 01'
  if (phase === 'ready') status = 'Tap spin to draw your whale'
  else if (phase === 'spinning') status = `Drawing from the deck · ${remaining} remain`
  else if (phase === 'suspense') status = 'Your luck is sealed'
  else if (phase === 'revealed' && winner) status = `${winner.label} pulled`
  else if (phase === 'shipping') status = 'Shipping details'

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
        <div className="reveal-modal__topbar-end">
          <span className="reveal-modal__counter" aria-live="polite">
            <Package size={13} strokeWidth={2} aria-hidden="true" />
            <strong>{counterLabel}</strong>
          </span>
          <button
            type="button"
            className="reveal-modal__close"
            onClick={closeReveal}
            ref={closeRef}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
            <span className="reveal-modal__close-text">Close</span>
          </button>
        </div>
      </div>

      <div className="reveal-modal__stage">
        <OddsLegend winnerKey={winnerKey} revealed={phase === 'revealed'} />

        <div className="reveal__stage-main" style={stageStyle}>
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
                  size={boxSize}
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
              <ParticleBurst compact={isMobile} />

              <p className="reveal__tier">{winner.label}</p>
              <span className="reveal__tier-rule" aria-hidden="true" />

              <div className="reveal__orb">
                <WhaleOrb rarity={winner.key} size={orbSize} />
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
                  onClick={keepDigital}
                  ref={actionRef}
                >
                  Keep Digital
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${hasMore ? 'btn--line' : 'btn--gold'}`}
                  onClick={() => setPhase('shipping')}
                >
                  Ship It to Me <span aria-hidden="true">→</span>
                </button>
                {hasMore && (
                  <button
                    type="button"
                    className="btn btn--gold btn--sm"
                    onClick={spinAgain}
                  >
                    Spin Again <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'shipping' && winner && (
            <div className="reveal__ship">
              <p className="reveal__ship-tier" style={{ color: winner.color }}>
                {winner.label} · {winner.whale}
              </p>
              <ShippingForm
                onSubmit={shipWhale}
                onBack={() => setPhase('revealed')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
