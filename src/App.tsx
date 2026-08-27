import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { NowReport } from './components/NowReport'
import { Reunion } from './components/Reunion'
import { ShipMap } from './components/ShipMap'
import { Timeline } from './components/Timeline'
import { SCHEDULE_END, SCHEDULE_START } from './lib/itinerary'
import { shortDate } from './lib/format'

export default function App() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Header />
      <NowReport now={now} />
      <div className="space-y-8">
        <Reunion now={now} />
        <ShipMap now={now} />
        <Timeline now={now} />
      </div>
      <footer className="mt-12 border-t border-line pt-5 font-mono text-[11px] leading-relaxed text-muted">
        <p>
          Schedule entered {shortDate(SCHEDULE_START)} – {shortDate(SCHEDULE_END)}, from
          Cunard&rsquo;s published itineraries, cross-checked against her notes. At-sea positions
          are estimates interpolated along the great-circle route — switch the map to Live AIS for
          the real thing.
        </p>
      </footer>
    </div>
  )
}
