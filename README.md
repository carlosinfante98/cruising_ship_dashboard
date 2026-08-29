# QM2 Log

A small static web app that tracks the **Queen Mary 2** (Cunard) during its August
2026 → March 2027 contract. Its core job is answering two questions, for anyone
looking at it: *where is the ship right now* and *how long until it next docks on US
soil* — because that's when the two of us can be in the same place.

**Ship**: Queen Mary 2 · IMO 9241061 · MMSI 310627000 · call sign ZCEF6 · flag Bermuda

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · Leaflet. Static site — no
backend, no API key required.

```sh
npm install
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit
npm run build        # production build → dist/
npm run build:single # one-file HTML preview → dist-single/ (vite-plugin-singlefile)
```

### Optional: a CARTO key

The Route chart's basemap tiles (CARTO) work anonymously with no key — that's what a
fresh checkout gets by default. A personal key just raises the anonymous rate limit;
it is never required.

To set one locally: copy `.env.example` to `.env.local` and fill in `VITE_CARTO_KEY`.
`.env.local` is gitignored — **never commit a key**. For the deployed site, add it as
a repository secret named `CARTO_KEY` (**Settings → Secrets and variables →
Actions**); the deploy workflow picks it up automatically.

One thing worth understanding: because this is a static site with no backend, the key
still ends up inside the public JS bundle served to every visitor — there's nowhere
server-side to keep it hidden. Keeping it out of the git repo (via `.gitignore` /
Actions secret) stops it from leaking through commit history or a public repo listing,
but it is not a secret once the site is deployed — anyone can read it out of the
Network tab. If that matters to you, set an HTTP-referrer restriction on the key in
your CARTO dashboard so it only works from your GitHub Pages domain.

## Architecture

- **`src/lib/itinerary.ts`** — single source of truth. 74 port calls, Aug 25, 2026 –
  Mar 28, 2027 (the full documented contract) with date, optional end date for
  overnight stays, name, region, `country`, flag, IANA timezone, lat/lon, and flags:
  `us` (reachable without leaving the country), `carlos` (Boston, where Carlos is
  based), `turnaround` (guests swap, medical staff remain aboard). `country` is kept
  separate from the free-text `region` (which mixes sub-region and country
  inconsistently, e.g. "Nordfjord, Norway") specifically so the Places section can
  count reliably — territories (US/British Virgin Islands, Sint Maarten, St Kitts &
  Nevis) are counted as their own entries, matching how a travelled itinerary is
  actually tallied. `VOYAGES` groups ports into 22 legs; `scheduleMonths()` derives
  the calendar months touched, for the log's month filter. Sourced from Cunard's
  published itineraries, cross-checked against the handwritten schedule kept aboard.
- **`src/lib/voyage.ts`** — pure schedule logic, no React/DOM: `shipState()`
  (in-port / at-sea / not-started / ended), `buildTimeline()` (ports grouped by voyage
  with sea-day gaps and a "you are here" marker), `nextUsPort()` and `waitProgress()`
  for the reunion countdown. Dates are ISO strings parsed only at 12:00 UTC to dodge
  timezone off-by-one bugs; "in port" is judged against the calendar day in the port's
  own timezone.
- **`src/lib/format.ts`** — great-circle interpolation (slerp on the unit sphere, not
  linear lat/lon) so the estimated at-sea position follows a realistic transatlantic
  arc; clock/timezone/date helpers built on `Intl`.
- **Components** — `SideRail` (identity, live state, section anchors, ship's papers,
  theme toggle), `MobileNav` (the sticky mobile equivalent of the rail), `NowReport`
  (the hero sentence + Nati's clock beside Carlos's), `ShipMap`
  (the chart: "Route" view with the great-circle path + estimated position on CARTO
  tiles that swap light/dark with the theme, and "Live AIS" via an embedded
  VesselFinder map keyed on the IMO), `StatStrip` (four figures, each summed or
  counted from the itinerary — nothing estimated), `Reunion` (countdown, wait
  progress, the US calls after this one), `Timeline` (the log, set in almanac columns,
  filterable by month, US-only, and hide-past), `Places` (countries and cities
  checked off against the full schedule, with a per-place visit count for repeat
  calls), `Colophon` (sources and ship's papers).

## Design system

Built with [Hallmark](https://github.com/nutlope/hallmark) — genre **editorial**,
macrostructure **19 · Map / Diagram**, theme **Almanac** (retuned), nav **N3 side-rail**,
footer **Ft4 dense colophon**. The chart is the page's spatial organiser: a persistent
left rail holds identity and live state, and the full width of the canvas belongs to the
route, the figures and the log.

One hue family (sea-blue, OKLCH ~240–252°) across both themes; only lightness and chroma
shift, so light and dark read as one product. Three semantic accents:

- **brass** — the ship, the present moment
- **reunion purple** — a day the ship is reachable (deliberately the same purple as
  the highlighter used in the source Notes app to mark US dates)
- **carlos green** — Boston, where Carlos is based

Typography: Bodoni Moda (display, roman) · Archivo (body) · JetBrains Mono (data and
labels) — three families, the ceiling Hallmark allows. Square corners, hairline rules and
dense tabular figures throughout; every numeral is `tabular-nums`. Dark mode is the
default, class-based (`.dark` on `<html>`), toggled through a React context, persisted to
`localStorage`, with an inline pre-paint script so there's no flash-of-wrong-theme.
Portable tokens live in [`tokens.css`](tokens.css).

### Contrast

Every foreground/background pair is verified against all three surface levels. The
dark-mode brass is **not** reused in light mode — it fails contrast on light paper — so
light mode carries its own darker accent values.

| pair | on paper | on paper-2 | on paper-3 |
| --- | --- | --- | --- |
| ink | 14.8 / 15.1 | 13.5 / 13.7 | 12.0 / 12.1 |
| ink-2 | 11.3 / 11.6 | 10.3 / 10.4 | 9.1 / 9.2 |
| muted | 6.4 / 7.5 | 5.8 / 6.8 | 5.2 / 6.0 |
| sea | 6.9 / 8.8 | 6.3 / 8.0 | 5.6 / 7.0 |
| brass | 6.0 / 10.2 | 5.5 / 9.2 | 4.9 / 8.1 |
| reunion | 7.7 / 8.6 | 7.0 / 7.8 | 6.3 / 6.9 |
| carlos | 5.9 / 10.1 | 5.4 / 9.1 | 4.8 / 8.0 |

*light / dark. Every pair clears WCAG AA (4.5:1); most clear AAA.*

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to
`main` (plus manual dispatch). `BASE_PATH` is derived from the repository name, so the
Vite `base` resolves automatically — no config needed when renaming or forking. Enable
Pages once in repo settings: **Settings → Pages → Source: GitHub Actions**.

## Updating the schedule

Everything renders from `src/lib/itinerary.ts`. To extend past Mar 28, 2027: append
`Port` entries (ISO dates, port-local calendar days; add `end` for overnight stays;
set `us` on any call on US soil) and the corresponding `VOYAGES` legs, bump
`SCHEDULE_END`, done — `scheduleMonths()` picks up any new months automatically, no
separate list to maintain. A note on `us`: St Thomas (USVI) is flagged reachable
since it's US soil — no passport needed — even though it isn't highlighted in the
source notes.
