import { useMemo, useState } from 'react'
import { buildTimeline } from '../lib/voyage'
import type { TimelineEntry } from '../lib/voyage'
import { dayInZone, shortDate } from '../lib/format'
import type { Port } from '../lib/itinerary'

function Badge({ tone, children }: { tone: 'reunion' | 'home' | 'muted'; children: string }) {
  const cls =
    tone === 'reunion'
      ? 'bg-reunion-soft text-reunion'
      : tone === 'home'
        ? 'border border-home text-home'
        : 'border border-line text-muted'
  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  )
}

function isPast(port: Port, now: Date): boolean {
  return dayInZone(now, port.tz) > (port.end ?? port.date)
}

function PortRow({ port, here, now }: { port: Port; here: boolean; now: Date }) {
  const past = !here && isPast(port, now)
  return (
    <li
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        here ? 'border border-brass bg-surface' : ''
      } ${past ? 'opacity-45' : ''}`}
    >
      <span className="w-20 shrink-0 font-mono text-xs text-muted">
        {shortDate(port.date)}
        {port.end ? `–${shortDate(port.end).split(' ')[1] ?? ''}` : ''}
      </span>
      <span aria-hidden className="text-lg">{port.flag}</span>
      <span className="min-w-0 flex-1">
        <span className={`font-medium ${port.home ? 'text-home' : port.us ? 'text-reunion' : ''}`}>
          {port.name}
        </span>
        <span className="ml-2 hidden text-sm text-muted sm:inline">{port.region}</span>
      </span>
      <span className="flex shrink-0 gap-1.5">
        {here && <Badge tone="muted">she&rsquo;s here</Badge>}
        {port.home ? (
          <Badge tone="home">home</Badge>
        ) : port.us ? (
          <Badge tone="reunion">reachable</Badge>
        ) : null}
        {port.turnaround && <Badge tone="muted">turnaround</Badge>}
      </span>
    </li>
  )
}

function SeaRow({ entry }: { entry: Extract<TimelineEntry, { kind: 'sea' }> }) {
  return (
    <li className="flex items-center gap-3 px-3 py-1.5">
      <span className="w-20 shrink-0" />
      <span aria-hidden className="font-mono text-xs text-muted">〜</span>
      <span className="font-mono text-xs text-muted">
        {entry.days > 0 ? `${entry.days} ${entry.days === 1 ? 'day' : 'days'} at sea` : 'at sea'}
      </span>
      {entry.here && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
          ⟵ ship is here · {Math.round(entry.progress * 100)}%
        </span>
      )}
    </li>
  )
}

export function Timeline({ now }: { now: Date }) {
  const [usOnly, setUsOnly] = useState(false)
  const [hidePast, setHidePast] = useState(false)
  const sections = useMemo(() => buildTimeline(now), [now])

  const filterCls = (active: boolean) =>
    `rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
      active ? 'border-reunion text-reunion' : 'border-line text-muted hover:text-ink'
    }`

  return (
    <section aria-label="Full itinerary">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">The itinerary</h2>
        <div className="flex gap-2">
          <button type="button" aria-pressed={usOnly} onClick={() => setUsOnly((v) => !v)} className={filterCls(usOnly)}>
            US only
          </button>
          <button type="button" aria-pressed={hidePast} onClick={() => setHidePast((v) => !v)} className={filterCls(hidePast)}>
            hide past
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-7">
        {sections.map((section, si) => {
          const entries = section.entries.filter((e, idx) => {
            if (e.kind === 'port') {
              if (usOnly && !e.port.us) return false
              if (hidePast && !e.here && isPast(e.port, now)) return false
              return true
            }
            if (usOnly) return false
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
            <div key={`${section.voyage.name}-${si}`}>
              <h3 className="flex items-baseline gap-3 border-b border-line pb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-sea">
                  {section.voyage.name}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {shortDate(section.voyage.start)} → {shortDate(section.voyage.end)}
                </span>
              </h3>
              <ul className="mt-2">
                {entries.map((entry, i) =>
                  entry.kind === 'port' ? (
                    <PortRow key={i} port={entry.port} here={entry.here} now={now} />
                  ) : (
                    <SeaRow key={i} entry={entry} />
                  ),
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
