import { RARITIES } from '../data/rarities.js'
import './OddsLegend.css'

// The drop-odds panel on the reveal modal. Lists every rarity tier and
// its display odds, visible for the whole reveal. Once the prize is
// shown, the winning tier's row lights up in its own colour. Purely
// informational — it never gates on the spin phase.
export default function OddsLegend({ winnerKey, revealed }) {
  return (
    <aside className="odds-legend" aria-label="Rarity drop odds">
      <p className="odds-legend__title">Drop Odds</p>
      <ul className="odds-legend__list">
        {RARITIES.map((r) => {
          const isWin = revealed && r.key === winnerKey
          return (
            <li
              key={r.key}
              className={`odds-legend__row${isWin ? ' odds-legend__row--win' : ''}`}
              style={isWin ? { '--r': r.color, '--r-glow': r.glow } : undefined}
            >
              <span
                className="odds-legend__swatch"
                style={{ background: r.color }}
                aria-hidden="true"
              />
              <span className="odds-legend__label">{r.label}</span>
              <span className="odds-legend__odds">{r.odds}</span>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
