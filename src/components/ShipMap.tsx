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

function cssColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

type View = 'route' | 'ais'

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
    // The map is created once per mount of the route view; theme and data
    // updates are applied by the effects below without rebuilding it.
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

    const sea = cssColor('--qm2-sea')
    const brass = cssColor('--qm2-brass')
    const reunion = cssColor('--qm2-reunion')
    const home = cssColor('--qm2-home')
    const muted = cssColor('--qm2-muted')

    for (let i = 0; i < PORTS.length - 1; i++) {
      const a = PORTS[i]
      const b = PORTS[i + 1]
      if (!a || !b) continue
      L.polyline(
        greatCirclePath(a, b).map((p) => [p.lat, p.lon]),
        { color: muted, weight: 1.5, opacity: 0.5, dashArray: '4 6' },
      ).addTo(overlay)
    }

    for (const port of PORTS) {
      const color = port.home ? home : port.us ? reunion : sea
      L.circleMarker([port.lat, port.lon], {
        radius: port.us ? 6 : 4,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.5,
      })
        .bindTooltip(`${port.flag} ${port.name} · ${shortDate(port.date)}`)
        .addTo(overlay)
    }

    const state = shipState(now)
    let shipPos: { lat: number; lon: number } | undefined
    if (state.kind === 'in-port') {
      shipPos = { lat: state.port.lat, lon: state.port.lon }
    } else if (state.kind === 'at-sea') {
      shipPos = greatCirclePoint(state.from, state.to, state.progress)
      L.polyline(
        greatCirclePath(state.from, state.to).map((p) => [p.lat, p.lon]),
        { color: brass, weight: 2.5, opacity: 0.9 },
      ).addTo(overlay)
    }

    if (shipPos) {
      const icon = L.divIcon({
        className: '',
        html: `<div class="ship-dot" style="width:14px;height:14px;border-radius:9999px;background:${brass};border:2px solid ${cssColor('--qm2-bg')}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([shipPos.lat, shipPos.lon], { icon, zIndexOffset: 1000 })
        .bindTooltip(`${SHIP.name} · estimated position`)
        .addTo(overlay)
      map.setView([shipPos.lat, shipPos.lon], Math.max(map.getZoom(), 4))
    } else {
      map.fitBounds(L.latLngBounds(PORTS.map((p) => [p.lat, p.lon])), { padding: [24, 24] })
    }
  }, [view, now, theme])

  return (
    <section aria-label="Ship map" className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
        <div role="tablist" aria-label="Map view" className="flex gap-1">
          {(['route', 'ais'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                view === v ? 'bg-bg text-brass' : 'text-muted hover:text-ink'
              }`}
            >
              {v === 'route' ? 'Route' : 'Live AIS'}
            </button>
          ))}
        </div>
        <p className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:block">
          {view === 'route' ? 'estimated from schedule' : `VesselFinder · IMO ${SHIP.imo}`}
        </p>
      </div>

      {view === 'route' ? (
        <div ref={containerRef} className="h-[420px] w-full" />
      ) : (
        <iframe
          title={`Live AIS position of ${SHIP.name}`}
          src={`https://www.vesselfinder.com/aismap?imo=${SHIP.imo}&zoom=5&names=true&track=true`}
          className="h-[420px] w-full border-0"
          loading="lazy"
        />
      )}
    </section>
  )
}
