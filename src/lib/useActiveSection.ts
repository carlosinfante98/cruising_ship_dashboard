import { useEffect, useState } from 'react'

/**
 * Which of the given section ids currently owns the viewport, via
 * IntersectionObserver. Drives the "you are here" highlight in both nav bars.
 * `ids` should be a stable (module-level) array — a fresh literal on every
 * render would tear the observer down and rebuild it every render.
 */
export function useActiveSection(ids: string[], rootMargin = '-15% 0px -70% 0px'): string {
  const [active, setActive] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Several sections can be visible at once — the one nearest the top
        // of the viewport is the one reading as "current".
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        )
        setActive(top.target.id)
      },
      { rootMargin, threshold: 0 },
    )
    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [ids, rootMargin])

  return active
}
