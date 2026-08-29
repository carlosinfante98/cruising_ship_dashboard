import { placesSummary } from '../lib/voyage'
import type { PlaceVisit } from '../lib/voyage'

/**
 * The passport page: how many countries and cities are checked off so far
 * against the whole entered schedule, and — since several are repeat calls —
 * how many times each one is actually visited. Recomputes live off `now`, so
 * a place moves from "still ahead" to "checked" the moment it's reached.
 */
export function Places({ now }: { now: Date }) {
  const summary = placesSummary(now)

  return (
    <div className="border-b border-rule">
      <div className="border-b border-rule px-md py-2xs">
        <h2 className="font-display text-xl font-semibold">Places</h2>
      </div>

      <dl className="grid grid-cols-2 border-b border-rule">
        <StatCell
          label="Countries checked"
          value={summary.countriesVisited}
          total={summary.countriesTotal}
        />
        <StatCell
          label="Cities checked"
          value={summary.citiesVisited}
          total={summary.citiesTotal}
          border={false}
        />
      </dl>

      <div className="grid gap-lg px-md py-md sm:grid-cols-2 sm:gap-2xl">
        <PlaceList title="Countries" places={summary.countries} />
        <PlaceList title="Cities" places={summary.cities} />
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  total,
  border = true,
}: {
  label: string
  value: number
  total: number
  border?: boolean
}) {
  return (
    <div className={`px-md py-md ${border ? 'border-r border-rule' : ''}`}>
      <dd className="flex items-baseline gap-2xs">
        <span className="tnum font-display text-3xl leading-none font-semibold sm:text-4xl">
          {value}
        </span>
        <span className="font-mono text-[11px] text-muted">of {total}</span>
      </dd>
      <dt className="mt-2xs font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
        {label}
      </dt>
    </div>
  )
}

function PlaceList({ title, places }: { title: string; places: PlaceVisit[] }) {
  const checked = places.filter((p) => p.visited > 0)
  const ahead = places.filter((p) => p.visited === 0)

  return (
    <div className="min-w-0">
      <h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
        {title} · {checked.length} of {places.length}
      </h3>

      {checked.length > 0 && (
        <ol className="mt-2xs">
          {checked.map((p) => (
            <PlaceRow key={p.name} place={p} />
          ))}
        </ol>
      )}

      {ahead.length > 0 && (
        <>
          <p className="mt-md font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
            Still ahead
          </p>
          <ol className="mt-2xs">
            {ahead.map((p) => (
              <PlaceRow key={p.name} place={p} />
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

function PlaceRow({ place }: { place: PlaceVisit }) {
  const done = place.visited === place.visits
  const countTone = done ? 'text-sea' : place.visited > 0 ? 'text-ink-2' : 'text-muted'
  return (
    <li className="flex items-center gap-2xs border-b border-rule py-3xs">
      <span aria-hidden className="shrink-0">
        {place.flag}
      </span>
      <span className={`min-w-0 flex-1 truncate ${place.visited > 0 ? 'text-ink' : 'text-muted'}`}>
        {place.name}
      </span>
      {place.visits > 1 ? (
        <span className={`tnum shrink-0 font-mono text-[11px] ${countTone}`}>
          {place.visited}/{place.visits}
        </span>
      ) : (
        <span className={`shrink-0 font-mono text-[10px] tracking-[0.06em] uppercase ${countTone}`}>
          {place.visited > 0 ? 'checked' : 'ahead'}
        </span>
      )}
    </li>
  )
}
