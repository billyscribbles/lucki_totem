import './SectionHeader.css'

// Shared section head: mono eyebrow with a suit ornament, plus an
// optional right-aligned action link.
export default function SectionHeader({ eyebrow, ornament = '♠', action, actionHref = '#' }) {
  return (
    <div className="sec-head">
      <h2 className="sec-head__eyebrow">
        {eyebrow}
        <span className="sec-head__ornament" aria-hidden="true">
          {ornament}
        </span>
      </h2>
      {action && (
        <a className="sec-head__action" href={actionHref}>
          {action}
        </a>
      )}
    </div>
  )
}
