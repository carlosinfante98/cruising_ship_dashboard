import type { ReactElement } from 'react'
import { shipState } from '../lib/voyage'
import { clockInZone, longDate, shortDate } from '../lib/format'

const HOME_TZ = 'America/New_York'

/** The one sentence that answers "where is she", plus the two clocks that matter. */
export function NowReport({ now }: { now: Date }) {
  const state = shipState(now)

  let sentence: ReactElement
  let sub: string | undefined
  let herTz: string | undefined

  switch (state.kind) {
    case 'not-started':
      sentence = (
        <>
          She boards in {state.firstPort.name} on{' '}
          <span className="text-brass">{shortDate(state.firstPort.date)}</span>.
        </>
      )
      herTz = state.firstPort.tz
      break
    case 'in-port':
      sentence = (
        <>
          She&rsquo;s in{' '}
          <span className={state.port.home ? 'text-home' : 'text-brass'}>{state.port.name}</span>{' '}
          today.
        </>
      )
      sub = `${state.port.flag} ${state.port.region}`
      herTz = state.port.tz
      break
    case 'at-sea':
      sentence = (
        <>
          She&rsquo;s at sea, bound for{' '}
          <span className="text-brass">{state.to.name}</span>.
        </>
      )
      sub = `Departed ${state.from.name} · arrives ${longDate(state.to.date)} · ${Math.round(
        state.progress * 100,
      )}% across`
      herTz = state.to.tz
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

      {herTz && (
        <div className="flex gap-lg border-t border-rule pt-sm lg:border-t-0 lg:pt-0">
          <Clock label="Her time" tz={herTz} now={now} tone="text-brass" />
          <Clock label="Your time" tz={HOME_TZ} now={now} tone="text-home" />
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
