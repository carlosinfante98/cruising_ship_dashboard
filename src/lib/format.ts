// Geography and clock/date helpers. No React, no DOM.

export interface LatLon {
  lat: number
  lon: number
}

const RAD = Math.PI / 180

function toVector(p: LatLon): [number, number, number] {
  const lat = p.lat * RAD
  const lon = p.lon * RAD
  return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)]
}

function toLatLon(v: [number, number, number]): LatLon {
  const [x, y, z] = v
  return { lat: Math.atan2(z, Math.hypot(x, y)) / RAD, lon: Math.atan2(y, x) / RAD }
}

/**
 * Spherical linear interpolation between two points, fraction f in [0, 1].
 * Follows the great-circle arc, so a mid-Atlantic estimate arcs north the way
 * the ship actually sails, instead of cutting a straight chord on the map.
 */
export function greatCirclePoint(a: LatLon, b: LatLon, f: number): LatLon {
  const va = toVector(a)
  const vb = toVector(b)
  const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]))
  const theta = Math.acos(dot)
  if (theta < 1e-9) return a
  const sa = Math.sin((1 - f) * theta) / Math.sin(theta)
  const sb = Math.sin(f * theta) / Math.sin(theta)
  return toLatLon([
    sa * va[0] + sb * vb[0],
    sa * va[1] + sb * vb[1],
    sa * va[2] + sb * vb[2],
  ])
}

/** Sampled great-circle path for drawing as a polyline */
export function greatCirclePath(a: LatLon, b: LatLon, segments = 48): LatLon[] {
  const out: LatLon[] = []
  for (let i = 0; i <= segments; i++) out.push(greatCirclePoint(a, b, i / segments))
  return out
}

/** Parse an ISO calendar day anchored at 12:00 UTC (sidesteps DST/offset off-by-ones) */
export function noonUtc(isoDay: string): Date {
  return new Date(`${isoDay}T12:00:00Z`)
}

/** The calendar day (YYYY-MM-DD) it currently is in the given IANA timezone */
export function dayInZone(now: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Wall-clock time right now in the given IANA timezone, e.g. "14:32" */
export function clockInZone(now: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

/** "Sep 12" */
export function shortDate(isoDay: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  }).format(noonUtc(isoDay))
}

/** "Saturday, September 12" */
export function longDate(isoDay: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(noonUtc(isoDay))
}

const DAY_MS = 86_400_000

/** Whole days from `now` until noon UTC of `isoDay`, floored at 0 */
export function daysUntil(now: Date, isoDay: string): number {
  return Math.max(0, Math.ceil((noonUtc(isoDay).getTime() - now.getTime()) / DAY_MS))
}

/** Calendar-day difference between two ISO days */
export function daySpan(fromIso: string, toIso: string): number {
  return Math.round((noonUtc(toIso).getTime() - noonUtc(fromIso).getTime()) / DAY_MS)
}
