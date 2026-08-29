// Pure schedule logic. No React, no DOM — independently testable.

import { PORTS, VOYAGES, SCHEDULE_START, SCHEDULE_END } from './itinerary'
import type { Port, Voyage } from './itinerary'
import {
  dayInZone,
  daySpan,
  daysUntil,
  distanceNm,
  greatCirclePoint,
  noonUtc,
} from './format'

export type ShipState =
  | { kind: 'not-started'; firstPort: Port }
  | { kind: 'in-port'; port: Port }
  | { kind: 'at-sea'; from: Port; to: Port; progress: number }
  | { kind: 'ended'; lastPort: Port }

/** Departure moment of a port call: noon UTC of its last day aboard */
export function departureOf(port: Port): Date {
  return noonUtc(port.end ?? port.date)
}

/** Arrival moment of a port call: noon UTC of its first day */
export function arrivalOf(port: Port): Date {
  return noonUtc(port.date)
}

/**
 * Where the ship is on a given instant. "In port" means the current calendar
 * day *in that port's own timezone* falls within the call's day range; at-sea
 * progress is the fraction of the leg between the previous departure and the
 * next arrival, both anchored at 12:00 UTC.
 */
export function shipState(now: Date): ShipState {
  const first = PORTS[0]
  const last = PORTS[PORTS.length - 1]
  if (!first || !last) throw new Error('empty itinerary')

  for (const port of PORTS) {
    const today = dayInZone(now, port.tz)
    if (today >= port.date && today <= (port.end ?? port.date)) {
      return { kind: 'in-port', port }
    }
  }

  if (now < arrivalOf(first)) return { kind: 'not-started', firstPort: first }
  if (now > noonUtc(SCHEDULE_END)) return { kind: 'ended', lastPort: last }

  for (let i = 0; i < PORTS.length - 1; i++) {
    const from = PORTS[i]
    const to = PORTS[i + 1]
    if (!from || !to) continue
    const dep = departureOf(from).getTime()
    const arr = arrivalOf(to).getTime()
    if (now.getTime() >= dep && now.getTime() <= arr) {
      const progress = arr === dep ? 1 : (now.getTime() - dep) / (arr - dep)
      return { kind: 'at-sea', from, to, progress: Math.min(1, Math.max(0, progress)) }
    }
  }

  // Past the last port but before SCHEDULE_END (e.g. Nov 29–30, next leg not yet entered)
  return { kind: 'ended', lastPort: last }
}

export type TimelineEntry =
  | { kind: 'port'; port: Port; here: boolean }
  | { kind: 'sea'; days: number; here: boolean; progress: number }

export interface TimelineSection {
  voyage: Voyage
  entries: TimelineEntry[]
}

/**
 * The full itinerary grouped by voyage, with sea-day gaps between calls and a
 * "you are here" flag on the entry (port or gap) where the ship currently is.
 * A turnaround port opens the voyage that departs from it.
 */
export function buildTimeline(now: Date): TimelineSection[] {
  const state = shipState(now)

  const belongsTo = (port: Port, v: Voyage, isLast: boolean): boolean =>
    isLast ? port.date >= v.start && port.date <= v.end : port.date >= v.start && port.date < v.end

  return VOYAGES.map((voyage, vi) => {
    const isLastVoyage = vi === VOYAGES.length - 1
    const ports = PORTS.filter((p) => belongsTo(p, voyage, isLastVoyage))
    const entries: TimelineEntry[] = []

    ports.forEach((port, i) => {
      if (i > 0) {
        const prev = ports[i - 1]
        if (prev) {
          const gap = daySpan(prev.end ?? prev.date, port.date) - 1
          const hereAtSea =
            state.kind === 'at-sea' && state.from === prev && state.to === port
          if (gap > 0 || hereAtSea) {
            entries.push({
              kind: 'sea',
              days: Math.max(gap, 0),
              here: hereAtSea,
              progress: hereAtSea ? state.progress : 0,
            })
          }
        }
      }
      entries.push({
        kind: 'port',
        port,
        here: state.kind === 'in-port' && state.port === port,
      })
    })

    // A leg that ends at the next voyage's opening port still needs its sea gap
    // and here-marker rendered somewhere; attach it to the end of this section.
    const lastPort = ports[ports.length - 1]
    const nextVoyage = VOYAGES[vi + 1]
    if (lastPort && nextVoyage) {
      const nextPort = PORTS.find((p) => p.date >= nextVoyage.start && p !== lastPort)
      if (nextPort) {
        const gap = daySpan(lastPort.end ?? lastPort.date, nextPort.date) - 1
        const hereAtSea =
          state.kind === 'at-sea' && state.from === lastPort && state.to === nextPort
        if (gap > 0 || hereAtSea) {
          entries.push({
            kind: 'sea',
            days: Math.max(gap, 0),
            here: hereAtSea,
            progress: hereAtSea ? state.progress : 0,
          })
        }
      }
    }

    return { voyage, entries }
  })
}

/** The next port call on US soil (or the one currently docked, if any) */
export function nextUsPort(now: Date): Port | undefined {
  const state = shipState(now)
  if (state.kind === 'in-port' && state.port.us) return state.port
  return PORTS.find((p) => p.us && arrivalOf(p) > now)
}

export interface WaitProgress {
  /** Departure that started this wait: the previous US port, or the schedule start */
  fromIso: string
  toPort: Port
  /** 0 → just parted, 1 → docking day */
  progress: number
}

/** How far through the current wait-for-a-US-port stretch we are */
export function waitProgress(now: Date): WaitProgress | undefined {
  const toPort = nextUsPort(now)
  if (!toPort) return undefined

  const prevUs = [...PORTS]
    .reverse()
    .find((p) => p.us && departureOf(p) <= now && p !== toPort)
  const fromIso = prevUs ? (prevUs.end ?? prevUs.date) : SCHEDULE_START

  const start = noonUtc(fromIso).getTime()
  const end = arrivalOf(toPort).getTime()
  const progress =
    end <= start ? 1 : Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)))
  return { fromIso, toPort, progress }
}

export interface VoyageStats {
  /** Total great-circle length of the entered route, nautical miles */
  routeNm: number
  /** Nautical miles already covered (up to the last departed port) */
  coveredNm: number
  /** Port calls still ahead */
  portsAhead: number
  /** Days in the entered schedule with no port call, from today onward */
  seaDaysAhead: number
  /** US port calls still ahead (or today's, if docked at one) */
  usCallsAhead: number
  /** Days until the Boston call, or undefined once it has passed */
  daysToCarlos?: number
}

/**
 * Real figures derived from the itinerary — nothing here is estimated or
 * invented; every number is a sum or count over PORTS.
 */
export function voyageStats(now: Date): VoyageStats {
  let routeNm = 0
  let coveredNm = 0
  for (let i = 0; i < PORTS.length - 1; i++) {
    const a = PORTS[i]
    const b = PORTS[i + 1]
    if (!a || !b) continue
    const leg = distanceNm(a, b)
    routeNm += leg
    if (arrivalOf(b) <= now) coveredNm += leg
  }

  const portsAhead = PORTS.filter((p) => arrivalOf(p) > now).length
  const usCallsAhead = PORTS.filter(
    (p) => p.us && (arrivalOf(p) > now || dayInZone(now, p.tz) <= (p.end ?? p.date)),
  ).length

  // A day is a "sea day" when no port call covers it.
  const inPortDays = new Set<string>()
  for (const p of PORTS) {
    let d = p.date
    while (d <= (p.end ?? p.date)) {
      inPortDays.add(d)
      d = new Date(noonUtc(d).getTime() + 86_400_000).toISOString().slice(0, 10)
    }
  }
  let seaDaysAhead = 0
  const today = dayInZone(now, 'UTC')
  for (let d = today; d <= SCHEDULE_END; ) {
    if (d >= SCHEDULE_START && !inPortDays.has(d)) seaDaysAhead++
    d = new Date(noonUtc(d).getTime() + 86_400_000).toISOString().slice(0, 10)
  }

  const carlos = PORTS.find((p) => p.carlos && arrivalOf(p) > now)
  return {
    routeNm,
    coveredNm,
    portsAhead,
    seaDaysAhead,
    usCallsAhead,
    ...(carlos ? { daysToCarlos: daysUntil(now, carlos.date) } : {}),
  }
}

/** The next few port calls after the ship's current position. */
export function upcomingPorts(now: Date, count: number): Port[] {
  return PORTS.filter((p) => arrivalOf(p) > now).slice(0, count)
}

export interface Position {
  lat: number
  lon: number
  /** true when docked (the port's own coordinates), false when interpolated at sea */
  exact: boolean
}

/** Where the ship is right now — the port's coordinates, or the great-circle estimate. */
export function currentPosition(now: Date): Position | undefined {
  const state = shipState(now)
  if (state.kind === 'in-port') {
    return { lat: state.port.lat, lon: state.port.lon, exact: true }
  }
  if (state.kind === 'at-sea') {
    const p = greatCirclePoint(state.from, state.to, state.progress)
    return { lat: p.lat, lon: p.lon, exact: false }
  }
  return undefined
}

export interface NextLeg {
  /** The port sailed from; absent before the voyage begins */
  from?: Port
  to: Port
  /** Great-circle length of this leg, nautical miles */
  nmLeg: number
  /** Nautical miles still to run on this leg */
  nmRemaining: number
  /** 0 → just departed, 1 → alongside */
  progress: number
  daysAway: number
  /** True while still alongside the previous port (hasn't sailed yet) */
  stillAlongside: boolean
}

/**
 * The next destination: where it's headed, how far it is, and how far along
 * the current leg it is. Distances are great-circle, matching the chart.
 */
export function nextLeg(now: Date): NextLeg | undefined {
  const state = shipState(now)

  let from: Port | undefined
  let to: Port | undefined
  let progress = 0
  let stillAlongside = false

  if (state.kind === 'at-sea') {
    from = state.from
    to = state.to
    progress = state.progress
  } else if (state.kind === 'in-port') {
    from = state.port
    to = PORTS.find((p) => arrivalOf(p) > departureOf(state.port))
    stillAlongside = true
  } else if (state.kind === 'not-started') {
    to = state.firstPort
  }

  if (!to) return undefined
  const nmLeg = from ? distanceNm(from, to) : 0
  return {
    ...(from ? { from } : {}),
    to,
    nmLeg,
    nmRemaining: nmLeg * (1 - progress),
    progress,
    daysAway: daysUntil(now, to.date),
    stillAlongside,
  }
}

export interface PlaceVisit {
  name: string
  flag: string
  /** Total scheduled calls to this place across the whole entered schedule */
  visits: number
  /** How many of those calls have already happened (arrival <= now) */
  visited: number
  /** ISO date of the first call to this place */
  firstDate: string
}

function groupPlaces(now: Date, keyOf: (p: Port) => string): PlaceVisit[] {
  const byName = new Map<string, PlaceVisit>()
  for (const port of PORTS) {
    const key = keyOf(port)
    const already = arrivalOf(port) <= now
    const existing = byName.get(key)
    if (existing) {
      existing.visits += 1
      if (already) existing.visited += 1
      if (port.date < existing.firstDate) existing.firstDate = port.date
    } else {
      byName.set(key, {
        name: key,
        flag: port.flag,
        visits: 1,
        visited: already ? 1 : 0,
        firstDate: port.date,
      })
    }
  }
  return [...byName.values()].sort((a, b) => a.firstDate.localeCompare(b.firstDate))
}

/** Every distinct city/port name in the schedule, with how many times it's called at. */
export function cityVisits(now: Date): PlaceVisit[] {
  return groupPlaces(now, (p) => p.name)
}

/** Every distinct country (territories counted separately — see `Port.country`). */
export function countryVisits(now: Date): PlaceVisit[] {
  return groupPlaces(now, (p) => p.country)
}

export interface PlacesSummary {
  countriesVisited: number
  countriesTotal: number
  citiesVisited: number
  citiesTotal: number
  countries: PlaceVisit[]
  cities: PlaceVisit[]
}

/** Countries/cities reached so far vs. the full entered schedule, plus the per-place tally. */
export function placesSummary(now: Date): PlacesSummary {
  const countries = countryVisits(now)
  const cities = cityVisits(now)
  return {
    countriesVisited: countries.filter((c) => c.visited > 0).length,
    countriesTotal: countries.length,
    citiesVisited: cities.filter((c) => c.visited > 0).length,
    citiesTotal: cities.length,
    countries,
    cities,
  }
}
