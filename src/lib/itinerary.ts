// Single source of truth for the QM2 schedule, Aug 25 – Nov 30, 2026.
// Sourced from Cunard's published itineraries (voyages M622–M632) and
// cross-checked against the handwritten schedule kept aboard.
// Dates are ISO calendar days in the port's local timezone; `end` marks the
// last day of an overnight stay.

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
/** Last day currently entered; the contract runs to March 2027 — more dates to come */
export const SCHEDULE_END = '2026-11-30'

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

export const PORTS: Port[] = [
  southampton('2026-08-25'),
  hamburg('2026-08-27'),
  { date: '2026-08-29', name: 'Bergen', region: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', tz: 'Europe/Oslo', lat: 60.3913, lon: 5.3221 },
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
  { date: '2026-11-08', end: '2026-11-09', name: 'Rotterdam', region: 'The Netherlands', flag: '\u{1F1F3}\u{1F1F1}', tz: 'Europe/Amsterdam', lat: 51.9054, lon: 4.4866 },
  southampton('2026-11-10'),
  newYork('2026-11-17'),
  { date: '2026-11-21', name: 'St Thomas', region: 'US Virgin Islands', flag: '\u{1F1FB}\u{1F1EE}', tz: 'America/St_Thomas', lat: 18.3419, lon: -64.9307, us: true },
  { date: '2026-11-22', name: 'Tortola', region: 'British Virgin Islands', flag: '\u{1F1FB}\u{1F1EC}', tz: 'America/Tortola', lat: 18.4207, lon: -64.64 },
  { date: '2026-11-23', name: 'Basseterre', region: 'Port Zante, St Kitts & Nevis', flag: '\u{1F1F0}\u{1F1F3}', tz: 'America/St_Kitts', lat: 17.2948, lon: -62.7261 },
  { date: '2026-11-24', name: 'Philipsburg', region: 'Sint Maarten', flag: '\u{1F1F8}\u{1F1FD}', tz: 'America/Lower_Princes', lat: 18.0237, lon: -63.0458 },
  newYork('2026-11-28'),
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
]
