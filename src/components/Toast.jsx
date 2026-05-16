import { useLucki } from '../store/LuckiContext.jsx'
import './Toast.css'

// Bottom-right confirmation pill. Keyed on the toast id so a fresh
// message always replays the entrance.
export default function Toast() {
  const { toast } = useLucki()
  if (!toast) return null
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      {toast.message}
    </div>
  )
}
