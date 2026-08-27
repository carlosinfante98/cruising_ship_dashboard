import type { ReactElement } from 'react'
import { shipState } from '../lib/voyage'
import { clockInZone, longDate, shortDate } from '../lib/format'

export function NowReport({ now }: { now: Date }) {
  const state = shipState(now)

  let sentence: ReactElement
  let detail: string | undefined

  switch (state.kind) {
    case 'not-started':
      sentence = (
        <>
          The voyage begins <span className="text-brass">{shortDate(state.firstPort.date)}</span> —
          she boards in {state.firstPort.name}.
        </>
      )
      break
    case 'in-port':
      sentence = (
        <>
          She&rsquo;s in{' '}
          <span className={state.port.home ? 'text-home' : 'text-brass'}>
            {state.port.flag} {state.port.name}
          </span>{' '}
          today.
        </>
      )
      detail = `${state.port.region} · ship's local time ${clockInZone(now, state.port.tz)}`
      break
    case 'at-sea':
      sentence = (
        <>
          She&rsquo;s at sea — <span className="text-brass">{state.from.name}</span> to{' '}
          <span className="text-brass">{state.to.name}</span>, arriving{' '}
          {longDate(state.to.date)}.
        </>
      )
      detail = `${Math.round(state.progress * 100)}% of the way there`
      break
    case 'ended':
      sentence = (
        <>
          The entered schedule ends after {state.lastPort.name} — next leg&rsquo;s dates coming
          soon.
        </>
      )
      break
  }

  return (
    <section aria-label="Where she is now" className="py-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Right now</p>
      <h2 className="mt-3 font-display text-3xl leading-snug font-semibold sm:text-5xl">
        {sentence}
      </h2>
      {detail && <p className="mt-3 font-mono text-sm text-muted">{detail}</p>}
    </section>
  )
}
