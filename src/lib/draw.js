import { RARITIES } from '../data/rarities.js'

// The 8 boxes shown in the reveal, ordered common → rarest (left to
// right on the stage). Common-heavy, one of each scarce tier. The
// lineup is cosmetic; the winner is decided by pickWinner(). Keep this
// in rarity order — BlindBoxReveal renders it as-is.
export const BOX_LINEUP = [
  'common',
  'common',
  'common',
  'uncommon',
  'uncommon',
  'rare',
  'ultra',
  'legend',
]

// Weighted draw: 50 / 25 / 15 / 8 / 2.
//
// NOTE: in production this MUST run on the server. A client-side roll
// can be patched to always pull Legendary. For this landing demo the
// draw is local; swap pickWinner() for a fetch to a signed endpoint
// before taking real money.
export function pickWinner() {
  const total = RARITIES.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * total
  for (const r of RARITIES) {
    roll -= r.weight
    if (roll <= 0) return r.key
  }
  return RARITIES[0].key
}

// Fisher-Yates, non-mutating.
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A four-digit collector serial, e.g. 4827.
export function makeSerial() {
  return Math.floor(1000 + Math.random() * 8999)
}

// ── Reveal spin timeline ──────────────────────────────────────────────
// Every reveal cube follows one shared, continuous velocity curve, so
// the spin is perfectly smooth end to end: wind up from a dead stop,
// hold at top speed, then glide back down to a complete stop as the
// boxes poof away one by one. All times are milliseconds from the
// instant Spin is pressed. BlindBoxReveal schedules the box poofs
// against these very same constants, so motion and choreography can
// never drift apart.

export const SPIN_RAMP_MS = 1200 // wind-up: dead stop -> top speed
export const SPIN_HOLD_MS = 500 // hold at top speed before the first poof
export const SPIN_MAX_DPS = 1100 // top speed, degrees per second

// Gaps (ms) between successive box poofs. Seven non-winners vanish; the
// gaps widen steeply as the spin winds down — each whale that vanishes
// slows the spin further, so the final pulls feel long, slow and tense.
// The last value is the still pause held on the lone winner before the
// suspense phase takes over.
export const POOF_GAPS = [380, 450, 560, 720, 980, 1410, 900]

// When the first box poofs (spin starts winding down) and when the spin
// reaches a complete stop (one box left). The decay window is exactly
// the span across which the seven non-winners vanish.
export const SPIN_DECAY_START_MS = SPIN_RAMP_MS + SPIN_HOLD_MS
export const SPIN_DECAY_END_MS =
  SPIN_DECAY_START_MS + POOF_GAPS.slice(0, -1).reduce((sum, g) => sum + g, 0)

// Hermite smoothstep — eases 0->1 with zero slope at both ends. Using it
// for both the wind-up and the wind-down is what keeps the velocity
// curve free of any visible kink where the phases meet.
function smoothstep(p) {
  const t = Math.min(Math.max(p, 0), 1)
  return t * t * (3 - 2 * t)
}

// Spin speed (degrees/sec) at `elapsedMs` after Spin was pressed:
// smooth wind-up to SPIN_MAX_DPS, a flat hold, then a smooth wind-down
// to a complete stop. Driven purely by elapsed time — never by how many
// boxes remain — so the surviving cubes never jolt when a sibling poofs.
export function spinVelocity(elapsedMs) {
  if (elapsedMs <= 0) return 0
  if (elapsedMs < SPIN_RAMP_MS) {
    return SPIN_MAX_DPS * smoothstep(elapsedMs / SPIN_RAMP_MS)
  }
  if (elapsedMs < SPIN_DECAY_START_MS) return SPIN_MAX_DPS
  if (elapsedMs < SPIN_DECAY_END_MS) {
    const p =
      (elapsedMs - SPIN_DECAY_START_MS) / (SPIN_DECAY_END_MS - SPIN_DECAY_START_MS)
    return SPIN_MAX_DPS * (1 - smoothstep(p))
  }
  return 0
}
