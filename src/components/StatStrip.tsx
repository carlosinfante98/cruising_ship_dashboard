import { voyageStats } from '../lib/voyage'
import { groupedInt } from '../lib/format'

/**
 * Four figures, every one summed or counted from the itinerary itself —
 * no estimates, no invented metrics.
 */
export function StatStrip({ now }: { now: Date }) {
  const s = voyageStats(now)
  const pct = s.routeNm > 0 ? Math.round((s.coveredNm / s.routeNm) * 100) : 0

  const cells: { value: string; unit: string; label: string; tone?: string }[] = [
    {
      value: groupedInt(s.coveredNm),
      unit: `of ${groupedInt(s.routeNm)} nm`,
      label: `Sailed · ${pct}% of route`,
    },
    { value: String(s.portsAhead), unit: 'calls', label: 'Ports still ahead' },
    { value: String(s.seaDaysAhead), unit: 'days', label: 'Sea days remaining' },
    {
      value: s.daysToHome !== undefined ? String(s.daysToHome) : '—',
      unit: s.daysToHome !== undefined ? 'days' : '',
      label: s.daysToHome !== undefined ? 'Until Boston' : 'Boston call passed',
      tone: 'text-home',
    },
  ]

  return (
    <dl className="grid grid-cols-2 border-b border-rule xl:grid-cols-4">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={`border-rule px-md py-md ${i % 2 === 0 ? 'border-r' : ''} ${
            i < 2 ? 'border-b xl:border-b-0' : ''
          } xl:border-r xl:last:border-r-0`}
        >
          <dd className="flex items-baseline gap-2xs">
            <span className={`tnum font-display text-3xl leading-none font-semibold sm:text-4xl ${c.tone ?? ''}`}>
              {c.value}
            </span>
            {c.unit && <span className="font-mono text-[11px] text-muted">{c.unit}</span>}
          </dd>
          <dt className="mt-2xs font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
            {c.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
