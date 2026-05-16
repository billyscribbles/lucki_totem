import { Link } from 'react-router-dom'
import './SectionHeader.css'

// Shared section head: mono eyebrow with a suit ornament, plus an
// optional right-aligned action. Pass `actionTo` for an in-app route
// (renders a router Link) or `actionHref` for a plain anchor.
export default function SectionHeader({
  eyebrow,
  ornament = '♠',
  action,
  actionHref = '#',
  actionTo,
}) {
  return (
    <div className="sec-head">
      <h2 className="sec-head__eyebrow">
        {eyebrow}
        <span className="sec-head__ornament" aria-hidden="true">
          {ornament}
        </span>
      </h2>
      {action &&
        (actionTo ? (
          <Link className="sec-head__action" to={actionTo}>
            {action}
          </Link>
        ) : (
          <a className="sec-head__action" href={actionHref}>
            {action}
          </a>
        ))}
    </div>
  )
}
