import { SHIP, SCHEDULE_END, SCHEDULE_START } from '../lib/itinerary'
import { shortDate } from '../lib/format'

/** Ft4 dense colophon — the almanac's back page: sources and papers. */
export function Colophon() {
  const rows: [string, string][] = [
    ['Vessel', `${SHIP.name} · ${SHIP.operator}`],
    ['IMO / MMSI', `${SHIP.imo} · ${SHIP.mmsi}`],
    ['Call sign / flag', `${SHIP.callSign} · ${SHIP.flag}`],
    ['Schedule entered', `${shortDate(SCHEDULE_START)} – ${shortDate(SCHEDULE_END)}, 2026`],
    ['Itinerary source', 'Cunard published voyages, cross-checked against notes kept aboard'],
    ['Position', 'Estimated along the great-circle route between calls'],
    ['Live track', 'VesselFinder AIS · basemap CARTO / OpenStreetMap'],
  ]

  return (
    <footer className="border-t border-rule-2 px-md py-md">
      <dl className="grid gap-x-lg gap-y-3xs font-mono text-[10px] leading-relaxed sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2xs border-b border-rule py-3xs">
            <dt className="w-28 shrink-0 tracking-[0.08em] text-muted uppercase">{k}</dt>
            <dd className="min-w-0 flex-1 text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-sm max-w-[70ch] font-mono text-[10px] leading-relaxed text-muted">
        A running log of the ship&rsquo;s Atlantic contract. Times are the ship&rsquo;s local time in
        port; sea-day positions are interpolated, not observed — switch the chart to Live AIS for
        the real fix.
      </p>
    </footer>
  )
}
