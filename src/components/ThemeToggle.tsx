import { useTheme } from '../theme'

/**
 * Sun/moon crossfade, held in a square switch — square to stay on the
 * Almanac's technical-instrument register (a rounded iOS pill would fight
 * `--radius-*: 0`). Animates only transform + opacity (gate 14) and yields
 * to `prefers-reduced-motion` via the global rule in index.css.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`group inline-flex shrink-0 items-center justify-center gap-2xs border border-rule-2 bg-paper-2 text-ink-2 transition-colors duration-150 hover:border-brass hover:bg-paper-3 hover:text-brass focus-visible:text-brass active:bg-tile ${
        compact ? 'size-11' : 'w-full px-2xs py-2xs'
      }`}
    >
      <span className="relative inline-grid size-4 place-items-center overflow-hidden">
        <SunIcon
          className={`col-start-1 row-start-1 size-4 transition-all duration-300 ease-out ${
            dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <MoonIcon
          className={`col-start-1 row-start-1 size-4 transition-all duration-300 ease-out ${
            dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'
          }`}
        />
      </span>
      {!compact && (
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase">
          {dark ? 'Light chart' : 'Dark chart'}
        </span>
      )}
    </button>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.7l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3Z" />
    </svg>
  )
}
