import { currentPosition, nextLeg, shipState } from '../lib/voyage'
import { clockInZone, groupedInt, longDate, shortDate } from '../lib/format'

function coord(value: number, pos: string, neg: string): string {
  const hemi = value >= 0 ? pos : neg
  // Round to whole minutes first, then split — rounding the minutes alone can
  // land on 60 and print an impossible bearing like 54°60′.
  const totalMin = Math.round(Math.abs(value) * 60)
  const deg = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return `${deg}°${String(min).padStart(2, '0')}′ ${hemi}`
}

/**
 * Two panels, side by side: exactly where the ship is, and exactly where
 * it's going next. Everything here is derived from the schedule.
 */
export function PositionBand({ now }: { now: Date }) {
  const state = shipState(now)
  const pos = currentPosition(now)
  const leg = nextLeg(now)

  const alongside = state.kind === 'in-port'

  return (
    <div className="grid border-b border-rule lg:grid-cols-2">
      {/* ── Where the ship is ──────────────────────────────────── */}
      <div className="border-b border-rule px-md py-md lg:border-r lg:border-b-0">
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Where the ship is
        </p>

        <p className="mt-2xs flex flex-wrap items-baseline gap-2xs">
          <span
            aria-hidden
            className={`relative inline-block size-2.5 shrink-0 self-center ${
              alongside ? 'beacon rounded-full bg-brass' : 'rounded-full bg-sea'
            }`}
          />
          <span className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
            {state.kind === 'in-port' ? (
              <span className={state.port.carlos ? 'text-carlos' : 'text-brass'}>
                Alongside in {state.port.name}
              </span>
            ) : state.kind === 'at-sea' ? (
              <span className="text-sea">At sea</span>
            ) : state.kind === 'not-started' ? (
              <span className="text-muted">Not yet sailed</span>
            ) : (
              <span className="text-muted">Schedule ends</span>
            )}
          </span>
        </p>

        {pos ? (
          <dl className="mt-sm grid grid-cols-2 gap-x-md gap-y-2xs font-mono text-[11px] sm:grid-cols-3">
            <Field label="Latitude" value={coord(pos.lat, 'N', 'S')} />
            <Field label="Longitude" value={coord(pos.lon, 'E', 'W')} />
            <Field
              label="Fix"
              value={pos.exact ? 'In port — exact' : 'Estimated'}
              tone={pos.exact ? 'text-ink-2' : 'text-muted'}
            />
            {state.kind === 'in-port' && (
              <>
                <Field label="Ship time" value={clockInZone(now, state.port.tz)} />
                <Field label="Country" value={state.port.region} />
                <Field
                  label="Sails"
                  value={shortDate(state.port.end ?? state.port.date)}
                />
              </>
            )}
            {state.kind === 'at-sea' && leg?.from && (
              <>
                <Field label="Departed" value={leg.from.name} />
                <Field label="Run so far" value={`${groupedInt(leg.nmLeg - leg.nmRemaining)} nm`} />
                <Field label="To run" value={`${groupedInt(leg.nmRemaining)} nm`} />
              </>
            )}
          </dl>
        ) : (
          <p className="mt-sm font-mono text-[11px] text-muted">
            No position — outside the entered schedule.
          </p>
        )}
      </div>

      {/* ── Where it's going ───────────────────────────────────── */}
      <div className="px-md py-md">
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Next destination
        </p>

        {leg ? (
          <>
            <p className="mt-2xs flex flex-wrap items-baseline gap-2xs">
              <span aria-hidden className="text-2xl leading-none">
                {leg.to.flag}
              </span>
              <span
                className={`font-display text-3xl leading-tight font-semibold sm:text-4xl ${
                  leg.to.carlos ? 'text-carlos' : leg.to.us ? 'text-reunion' : 'text-ink'
                }`}
              >
                {leg.to.name}
              </span>
              {leg.to.us && (
                <span
                  className={`self-center px-3xs font-mono text-[10px] tracking-[0.08em] uppercase ${
                    leg.to.carlos ? 'border border-carlos text-carlos' : 'bg-reunion-wash text-reunion'
                  }`}
                >
                  {leg.to.carlos ? 'Carlos' : 'you can meet'}
                </span>
              )}
            </p>

            <p className="mt-2xs text-sm text-muted">
              {leg.to.region} · arrives {longDate(leg.to.date)}
            </p>

            <dl className="mt-sm grid grid-cols-2 gap-x-md gap-y-2xs font-mono text-[11px] sm:grid-cols-3">
              <Field
                label="Arrives in"
                value={leg.daysAway === 0 ? 'today' : `${leg.daysAway}d`}
                tone="text-brass"
              />
              {leg.nmLeg > 0 && (
                <Field
                  label={leg.stillAlongside ? 'Leg length' : 'Still to run'}
                  value={`${groupedInt(leg.stillAlongside ? leg.nmLeg : leg.nmRemaining)} nm`}
                />
              )}
              <Field
                label="Status"
                value={leg.stillAlongside ? 'Not yet sailed' : `${Math.round(leg.progress * 100)}% across`}
              />
            </dl>

            {leg.nmLeg > 0 && !leg.stillAlongside && (
              <div className="mt-sm">
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(leg.progress * 100)}
                  aria-label={`Progress from ${leg.from?.name ?? 'departure'} to ${leg.to.name}`}
                  className="h-1 w-full overflow-hidden bg-tile"
                >
                  <div
                    className="h-full w-full origin-left bg-brass transition-transform duration-700 ease-out"
                    style={{ transform: `scaleX(${leg.progress.toFixed(4)})` }}
                  />
                </div>
                <div className="mt-3xs flex justify-between gap-2xs font-mono text-[10px] text-muted">
                  <span className="truncate">{leg.from?.name}</span>
                  <span className="truncate">{leg.to.name}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-sm font-mono text-[11px] text-muted">
            Nothing further in the entered schedule.
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className={`tnum mt-3xs truncate ${tone ?? 'text-ink-2'}`}>{value}</dd>
    </div>
  )
}
