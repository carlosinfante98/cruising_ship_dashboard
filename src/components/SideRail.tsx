import { SHIP } from '../lib/itinerary'
import { nextLeg, shipState } from '../lib/voyage'
import { clockInZone } from '../lib/format'
import { SECTIONS } from '../lib/sections'
import { ThemeToggle } from './ThemeToggle'

/** N3 side-rail: identity, live state, in-page anchors, ship's papers. */
export function SideRail({ now, active }: { now: Date; active?: string }) {
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
            <span className={leg.to.carlos ? 'text-carlos' : leg.to.us ? 'text-reunion' : 'text-ink-2'}>
              {leg.to.name}
            </span>{' '}
            <span className="tnum">
              · {leg.daysAway === 0 ? 'today' : `${leg.daysAway}d`}
            </span>
          </p>
        )}
      </div>

      {/* On mobile the sticky MobileNav bar carries this same list — showing
          it again here would just duplicate it, so it's desktop-only. */}
      <nav aria-label="Sections" className="hidden lg:block">
        <ul className="flex flex-col gap-3xs">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                className={`block border-l-2 py-3xs pl-2xs font-mono text-xs tracking-[0.1em] uppercase transition-colors duration-150 hover:text-ink focus-visible:text-ink active:text-sea ${
                  active === s.id ? 'border-brass text-brass' : 'border-transparent text-muted'
                }`}
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
          ['Nati time', state.kind === 'in-port' ? clockInZone(now, state.port.tz) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2xs border-b border-rule/60 py-3xs">
            <dt className="tracking-[0.1em] text-muted uppercase">{k}</dt>
            <dd className="tnum text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Mobile carries its own compact toggle in the sticky MobileNav bar. */}
      <div className="mt-auto hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  )
}
