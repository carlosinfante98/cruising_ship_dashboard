# QM2 Log

A small static web app that tracks the **Queen Mary 2** (Cunard) while she's aboard as
ship's doctor, August 2026 → March 2027. Its core job is answering two questions from
shore: *where is she right now* and *how long until the ship next docks on US soil* —
because that's when we can see each other.

**Ship**: Queen Mary 2 · IMO 9241061 · MMSI 310627000 · call sign ZCEF6 · flag Bermuda

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · Leaflet. Static site — no
backend, no API keys.

```sh
npm install
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit
npm run build        # production build → dist/
npm run build:single # one-file HTML preview → dist-single/ (vite-plugin-singlefile)
```

## Architecture

- **`src/lib/itinerary.ts`** — single source of truth. ~32 port calls (Aug 25 – Nov 30,
  2026 entered so far) with date, optional end date for overnight stays, name, region,
  flag, IANA timezone, lat/lon, and flags: `us` (reachable without leaving the country),
  `home` (Boston), `turnaround` (guests swap, she stays aboard). `VOYAGES` groups ports
  into legs. Sourced from Cunard's published itineraries, cross-checked against her
  handwritten schedule.
- **`src/lib/voyage.ts`** — pure schedule logic, no React/DOM: `shipState()`
  (in-port / at-sea / not-started / ended), `buildTimeline()` (ports grouped by voyage
  with sea-day gaps and a "you are here" marker), `nextUsPort()` and `waitProgress()`
  for the reunion countdown. Dates are ISO strings parsed only at 12:00 UTC to dodge
  timezone off-by-one bugs; "in port" is judged against the calendar day in the port's
  own timezone.
- **`src/lib/format.ts`** — great-circle interpolation (slerp on the unit sphere, not
  linear lat/lon) so the estimated at-sea position follows a realistic transatlantic
  arc; clock/timezone/date helpers built on `Intl`.
- **Components** — `Header` (theme toggle), `NowReport` (hero sentence), `Reunion`
  (next US port, countdown, progress bar), `ShipMap` (Leaflet: "Route" view with the
  great-circle path + estimated position on CARTO tiles that swap light/dark with the
  theme, and "Live AIS" via an embedded VesselFinder map keyed on the IMO), `Timeline`
  (full itinerary, filterable US-only / hide-past).

## Design system

One hue family (~205–210° sea blue) across both themes; only lightness/chroma shift so
light and dark read as one product. Three semantic accents:

- **brass** — the ship, the present moment
- **reunion purple** — a day she's reachable (deliberately the same purple as the
  highlighter she uses in her own Notes app to mark US dates)
- **home green** — Boston

Typography: Bodoni Moda (display) · Archivo (body) · JetBrains Mono (data). Dark mode
is the default, class-based (`.dark` on `<html>`), toggled through a React context,
persisted to `localStorage`, with an inline pre-paint script so there's no
flash-of-wrong-theme.

### Contrast

Every foreground/background pair is WCAG-checked. The dark-mode brass is **not**
reused in light mode — it fails contrast on the light background — so light mode
carries its own darker accent values.

| pair | light | dark |
| --- | --- | --- |
| ink on bg | 14.8 (AAA) | 15.1 (AAA) |
| ink on surface | 13.5 (AAA) | 13.7 (AAA) |
| muted on bg | 6.4 (AA) | 7.5 (AAA) |
| muted on surface | 5.8 (AA) | 6.8 (AA) |
| sea on bg | 6.9 (AA) | 8.8 (AAA) |
| sea on surface | 6.3 (AA) | 8.0 (AAA) |
| brass on bg | 6.0 (AA) | 10.2 (AAA) |
| brass on surface | 5.5 (AA) | 9.2 (AAA) |
| reunion on bg | 7.7 (AAA) | 8.6 (AAA) |
| reunion on surface | 7.0 (AAA) | 7.8 (AAA) |
| home on bg | 5.9 (AA) | 10.1 (AAA) |
| home on surface | 5.4 (AA) | 9.1 (AAA) |

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to
`main` (plus manual dispatch). `BASE_PATH` is derived from the repository name, so the
Vite `base` resolves automatically — no config needed when renaming or forking. Enable
Pages once in repo settings: **Settings → Pages → Source: GitHub Actions**.

## Updating the schedule

Everything renders from `src/lib/itinerary.ts`. To extend past Nov 30: append `Port`
entries (ISO dates, port-local calendar days; add `end` for overnight stays; set `us`
on any call on US soil) and the corresponding `VOYAGES` legs, bump `SCHEDULE_END`,
done. A note on `us`: St Thomas (USVI) is flagged reachable since it's US soil — no
passport needed — even though it isn't highlighted in her notes.
