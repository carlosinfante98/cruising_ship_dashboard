import { PORTS } from '../lib/itinerary'
import type { Port } from '../lib/itinerary'
import { arrivalOf, nextUsPort, shipState, waitProgress } from '../lib/voyage'
import { daysUntil, longDate, shortDate } from '../lib/format'

/** The emotional centrepiece: when the ship is next reachable. */
export function Reunion({ now }: { now: Date }) {
  const port = nextUsPort(now)
  const state = shipState(now)

  if (!port) {
    return (
      <div className="px-md py-xl">
        <p className="font-display text-2xl">
          No US call in the entered schedule yet — more dates to come.
        </p>
      </div>
    )
  }

  const docked = state.kind === 'in-port' && state.port === port
  const days = daysUntil(now, port.date)
  const wait = waitProgress(now)
  const accent = port.carlos ? 'text-carlos' : 'text-reunion'
  const bar = port.carlos ? 'bg-carlos' : 'bg-reunion'

  const laterCalls = PORTS.filter((p) => p.us && arrivalOf(p) > now && p !== port).slice(0, 4)

  return (
    <div className="grid gap-lg px-md py-xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-2xl">
      <div>
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Next reunion window
        </p>

        {docked ? (
          <p className="mt-sm font-display text-4xl leading-tight font-semibold sm:text-5xl">
            <span className={accent}>Reachable today</span> — docked in {port.name}
            {port.carlos ? ', with Carlos' : ''}.
          </p>
        ) : (
          <>
            <p className="mt-2xs flex items-baseline gap-sm">
              <span className={`tnum font-display text-7xl leading-none font-semibold sm:text-8xl ${accent}`}>
                {days}
              </span>
              <span className="font-display text-2xl text-muted sm:text-3xl">
                {days === 1 ? 'day' : 'days'} apart
              </span>
            </p>
            <p className="mt-sm text-lg leading-relaxed">
              until <span className={`font-semibold ${accent}`}>{port.name}</span>
              {port.carlos && <span className="text-carlos"> — Carlos</span>} on {longDate(port.date)}.
            </p>
          </>
        )}

        {wait && !docked && (
          <div className="mt-lg">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(wait.progress * 100)}
              aria-label="Progress through the current wait"
              className="h-1.5 w-full overflow-hidden bg-tile"
            >
              <div
                className={`h-full w-full origin-left ${bar} transition-transform duration-700 ease-out`}
                style={{ transform: `scaleX(${wait.progress.toFixed(4)})` }}
              />
            </div>
            <div className="mt-2xs flex justify-between gap-2xs font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
              <span>parted {shortDate(wait.fromIso)}</span>
              <span className="tnum">{Math.round(wait.progress * 100)}%</span>
              <span>together {shortDate(port.date)}</span>
            </div>
          </div>
        )}
      </div>

      {laterCalls.length > 0 && (
        <div className="border-t border-rule pt-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-2xl">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            Then after that
          </p>
          <ul className="mt-2xs">
            {laterCalls.map((p) => (
              <LaterCall key={`${p.date}-${p.name}`} port={p} now={now} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function LaterCall({ port, now }: { port: Port; now: Date }) {
  return (
    <li className="flex items-baseline justify-between gap-2xs border-b border-rule py-2xs">
      <span className="flex items-baseline gap-2xs">
        <span aria-hidden>{port.flag}</span>
        <span className={`font-medium ${port.carlos ? 'text-carlos' : 'text-reunion'}`}>
          {port.name}
        </span>
      </span>
      <span className="tnum shrink-0 font-mono text-[11px] text-muted">
        {shortDate(port.date)} · {daysUntil(now, port.date)}d
      </span>
    </li>
  )
}
