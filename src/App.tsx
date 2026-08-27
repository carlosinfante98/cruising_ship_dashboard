import { useEffect, useState } from 'react'
import { SideRail } from './components/SideRail'
import { MobileNav } from './components/MobileNav'
import { NowReport } from './components/NowReport'
import { PositionBand } from './components/PositionBand'
import { Reunion } from './components/Reunion'
import { ShipMap } from './components/ShipMap'
import { StatStrip } from './components/StatStrip'
import { Timeline } from './components/Timeline'
import { Colophon } from './components/Colophon'
import { SECTION_IDS } from './lib/sections'
import { useActiveSection } from './lib/useActiveSection'

// Section anchors scroll clear of the sticky mobile nav bar (h-9 content +
// padding ≈ 3rem); desktop needs no offset since the rail sits beside the
// content rather than above it.
const SCROLL_MT = 'scroll-mt-14 lg:scroll-mt-2'

export default function App() {
  const [now, setNow] = useState(() => new Date())
  const active = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <header className="lg:sticky lg:top-0 lg:h-dvh">
        <SideRail now={now} active={active} />
      </header>

      <MobileNav active={active} />

      <main className="min-w-0">
        <section id="now" className={SCROLL_MT}>
          <NowReport now={now} />
        </section>

        <PositionBand now={now} />

        <section id="chart" className={SCROLL_MT} aria-label="Chart">
          <ShipMap now={now} />
        </section>

        <StatStrip now={now} />

        <section id="reunion" className={`${SCROLL_MT} border-b border-rule`} aria-label="Reunion">
          <Reunion now={now} />
        </section>

        <section id="log" className={SCROLL_MT} aria-label="The log">
          <Timeline now={now} />
        </section>

        <Colophon />
      </main>
    </div>
  )
}
