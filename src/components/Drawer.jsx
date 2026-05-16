import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './Drawer.css'

// Right-side slide-in panel shared by the cart and the collection.
// Stays mounted so it can animate both ways; visibility is dropped
// after the slide-out so its controls leave the tab order when closed.
export default function Drawer({ open, onClose, title, children }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const f = panelRef.current?.querySelectorAll('button:not([disabled]), a[href]')
      if (!f || f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
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
  }, [open, onClose])

  return (
    <>
      <div
        className={`drawer-scrim${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <div className="drawer__head">
          <span className="drawer__title">{title}</span>
          <button
            type="button"
            className="drawer__close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </aside>
    </>
  )
}
