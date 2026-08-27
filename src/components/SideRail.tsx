import { SHIP } from '../lib/itinerary'
import { nextLeg, shipState } from '../lib/voyage'
import { clockInZone } from '../lib/format'
import { useTheme } from '../theme'

const SECTIONS = [
  { id: 'now', label: 'Now' },
  { id: 'chart', label: 'Chart' },
  { id: 'reunion', label: 'Reunion' },
  { id: 'log', label: 'Log' },
] as const

/** N3 side-rail: identity, live state, in-page anchors, ship's papers. */
export function SideRail({ now }: { now: Date }) {
  const { theme, toggle } = useTheme()
  const state = shipState(now)
  const leg = nextLeg(now)

  const status =
    state.kind === 'in-port'
      ? { text: `In port · ${state.port.name}`, tone: 'text-brass' }
      : state.kind === 'at-sea'
        ? { text: `At sea · ${Math.round(state.progress * 100)}%`, tone: 'text-sea' }
        : state.kind === 'not-started'
          ? { text: 'Not yet sailed', tone: 'text-muted' }
          : { text: 'Schedule ends', tone: 'text-muted' }

  return (
    <div className="flex h-full flex-col gap-lg border-rule px-md py-md lg:border-r">
      <div>
        <a
          href="#now"
          className="font-display text-3xl leading-none font-semibold tracking-tight whitespace-nowrap"
        >
          QM2 <span className="text-sea">Log</span>
        </a>
        <p className="mt-2xs font-mono text-[10px] leading-relaxed tracking-[0.14em] text-muted uppercase">
          Position &amp; reunion clock
        </p>
      </div>

      <div className="border-y border-rule py-2xs">
        <div className="flex items-center gap-2xs">
          <span
            aria-hidden
            className={`relative inline-block size-2 shrink-0 rounded-full ${
              state.kind === 'in-port' ? 'bg-brass beacon' : 'bg-sea'
            }`}
          />
          <span className={`font-mono text-[11px] ${status.tone}`}>{status.text}</span>
        </div>
        {leg && (
          <p className="mt-3xs font-mono text-[11px] text-muted">
            Next:{' '}
            <span className={leg.to.home ? 'text-home' : leg.to.us ? 'text-reunion' : 'text-ink-2'}>
              {leg.to.name}
            </span>{' '}
            <span className="tnum">
              · {leg.daysAway === 0 ? 'today' : `${leg.daysAway}d`}
            </span>
          </p>
        )}
      </div>

      <nav aria-label="Sections">
        <ul className="flex flex-row gap-sm lg:flex-col lg:gap-3xs">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block whitespace-nowrap border-l-2 border-transparent py-3xs font-mono text-xs tracking-[0.1em] text-muted uppercase transition-colors duration-150 hover:border-sea hover:text-ink focus-visible:text-ink active:text-sea lg:pl-2xs"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <dl className="hidden border-t border-rule pt-2xs font-mono text-[10px] leading-relaxed lg:block">
        {[
          ['Vessel', SHIP.name],
          ['IMO', SHIP.imo],
          ['MMSI', SHIP.mmsi],
          ['Call sign', SHIP.callSign],
          ['Flag', SHIP.flag],
          ['Ship time', state.kind === 'in-port' ? clockInZone(now, state.port.tz) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2xs border-b border-rule/60 py-3xs">
            <dt className="tracking-[0.1em] text-muted uppercase">{k}</dt>
            <dd className="tnum text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="mt-auto w-full whitespace-nowrap border border-rule-2 px-2xs py-2xs font-mono text-[11px] tracking-[0.1em] text-muted uppercase transition-colors duration-150 hover:bg-paper-3 hover:text-ink focus-visible:text-ink active:bg-tile disabled:opacity-40"
      >
        {theme === 'dark' ? 'Light chart' : 'Dark chart'}
      </button>
    </div>
  )
}
