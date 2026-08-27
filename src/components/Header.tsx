import { SHIP } from '../lib/itinerary'
import { useTheme } from '../theme'

export function Header() {
  const { theme, toggle } = useTheme()
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          QM2 <span className="text-sea">Log</span>
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted">
          {SHIP.name} · {SHIP.operator} · IMO {SHIP.imo} · {SHIP.callSign} ·{' '}
          {SHIP.flag}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs text-muted transition-colors hover:text-ink"
      >
        {theme === 'dark' ? '☀ light' : '☾ dark'}
      </button>
    </header>
  )
}
