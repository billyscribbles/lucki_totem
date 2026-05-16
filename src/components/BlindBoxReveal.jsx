import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X } from 'lucide-react'
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
import './BlindBoxReveal.css'

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// 28 shards flung from the centre outward — each carries its own
// destination through --tx / --ty custom properties.
function ParticleBurst() {
  const shards = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4
        const dist = 180 + Math.random() * 200
        return {
          id: i,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist,
          dur: 1.2 + Math.random() * 1.2,
          delay: Math.random() * 0.15,
          size: 4 + Math.random() * 8,
        }
      }),
    [],
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

// The reveal modal. Eight boxes spin, vanish one by one, the survivor
// bursts open. The winner is drawn up front (see draw.js) and the box
// choreography is cosmetic. Reduced-motion skips straight to the result.
export default function BlindBoxReveal() {
  const { revealOpen, closeReveal, collect } = useLucki()
  const [phase, setPhase] = useState('idle') // idle | spinning | suspense | opening | revealed
  const [boxes, setBoxes] = useState([])
  const [winnerKey, setWinnerKey] = useState(null)
  const [winnerIdx, setWinnerIdx] = useState(-1)
  const [serial, setSerial] = useState(null)

  const timers = useRef([])
  const modalRef = useRef(null)
  const closeRef = useRef(null)
  const keepRef = useRef(null)
  const spinRef = useRef(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Run (or reset) the draw whenever the modal opens.
  useEffect(() => {
    if (!revealOpen) {
      clearTimers()
      setPhase('idle')
      setBoxes([])
      setWinnerKey(null)
      setWinnerIdx(-1)
      setSerial(null)
      return undefined
    }

    const win = pickWinner()
    setWinnerKey(win)
    setSerial(makeSerial())

    if (reducedMotion()) {
      setBoxes([])
      setWinnerIdx(-1)
      timers.current.push(setTimeout(() => setPhase('revealed'), 420))
      return clearTimers
    }

    // Lay the boxes out common → rarest, left to right, and wait for
    // the player to hit Spin.
    setBoxes(BOX_LINEUP.map((rarity, i) => ({ id: i, rarity, vanished: false })))
    setWinnerIdx(BOX_LINEUP.indexOf(win)) // BOX_LINEUP holds every tier, common-first
    setPhase('ready')

    return clearTimers
  }, [revealOpen, clearTimers])

  // Player hit Spin: kick off the choreography — boxes spin, the seven
  // non-winners poof one by one (slowing down), the survivor opens.
  const startSpin = useCallback(() => {
    if (phase !== 'ready') return
    const order = shuffle(boxes.map((b) => b.id).filter((id) => id !== winnerIdx))
    // The first box poofs once the spin has wound up and held at top
    // speed; gaps then widen (POOF_GAPS) in step with the spin gliding
    // down, so the last box vanishes just as the spin reaches a stop.
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

    // `t` now sits just past the still pause held on the lone survivor:
    // let the spotlight glow breathe, then zoom it open as the win.
    timers.current.push(setTimeout(() => setPhase('suspense'), t - 200))
    timers.current.push(setTimeout(() => setPhase('opening'), t + 800))
    timers.current.push(setTimeout(() => setPhase('revealed'), t + 1900))
    setPhase('spinning')
  }, [phase, boxes, winnerIdx])

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
        'button:not([disabled]), a[href]',
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
    else if (phase === 'revealed') keepRef.current?.focus()
  }, [phase])

  if (!revealOpen) return null

  const winner = winnerKey ? getRarity(winnerKey) : null
  const remaining = boxes.filter((b) => !b.vanished).length
  const onStage =
    phase === 'ready' ||
    phase === 'spinning' ||
    phase === 'suspense' ||
    phase === 'opening'
  const stageStyle = winner ? { '--r': winner.color, '--r-glow': winner.glow } : undefined

  let status = 'Opening · Lucki Blind Box Series 01'
  if (phase === 'ready') status = 'Tap spin to draw your whale'
  else if (phase === 'spinning') status = `Drawing from the deck · ${remaining} remain`
  else if (phase === 'suspense') status = 'Your luck is sealed'
  else if (phase === 'revealed' && winner) status = `${winner.label} pulled`

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
        <button
          type="button"
          className="reveal-modal__close"
          onClick={closeReveal}
          ref={closeRef}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
          Close
        </button>
      </div>

      <div className="reveal-modal__stage" style={stageStyle}>
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
                size={120}
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
            <ParticleBurst />

            <p className="reveal__tier">{winner.label}</p>
            <span className="reveal__tier-rule" aria-hidden="true" />

            <div className="reveal__orb">
              <WhaleOrb rarity={winner.key} size={220} />
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
                onClick={() => collect(winner.key, { shipping: false })}
                ref={keepRef}
              >
                + Add to Inventory
              </button>
              <button
                type="button"
                className="btn btn--gold btn--sm"
                onClick={() => collect(winner.key, { shipping: true })}
              >
                Ship It to Me <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
