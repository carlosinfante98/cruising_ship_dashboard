import { SECTIONS } from '../lib/sections'
import { ThemeToggle } from './ThemeToggle'

/**
 * The mobile answer to "keep the menu visible while scrolling": the full
 * side rail only sticks at `lg:` (there's room for it there), so on phones
 * this slim bar takes over — it sits in normal flow right after the hero
 * rail and docks to the top the moment scroll reaches it, staying docked
 * for the rest of the page.
 */
export function MobileNav({ active }: { active: string }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2xs border-b border-rule bg-paper px-2xs py-2xs lg:hidden">
      <nav aria-label="Sections" className="min-w-0 flex-1 overflow-x-auto">
        <ul className="flex gap-3xs">
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                className={`flex min-h-11 items-center border px-xs font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-150 active:bg-tile ${
                  active === s.id
                    ? 'border-brass text-brass'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeToggle compact />
    </div>
  )
}
