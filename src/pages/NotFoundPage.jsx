import { Link } from 'react-router-dom'
import SEO from '../lib/seo.jsx'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="notfound">
      <SEO title="Page not found" />
      <div className="container notfound__inner">
        <p className="notfound__eyebrow">
          <span aria-hidden="true">♠</span> 404 · Off the table
        </p>
        <h1 className="notfound__title">
          This box was never <span className="notfound__title-accent">drawn.</span>
        </h1>
        <p className="notfound__sub">
          The page you are after has been pulled. Head back and open a real one.
        </p>
        <Link to="/" className="btn btn--gold notfound__cta">
          Back to LUCKI <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  )
}
