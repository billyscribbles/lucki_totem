import { useEffect, useMemo, useRef } from 'react'
import { getRarity } from '../data/rarities.js'
import { spinVelocity } from '../lib/draw.js'
import './MysteryBox.css'

// The four side faces carry the whale; top + bottom are plain lid panels.
const SIDES = ['front', 'right', 'back', 'left']
const LIDS = ['top', 'bottom']
const SETTLE = 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)'

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// One box on the reveal stage: a 3D cube spinning on its Y axis with the
// rarity's whale on all four side faces. State is driven by the parent
// through plain boolean props; the spin itself follows the shared
// time-based velocity curve in draw.js, so every cube winds up, holds
// and winds down in perfect sync.
export default function MysteryBox({
  rarity,
  spinning,
  vanished,
  isWinner,
  opening,
  size = 130,
}) {
  const r = getRarity(rarity)
  const cubeRef = useRef(null)
  const angleRef = useRef(null)
  const rafRef = useRef(0)
  const spinStartRef = useRef(null)

  // Each cube starts at its own angle so the lineup spins organically.
  if (angleRef.current === null) angleRef.current = Math.random() * 360

  // Spin the cube with requestAnimationFrame. One uninterrupted loop runs
  // for the whole spin: each frame reads spinVelocity() for the elapsed
  // time since the spin began (`spinStartRef`) and advances the angle by
  // that much. Because velocity is purely time-driven, this effect never
  // re-runs mid-spin — surviving cubes keep gliding without a jolt when a
  // sibling poofs. The cube never coasts to a halt on its own: it holds
  // a slow crawl until it leaves the stage. When the parent ends the
  // spin (the winner heading into suspense), the cube eases from that
  // crawl to the nearest whole turn so the whale faces the viewer.
  useEffect(() => {
    const cube = cubeRef.current
    if (!cube) return undefined

    if (vanished || !spinning || reducedMotion()) {
      cancelAnimationFrame(rafRef.current)
      spinStartRef.current = null
      if (!vanished) {
        const settled = Math.round(angleRef.current / 360) * 360
        angleRef.current = settled
        cube.style.transition = SETTLE
        cube.style.transform = `rotateX(-14deg) rotateY(${settled}deg)`
      }
      return undefined
    }

    cube.style.transition = 'none'
    let last = 0
    const tick = (now) => {
      if (spinStartRef.current === null) spinStartRef.current = now
      if (last) {
        const v = spinVelocity(now - spinStartRef.current)
        angleRef.current += v * ((now - last) / 1000)
        cube.style.transform = `rotateX(-14deg) rotateY(${angleRef.current}deg)`
      }
      last = now
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning, vanished])

  // Smoke puffs + rarity-coloured embers for the poof. Computed once,
  // rendered only while the box is vanishing.
  const puffs = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        size: 54 + Math.random() * 46,
        dx: (Math.random() - 0.5) * 46,
        dur: 0.7 + Math.random() * 0.5,
        delay: Math.random() * 0.12,
      })),
    [],
  )
  const embers = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.6
        const dist = 40 + Math.random() * 56
        return {
          id: i,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist - 20,
          dur: 0.6 + Math.random() * 0.5,
          delay: Math.random() * 0.1,
          size: 3 + Math.random() * 4,
        }
      }),
    [],
  )

  const className = [
    'mbox',
    spinning && !vanished && 'is-spinning',
    vanished && 'is-vanished',
    isWinner && !spinning && !vanished && !opening && 'is-spotlight',
    isWinner && opening && 'is-opening',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={{ '--box-size': `${size}px`, '--r': r.color, '--r-glow': r.glow }}
      aria-hidden="true"
    >
      <span className="mbox__glow" />
      <span className="mbox__pedestal" />

      <div className="mbox__scene">
        <div className="mbox__cube" ref={cubeRef}>
          {SIDES.map((side) => (
            <div key={side} className={`mbox__face mbox__face--side mbox__face--${side}`}>
              <img className="mbox__whale" src={r.image} alt="" draggable="false" />
            </div>
          ))}
          {LIDS.map((lid) => (
            <div key={lid} className={`mbox__face mbox__face--lid mbox__face--${lid}`}>
              <span className="mbox__lid-mark">{r.suit}</span>
            </div>
          ))}
        </div>
        {isWinner && opening && <span className="mbox__flash" />}
      </div>

      <span className="mbox__label">{r.label}</span>

      {vanished && (
        <div className="mbox__smoke" aria-hidden="true">
          {puffs.map((p) => (
            <span
              key={`p${p.id}`}
              className="mbox__smoke-puff"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                marginLeft: `${p.dx}px`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
          {embers.map((e) => (
            <span
              key={`e${e.id}`}
              className="mbox__ember"
              style={{
                width: `${e.size}px`,
                height: `${e.size}px`,
                '--tx': `${e.tx}px`,
                '--ty': `${e.ty}px`,
                animationDuration: `${e.dur}s`,
                animationDelay: `${e.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
