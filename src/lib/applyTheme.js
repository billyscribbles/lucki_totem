import { theme } from '../config/theme.config.js'

// Flattens theme.config into CSS custom properties on :root.
// Called once from main.jsx before React mounts, so every .css file can
// keep using var(--gold), var(--display), var(--radius-md) without
// knowing the config exists. Colors and fonts emit bare names
// (--gold, --display); radii are namespaced (--radius-md).
export function applyTheme() {
  const root = document.documentElement
  const write = (obj, name) => {
    for (const [key, value] of Object.entries(obj)) {
      root.style.setProperty(name(key), value)
    }
  }
  write(theme.colors, (k) => `--${k}`)
  write(theme.fonts, (k) => `--${k}`)
  write(theme.radii, (k) => `--radius-${k}`)
}
