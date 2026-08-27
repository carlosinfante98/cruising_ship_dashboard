import { useEffect, useState } from 'react'
import { SideRail } from './components/SideRail'
import { NowReport } from './components/NowReport'
import { PositionBand } from './components/PositionBand'
import { Reunion } from './components/Reunion'
import { ShipMap } from './components/ShipMap'
import { StatStrip } from './components/StatStrip'
import { Timeline } from './components/Timeline'
import { Colophon } from './components/Colophon'

export default function App() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <header className="lg:sticky lg:top-0 lg:h-dvh">
        <SideRail now={now} />
      </header>

      <main className="min-w-0">
        <section id="now" className="scroll-mt-2">
          <NowReport now={now} />
        </section>

        <PositionBand now={now} />

        <section id="chart" className="scroll-mt-2" aria-label="Chart">
          <ShipMap now={now} />
        </section>

        <StatStrip now={now} />

        <section id="reunion" className="scroll-mt-2 border-b border-rule" aria-label="Reunion">
          <Reunion now={now} />
        </section>

        <section id="log" className="scroll-mt-2" aria-label="The log">
          <Timeline now={now} />
        </section>

        <Colophon />
      </main>
    </div>
  )
}
