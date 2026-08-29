import { useMemo, useState } from 'react'
import { buildTimeline } from '../lib/voyage'
import type { TimelineEntry } from '../lib/voyage'
import { dayInZone, shortDate } from '../lib/format'
import { scheduleMonths } from '../lib/itinerary'
import type { Port } from '../lib/itinerary'

function isPast(port: Port, now: Date): boolean {
  return dayInZone(now, port.tz) > (port.end ?? port.date)
}

/** True if any day of this call (arrival through, for overnights, departure) falls in `ym`. */
function inMonth(port: Port, ym: string): boolean {
  return port.date.slice(0, 7) === ym || (port.end?.slice(0, 7) ?? port.date.slice(0, 7)) === ym
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }).format(
    new Date(Date.UTC(year ?? 2026, (month ?? 1) - 1, 1)),
  )
}

/** The log: every call, set as an almanac column. */
export function Timeline({ now }: { now: Date }) {
  const [usOnly, setUsOnly] = useState(false)
  const [hidePast, setHidePast] = useState(false)
  const [month, setMonth] = useState('')
  const sections = useMemo(() => buildTimeline(now), [now])
  const months = useMemo(() => scheduleMonths(), [])

  const filterCls = (active: boolean) =>
    `whitespace-nowrap border px-2xs py-3xs font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-150 active:bg-tile disabled:opacity-40 ${
      active
        ? 'border-reunion text-reunion'
        : 'border-rule text-muted hover:bg-paper-2 hover:text-ink'
    }`

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2xs border-b border-rule px-md py-2xs">
        <h2 className="font-display text-xl font-semibold">The log</h2>
        <div className="flex flex-wrap items-center gap-3xs">
          <select
            aria-label="Filter by month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`border bg-paper px-2xs py-3xs font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-150 active:bg-tile ${
              month
                ? 'border-reunion text-reunion'
                : 'border-rule text-muted hover:bg-paper-2 hover:text-ink'
            }`}
          >
            <option value="">All months</option>
            {months.map((ym) => (
              <option key={ym} value={ym}>
                {monthLabel(ym)}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-pressed={usOnly}
            onClick={() => setUsOnly((v) => !v)}
            className={filterCls(usOnly)}
          >
            US only
          </button>
          <button
            type="button"
            aria-pressed={hidePast}
            onClick={() => setHidePast((v) => !v)}
            className={filterCls(hidePast)}
          >
            Hide past
          </button>
        </div>
      </div>

      <div className="px-md py-md xl:columns-2 xl:gap-2xl">
        {sections.map((section, si) => {
          const entries = section.entries.filter((e, idx) => {
            if (e.kind === 'port') {
              if (usOnly && !e.port.us) return false
              if (month && !inMonth(e.port, month)) return false
              if (hidePast && !e.here && isPast(e.port, now)) return false
              return true
            }
            if (usOnly) return false
            // Sea gaps aren't pinned to a single date, so a month filter keeps
            // only the ship's live position — the connecting rows would
            // otherwise dangle between two now-hidden ports.
            if (month && !e.here) return false
            if (hidePast && !e.here) {
              const next = section.entries
                .slice(idx + 1)
                .find((x): x is Extract<TimelineEntry, { kind: 'port' }> => x.kind === 'port')
              if (!next || isPast(next.port, now)) return false
            }
            return true
          })
          if (entries.length === 0) return null
          return (
            <section
              key={`${section.voyage.name}-${si}`}
              className="mb-lg break-inside-avoid"
              aria-label={section.voyage.name}
            >
              <h3 className="border-b border-rule-2 pb-3xs">
                <span className="block font-mono text-[10px] tracking-[0.12em] text-sea uppercase">
                  {section.voyage.name}
                </span>
                <span className="tnum mt-3xs block font-mono text-[10px] text-muted">
                  {shortDate(section.voyage.start)} → {shortDate(section.voyage.end)}
                </span>
              </h3>
              <ol className="mt-2xs">
                {entries.map((entry, i) =>
                  entry.kind === 'port' ? (
                    <PortRow key={i} port={entry.port} here={entry.here} now={now} />
                  ) : (
                    <SeaRow key={i} entry={entry} />
                  ),
                )}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function PortRow({ port, here, now }: { port: Port; here: boolean; now: Date }) {
  const past = !here && isPast(port, now)
  const tone = port.carlos ? 'text-carlos' : port.us ? 'text-reunion' : 'text-ink'
  return (
    <li
      className={`flex items-baseline gap-2xs border-b border-rule py-2xs ${
        here ? 'border-l-2 border-l-brass bg-brass-wash pl-2xs' : ''
      } ${past ? 'opacity-50' : ''} ${port.us && !here ? 'bg-reunion-wash/40' : ''}`}
    >
      <span className="tnum w-14 shrink-0 font-mono text-[11px] text-muted">
        {shortDate(port.date)}
        {port.end && <span className="text-muted">+1</span>}
      </span>
      <span aria-hidden className="shrink-0">
        {port.flag}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`font-medium ${tone}`}>{port.name}</span>
        <span className="ml-2xs hidden text-xs text-muted sm:inline">{port.region}</span>
      </span>
      <span className="flex shrink-0 items-center gap-3xs font-mono text-[9px] tracking-[0.08em] uppercase">
        {here && <span className="text-brass">here</span>}
        {port.turnaround && <span className="text-muted">turn</span>}
        {port.carlos ? (
          <span className="border border-carlos px-3xs text-carlos">Carlos</span>
        ) : port.us ? (
          <span className="bg-reunion-wash px-3xs text-reunion">reach</span>
        ) : null}
      </span>
    </li>
  )
}

function SeaRow({ entry }: { entry: Extract<TimelineEntry, { kind: 'sea' }> }) {
  return (
    <li className="flex items-baseline gap-2xs py-3xs pl-14">
      <span className="font-mono text-[10px] text-muted">
        {entry.days > 0 ? `${entry.days} ${entry.days === 1 ? 'day' : 'days'} at sea` : 'at sea'}
      </span>
      {entry.here && (
        <span className="tnum font-mono text-[10px] tracking-[0.08em] text-brass uppercase">
          · ship here, {Math.round(entry.progress * 100)}%
        </span>
      )}
    </li>
  )
}
