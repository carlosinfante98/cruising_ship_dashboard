import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { PORTS, SHIP } from '../lib/itinerary'
import { shipState } from '../lib/voyage'
import { greatCirclePath, greatCirclePoint, shortDate } from '../lib/format'
import { useTheme } from '../theme'

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

type View = 'route' | 'ais'

/** The chart. The page's spatial organiser — the route IS the layout. */
export function ShipMap({ now }: { now: Date }) {
  const [view, setView] = useState<View>('route')
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tilesRef = useRef<L.TileLayer | null>(null)
  const overlayRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (view !== 'route' || !containerRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: true,
      scrollWheelZoom: false,
    })
    mapRef.current = map
    tilesRef.current = L.tileLayer(TILES[theme], { attribution: ATTRIBUTION }).addTo(map)
    overlayRef.current = L.layerGroup().addTo(map)
    map.setView([48, -35], 3)
    return () => {
      map.remove()
      mapRef.current = null
      tilesRef.current = null
      overlayRef.current = null
    }
    // Created once per mount of the route view; theme + data updates are applied
    // by the effects below without rebuilding the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  useEffect(() => {
    tilesRef.current?.setUrl(TILES[theme])
  }, [theme, view])

  useEffect(() => {
    const map = mapRef.current
    const overlay = overlayRef.current
    if (view !== 'route' || !map || !overlay) return
    overlay.clearLayers()

    const sea = token('--qm2-sea')
    const brass = token('--qm2-brass')
    const reunion = token('--qm2-reunion')
    const home = token('--qm2-home')
    const rule = token('--qm2-rule-2')
    const paper = token('--qm2-paper')

    for (let i = 0; i < PORTS.length - 1; i++) {
      const a = PORTS[i]
      const b = PORTS[i + 1]
      if (!a || !b) continue
      L.polyline(
        greatCirclePath(a, b).map((p) => [p.lat, p.lon]),
        { color: rule, weight: 1.25, opacity: 0.85, dashArray: '3 7' },
      ).addTo(overlay)
    }

    for (const port of PORTS) {
      const color = port.home ? home : port.us ? reunion : sea
      L.circleMarker([port.lat, port.lon], {
        radius: port.us ? 5.5 : 3.5,
        color,
        weight: 2,
        fillColor: paper,
        fillOpacity: 1,
      })
        .bindTooltip(`${port.name} · ${shortDate(port.date)}`)
        .addTo(overlay)
    }

    const state = shipState(now)
    let pos: { lat: number; lon: number } | undefined
    if (state.kind === 'in-port') {
      pos = { lat: state.port.lat, lon: state.port.lon }
    } else if (state.kind === 'at-sea') {
      pos = greatCirclePoint(state.from, state.to, state.progress)
      L.polyline(
        greatCirclePath(state.from, state.to).map((p) => [p.lat, p.lon]),
        { color: brass, weight: 2.5, opacity: 1 },
      ).addTo(overlay)
    }

    if (pos) {
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:block;width:12px;height:12px;background:${brass};border:2px solid ${paper};box-shadow:0 0 0 1px ${brass}"></span>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })
      L.marker([pos.lat, pos.lon], { icon, zIndexOffset: 1000 })
        .bindTooltip(`${SHIP.name} · estimated position`)
        .addTo(overlay)
      map.setView([pos.lat, pos.lon], Math.max(map.getZoom(), 4), { animate: false })
    } else {
      map.fitBounds(L.latLngBounds(PORTS.map((p) => [p.lat, p.lon])), { padding: [24, 24] })
    }
  }, [view, now, theme])

  const tab = (v: View, label: string) => (
    <button
      key={v}
      role="tab"
      aria-selected={view === v}
      onClick={() => setView(v)}
      className={`whitespace-nowrap border px-2xs py-3xs font-mono text-[11px] tracking-[0.1em] uppercase transition-colors duration-150 active:bg-tile disabled:opacity-40 ${
        view === v
          ? 'border-rule-2 bg-paper-3 text-ink'
          : 'border-rule text-muted hover:bg-paper-2 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border-b border-rule">
      <div className="flex flex-wrap items-center justify-between gap-2xs border-b border-rule px-md py-2xs">
        <div role="tablist" aria-label="Chart view" className="flex gap-3xs">
          {tab('route', 'Route')}
          {tab('ais', 'Live AIS')}
        </div>
        <ul className="flex flex-wrap items-center gap-sm font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
          <Key tone="bg-brass" label="Ship" />
          <Key tone="bg-reunion" label="Reachable" />
          <Key tone="bg-home" label="Home" />
          <Key tone="bg-sea" label="Port" />
        </ul>
      </div>

      {view === 'route' ? (
        <div
          ref={containerRef}
          className="h-[380px] w-full sm:h-[460px] xl:h-[560px]"
          aria-label="Route chart with the ship's estimated position"
        />
      ) : (
        <iframe
          title={`Live AIS position of ${SHIP.name}`}
          src={`https://www.vesselfinder.com/aismap?imo=${SHIP.imo}&zoom=5&names=true&track=true`}
          className="h-[380px] w-full border-0 sm:h-[460px] xl:h-[560px]"
          loading="lazy"
        />
      )}
    </div>
  )
}

function Key({ tone, label }: { tone: string; label: string }) {
  return (
    <li className="flex items-center gap-3xs leading-none">
      <span aria-hidden className={`inline-block size-2 ${tone}`} />
      {label}
    </li>
  )
}
