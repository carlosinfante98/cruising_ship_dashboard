// Single source of truth for the QM2 schedule, Aug 25, 2026 – Mar 28, 2027.
// Sourced from Cunard's published itineraries and cross-checked against the
// handwritten schedule kept aboard. Dates are ISO calendar days in the port's
// local timezone; `end` marks the last day of an overnight stay.

export interface Port {
  /** ISO date (YYYY-MM-DD) of arrival / the port call day */
  date: string
  /** ISO date of departure day for overnight stays; omitted for same-day calls */
  end?: string
  name: string
  region: string
  flag: string
  /** IANA timezone of the port */
  tz: string
  lat: number
  lon: number
  /** Reachable without leaving the country (US soil, incl. territories) */
  us?: boolean
  /** Boston — where Carlos is based */
  carlos?: boolean
  /** Guests disembark/embark; medical staff remain aboard */
  turnaround?: boolean
}

export interface Voyage {
  name: string
  /** ISO date of departure (inclusive) */
  start: string
  /** ISO date of arrival at the final port (exclusive for grouping, except the last voyage) */
  end: string
}

export const SHIP = {
  name: 'Queen Mary 2',
  operator: 'Cunard',
  imo: '9241061',
  mmsi: '310627000',
  callSign: 'ZCEF6',
  flag: 'Bermuda',
} as const

/** First day of the tracked schedule */
export const SCHEDULE_START = '2026-08-25'
/** Last day currently entered — the full documented contract, Aug 2026 – Mar 2027 */
export const SCHEDULE_END = '2027-03-28'

const UK = { region: 'England', flag: '\u{1F1EC}\u{1F1E7}', tz: 'Europe/London' }
const southampton = (date: string, extra: Partial<Port> = {}): Port => ({
  date,
  name: 'Southampton',
  ...UK,
  lat: 50.8998,
  lon: -1.4044,
  turnaround: true,
  ...extra,
})
const newYork = (date: string): Port => ({
  date,
  name: 'New York',
  region: 'Brooklyn Cruise Terminal, USA',
  flag: '\u{1F1FA}\u{1F1F8}',
  tz: 'America/New_York',
  lat: 40.682,
  lon: -74.0107,
  us: true,
  turnaround: true,
})
const hamburg = (date: string): Port => ({
  date,
  name: 'Hamburg',
  region: 'Germany',
  flag: '\u{1F1E9}\u{1F1EA}',
  tz: 'Europe/Berlin',
  lat: 53.5459,
  lon: 9.9672,
})
const zeebrugge = (date: string): Port => ({
  date,
  name: 'Zeebrugge',
  region: 'Bruges, Belgium',
  flag: '\u{1F1E7}\u{1F1EA}',
  tz: 'Europe/Brussels',
  lat: 51.3311,
  lon: 3.2075,
})
const rotterdam = (date: string, extra: Partial<Port> = {}): Port => ({
  date,
  name: 'Rotterdam',
  region: 'The Netherlands',
  flag: '\u{1F1F3}\u{1F1F1}',
  tz: 'Europe/Amsterdam',
  lat: 51.9054,
  lon: 4.4866,
  ...extra,
})
const philipsburg = (date: string): Port => ({
  date,
  name: 'Philipsburg',
  region: 'Sint Maarten',
  flag: '\u{1F1F8}\u{1F1FD}',
  tz: 'America/Lower_Princes',
  lat: 18.0237,
  lon: -63.0458,
})
const tortola = (date: string): Port => ({
  date,
  name: 'Tortola',
  region: 'British Virgin Islands',
  flag: '\u{1F1FB}\u{1F1EC}',
  tz: 'America/Tortola',
  lat: 18.4207,
  lon: -64.64,
})
const basseterre = (date: string): Port => ({
  date,
  name: 'Basseterre',
  region: 'Port Zante, St Kitts & Nevis',
  flag: '\u{1F1F0}\u{1F1F3}',
  tz: 'America/St_Kitts',
  lat: 17.2948,
  lon: -62.7261,
})
const bridgetown = (date: string, extra: Partial<Port> = {}): Port => ({
  date,
  name: 'Bridgetown',
  region: 'Barbados',
  flag: '\u{1F1E7}\u{1F1E7}',
  tz: 'America/Barbados',
  lat: 13.0969,
  lon: -59.6145,
  ...extra,
})
const castries = (date: string): Port => ({
  date,
  name: 'Castries',
  region: 'St Lucia',
  flag: '\u{1F1F1}\u{1F1E8}',
  tz: 'America/St_Lucia',
  lat: 14.0101,
  lon: -60.9875,
})
const roseau = (date: string): Port => ({
  date,
  name: 'Roseau',
  region: 'Dominica',
  flag: '\u{1F1E9}\u{1F1F2}',
  tz: 'America/Dominica',
  lat: 15.3092,
  lon: -61.3794,
})
const funchal = (date: string, extra: Partial<Port> = {}): Port => ({
  date,
  name: 'Funchal',
  region: 'Madeira, Portugal',
  flag: '\u{1F1F5}\u{1F1F9}',
  tz: 'Atlantic/Madeira',
  lat: 32.6669,
  lon: -16.9241,
  ...extra,
})
const tenerife = (date: string): Port => ({
  date,
  name: 'Santa Cruz de Tenerife',
  region: 'Canary Islands, Spain',
  flag: '\u{1F1EA}\u{1F1F8}',
  tz: 'Atlantic/Canary',
  lat: 28.4636,
  lon: -16.2518,
})
const lisbon = (date: string, extra: Partial<Port> = {}): Port => ({
  date,
  name: 'Lisbon',
  region: 'Portugal',
  flag: '\u{1F1F5}\u{1F1F9}',
  tz: 'Europe/Lisbon',
  lat: 38.7223,
  lon: -9.1393,
  ...extra,
})
const bergen = (date: string): Port => ({
  date,
  name: 'Bergen',
  region: 'Norway',
  flag: '\u{1F1F3}\u{1F1F4}',
  tz: 'Europe/Oslo',
  lat: 60.3913,
  lon: 5.3221,
})

export const PORTS: Port[] = [
  southampton('2026-08-25'),
  hamburg('2026-08-27'),
  bergen('2026-08-29'),
  { date: '2026-08-30', name: 'Olden', region: 'Nordfjord, Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 61.8344, lon: 6.8064 },
  { date: '2026-08-31', name: 'Ålesund', region: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 62.4722, lon: 6.1549 },
  hamburg('2026-09-02'),
  zeebrugge('2026-09-04'),
  southampton('2026-09-05'),
  newYork('2026-09-12'),
  southampton('2026-09-19'),
  newYork('2026-09-26'),
  { date: '2026-09-29', name: 'Boston', region: 'Massachusetts, USA', flag: '\u{1F1FA}\u{1F1F8}', tz: 'America/New_York', lat: 42.3467, lon: -71.0322, us: true, carlos: true },
  { date: '2026-10-01', name: 'Sydney', region: 'Nova Scotia, Canada', flag: '\u{1F1E8}\u{1F1E6}', tz: 'America/Glace_Bay', lat: 46.1368, lon: -60.1942 },
  { date: '2026-10-03', end: '2026-10-04', name: 'Quebec City', region: 'Quebec, Canada', flag: '\u{1F1E8}\u{1F1E6}', tz: 'America/Toronto', lat: 46.8139, lon: -71.208 },
  { date: '2026-10-06', name: 'Saguenay', region: 'Quebec, Canada', flag: '\u{1F1E8}\u{1F1E6}', tz: 'America/Toronto', lat: 48.3352, lon: -70.877 },
  { date: '2026-10-07', name: 'Sept-Îles', region: 'Quebec, Canada', flag: '\u{1F1E8}\u{1F1E6}', tz: 'America/Toronto', lat: 50.2001, lon: -66.3821 },
  { date: '2026-10-09', name: 'Halifax', region: 'Nova Scotia, Canada', flag: '\u{1F1E8}\u{1F1E6}', tz: 'America/Halifax', lat: 44.6488, lon: -63.5752 },
  newYork('2026-10-11'),
  southampton('2026-10-18'),
  hamburg('2026-10-20'),
  zeebrugge('2026-10-22'),
  southampton('2026-10-23'),
  newYork('2026-10-30'),
  southampton('2026-11-06'),
  rotterdam('2026-11-08', { end: '2026-11-09' }),
  southampton('2026-11-10'),
  newYork('2026-11-17'),
  { date: '2026-11-21', name: 'St Thomas', region: 'US Virgin Islands', flag: '\u{1F1FB}\u{1F1EE}', tz: 'America/St_Thomas', lat: 18.3419, lon: -64.9307, us: true },
  tortola('2026-11-22'),
  basseterre('2026-11-23'),
  philipsburg('2026-11-24'),
  newYork('2026-11-28'),

  // ── Dec 2026: Southampton, Le Havre & Low Countries, then west to NYC ──
  southampton('2026-12-05'),
  { date: '2026-12-06', name: 'Le Havre', region: 'France (for Paris)', flag: '\u{1F1EB}\u{1F1F7}', tz: 'Europe/Paris', lat: 49.4944, lon: 0.1079 },
  zeebrugge('2026-12-08'),
  rotterdam('2026-12-09', { end: '2026-12-10' }),
  southampton('2026-12-12'),
  newYork('2026-12-19'),

  // ── Holiday Caribbean, NYC round trip over Christmas/New Year ──
  tortola('2026-12-23'),
  philipsburg('2026-12-24'),
  bridgetown('2026-12-26'),
  castries('2026-12-27'),
  roseau('2026-12-28'),
  basseterre('2026-12-29'),
  newYork('2027-01-02'),

  // ── Grand Caribbean & Atlantic Isles loop, Southampton round trip ──
  southampton('2027-01-10', { end: '2027-01-11' }),
  funchal('2027-01-15'),
  tortola('2027-01-22'),
  bridgetown('2027-01-24', { end: '2027-01-25' }),
  castries('2027-01-27'),
  { date: '2027-01-28', name: 'St Georges', region: 'Grenada', flag: '\u{1F1EC}\u{1F1E9}', tz: 'America/Grenada', lat: 12.0561, lon: -61.7488 },
  roseau('2027-01-29'),
  basseterre('2027-01-30'),
  { date: '2027-02-01', name: 'Puerto Plata', region: 'Dominican Republic', flag: '\u{1F1E9}\u{1F1F4}', tz: 'America/Santo_Domingo', lat: 19.7934, lon: -70.6884 },
  philipsburg('2027-02-03'),
  tenerife('2027-02-10'),
  southampton('2027-02-14'),

  // ── Iberian getaway, Southampton round trip ──
  { date: '2027-02-16', name: 'Vigo', region: 'Galicia, Spain', flag: '\u{1F1EA}\u{1F1F8}', tz: 'Europe/Madrid', lat: 42.2406, lon: -8.7207 },
  lisbon('2027-02-17', { end: '2027-02-18' }),
  southampton('2027-02-21'),

  // ── Atlantic Islands & West Africa loop, Southampton round trip ──
  { date: '2027-02-23', name: 'Ferrol', region: 'Galicia, Spain', flag: '\u{1F1EA}\u{1F1F8}', tz: 'Europe/Madrid', lat: 43.4832, lon: -8.2369 },
  funchal('2027-02-26', { end: '2027-02-27' }),
  { date: '2027-03-02', name: 'Dakar', region: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', tz: 'Africa/Dakar', lat: 14.7167, lon: -17.4677 },
  { date: '2027-03-04', end: '2027-03-05', name: 'Mindelo', region: 'São Vicente, Cape Verde', flag: '\u{1F1E8}\u{1F1FB}', tz: 'Atlantic/Cape_Verde', lat: 16.8901, lon: -24.9805 },
  tenerife('2027-03-08'),
  { date: '2027-03-09', name: 'Arrecife', region: 'Lanzarote, Canary Islands', flag: '\u{1F1EA}\u{1F1F8}', tz: 'Atlantic/Canary', lat: 28.963, lon: -13.5477 },
  lisbon('2027-03-11'),
  southampton('2027-03-14'),

  // ── Norwegian Fjords encore, Southampton round trip ──
  { date: '2027-03-17', name: 'Trondheim', region: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 63.4305, lon: 10.3951 },
  { date: '2027-03-19', end: '2027-03-20', name: 'Tromsø', region: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 69.6492, lon: 18.9553 },
  { date: '2027-03-22', name: 'Åndalsnes', region: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 62.567, lon: 7.689 },
  bergen('2027-03-23'),
  southampton('2027-03-26'),
  rotterdam('2027-03-27', { end: '2027-03-28' }),
]

export const VOYAGES: Voyage[] = [
  { name: 'Hamburg & Norwegian Fjords', start: '2026-08-25', end: '2026-09-05' },
  { name: 'Westbound Transatlantic Crossing', start: '2026-09-05', end: '2026-09-12' },
  { name: 'Eastbound Transatlantic Crossing', start: '2026-09-12', end: '2026-09-19' },
  { name: 'Westbound Transatlantic Crossing', start: '2026-09-19', end: '2026-09-26' },
  { name: 'New England & Canada', start: '2026-09-26', end: '2026-10-11' },
  { name: 'Eastbound Transatlantic Crossing', start: '2026-10-11', end: '2026-10-18' },
  { name: 'Hamburg & Zeebrugge', start: '2026-10-18', end: '2026-10-23' },
  { name: 'Westbound Transatlantic Crossing', start: '2026-10-23', end: '2026-10-30' },
  { name: 'Eastbound Transatlantic Crossing', start: '2026-10-30', end: '2026-11-06' },
  { name: 'Rotterdam Getaway', start: '2026-11-06', end: '2026-11-10' },
  { name: 'Westbound Transatlantic Crossing', start: '2026-11-10', end: '2026-11-17' },
  { name: 'Caribbean Celebration', start: '2026-11-17', end: '2026-11-28' },
  { name: 'Eastbound Transatlantic Crossing', start: '2026-11-28', end: '2026-12-05' },
  { name: 'Le Havre & Low Countries', start: '2026-12-05', end: '2026-12-12' },
  { name: 'Westbound Transatlantic Crossing', start: '2026-12-12', end: '2026-12-19' },
  { name: 'Holiday Caribbean', start: '2026-12-19', end: '2027-01-02' },
  { name: 'Eastbound Transatlantic Crossing', start: '2027-01-02', end: '2027-01-10' },
  { name: 'Caribbean & Atlantic Isles', start: '2027-01-10', end: '2027-02-14' },
  { name: 'Iberian Getaway', start: '2027-02-14', end: '2027-02-21' },
  { name: 'Atlantic Islands & West Africa', start: '2027-02-21', end: '2027-03-14' },
  { name: 'Norwegian Fjords Encore', start: '2027-03-14', end: '2027-03-26' },
  { name: 'Channel Crossing to Rotterdam', start: '2027-03-26', end: '2027-03-28' },
]

/** Every calendar month ('YYYY-MM') touched by the entered schedule, in order. */
export function scheduleMonths(): string[] {
  const months = new Set<string>()
  for (const p of PORTS) {
    months.add(p.date.slice(0, 7))
    if (p.end) months.add(p.end.slice(0, 7))
  }
  return [...months].sort()
}
