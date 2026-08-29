// Shared source of truth for in-page navigation — the side rail (desktop)
// and the sticky mobile nav both render from this list, and the active-
// section hook watches these same ids.

export const SECTIONS = [
  { id: 'now', label: 'Now' },
  { id: 'chart', label: 'Chart' },
  { id: 'reunion', label: 'Reunion' },
  { id: 'log', label: 'Log' },
  { id: 'places', label: 'Places' },
] as const

export const SECTION_IDS: string[] = SECTIONS.map((s) => s.id)
