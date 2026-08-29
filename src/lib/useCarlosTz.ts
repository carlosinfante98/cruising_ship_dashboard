import { useState } from 'react'

/**
 * A short list of US timezones — enough for the odd domestic trip without
 * turning this into a full city picker.
 */
export const CARLOS_CITIES = [
  { tz: 'America/New_York', label: 'Boston' },
  { tz: 'America/Chicago', label: 'Chicago' },
  { tz: 'America/Denver', label: 'Denver' },
  { tz: 'America/Los_Angeles', label: 'Seattle' },
] as const

const STORAGE_KEY = 'qm2-carlos-tz'
/** Boston stays the default for anyone who's never touched the picker. */
const DEFAULT_TZ = 'America/New_York'

/**
 * Where Carlos currently is, for his half of the paired clock in NowReport.
 * A per-device preference (localStorage), not shared page state — only he
 * needs to change it when travelling, and it never touches the Reunion
 * countdown or the Places country tally, both of which stay pinned to
 * Boston as "home" regardless of where he happens to be on a given trip.
 */
export function useCarlosTz(): [string, (tz: string) => void] {
  const [tz, setTzState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TZ
    } catch {
      return DEFAULT_TZ
    }
  })

  const setTz = (next: string) => {
    setTzState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable (private mode) — still applies for this session */
    }
  }

  return [tz, setTz]
}
