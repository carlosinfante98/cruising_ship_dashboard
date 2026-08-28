import type { ReactElement } from 'react'
import { shipState } from '../lib/voyage'
import { clockInZone, longDate, shortDate } from '../lib/format'

const CARLOS_TZ = 'America/New_York'

/** The one sentence that answers "where is the ship", plus the two clocks that matter. */
export function NowReport({ now }: { now: Date }) {
  const state = shipState(now)

  let sentence: ReactElement
  let sub: string | undefined
  let shipTz: string | undefined

  switch (state.kind) {
    case 'not-started':
      sentence = (
        <>
          Voyage begins in {state.firstPort.name} on{' '}
          <span className="text-brass">{shortDate(state.firstPort.date)}</span>.
        </>
      )
      shipTz = state.firstPort.tz
      break
    case 'in-port':
      sentence = (
        <>
          Docked in{' '}
          <span className={state.port.carlos ? 'text-carlos' : 'text-brass'}>{state.port.name}</span>{' '}
          today.
        </>
      )
      sub = `${state.port.flag} ${state.port.region}`
      shipTz = state.port.tz
      break
    case 'at-sea':
      sentence = (
        <>
          At sea, bound for{' '}
          <span className="text-brass">{state.to.name}</span>.
        </>
      )
      sub = `Departed ${state.from.name} · arrives ${longDate(state.to.date)} · ${Math.round(
        state.progress * 100,
      )}% across`
      shipTz = state.to.tz
      break
    case 'ended':
      sentence = <>The entered schedule ends after {state.lastPort.name}.</>
      sub = 'Next leg’s dates to come.'
      break
  }

  return (
    <div className="grid items-end gap-md border-b border-rule px-md py-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-xl">
      <div>
        <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl xl:text-6xl">
          {sentence}
        </h1>
        {sub && <p className="mt-sm max-w-[60ch] text-sm text-muted sm:text-base">{sub}</p>}
      </div>

      {shipTz && (
        <div className="flex gap-lg border-t border-rule pt-sm lg:border-t-0 lg:pt-0">
          <Clock label="Ship time" tz={shipTz} now={now} tone="text-brass" />
          <Clock label="Carlos" tz={CARLOS_TZ} now={now} tone="text-carlos" />
        </div>
      )}
    </div>
  )
}

function Clock({
  label,
  tz,
  now,
  tone,
}: {
  label: string
  tz: string
  now: Date
  tone: string
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className={`tnum mt-3xs font-display text-3xl leading-none font-semibold ${tone}`}>
        {clockInZone(now, tz)}
      </p>
      <p className="mt-3xs font-mono text-[10px] text-muted">{tz.split('/')[1]?.replace('_', ' ')}</p>
    </div>
  )
}
