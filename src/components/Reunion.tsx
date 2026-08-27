import { nextUsPort, shipState, waitProgress } from '../lib/voyage'
import { daysUntil, longDate, shortDate } from '../lib/format'

export function Reunion({ now }: { now: Date }) {
  const port = nextUsPort(now)
  const state = shipState(now)

  if (!port) {
    return (
      <section aria-label="Next reunion" className="rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Next reunion</p>
        <p className="mt-3 font-display text-2xl">
          No US call in the entered schedule yet — more dates coming.
        </p>
      </section>
    )
  }

  const docked = state.kind === 'in-port' && state.port === port
  const days = daysUntil(now, port.date)
  const wait = waitProgress(now)
  const accent = port.home ? 'text-home' : 'text-reunion'
  const bar = port.home ? 'bg-home' : 'bg-reunion'

  return (
    <section
      aria-label="Next reunion"
      className="rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
        Next reunion window
      </p>

      {docked ? (
        <p className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          <span className={accent}>She&rsquo;s reachable right now</span> — docked in {port.flag}{' '}
          {port.name}{port.home ? ', home' : ''}.
        </p>
      ) : (
        <>
          <p className="mt-4 font-display text-5xl font-semibold tabular-nums sm:text-7xl">
            <span className={accent}>{days}</span>
            <span className="ml-3 text-2xl font-normal text-muted sm:text-3xl">
              {days === 1 ? 'day' : 'days'}
            </span>
          </p>
          <p className="mt-3 text-lg">
            until {port.flag} <span className={`font-semibold ${accent}`}>{port.name}</span>
            {port.home && <span className="text-home"> — home</span>},{' '}
            {longDate(port.date)}
          </p>
        </>
      )}

      {wait && !docked && (
        <div className="mt-6">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(wait.progress * 100)}
            aria-label="Progress through the current wait"
            className="h-2 overflow-hidden rounded-full bg-bg"
          >
            <div
              className={`h-full rounded-full ${bar} transition-[width] duration-700`}
              style={{ width: `${(wait.progress * 100).toFixed(2)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
            <span>parted {shortDate(wait.fromIso)}</span>
            <span>{Math.round(wait.progress * 100)}%</span>
            <span>together {shortDate(port.date)}</span>
          </div>
        </div>
      )}
    </section>
  )
}
