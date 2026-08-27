// Pure schedule logic. No React, no DOM — independently testable.

import { PORTS, VOYAGES, SCHEDULE_START, SCHEDULE_END } from './itinerary'
import type { Port, Voyage } from './itinerary'
import { dayInZone, daySpan, noonUtc } from './format'

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

/** The next port call on US soil (or the one she's docked at right now) */
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
