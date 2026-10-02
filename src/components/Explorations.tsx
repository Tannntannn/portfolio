import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LINKS, MORE_WORK } from '../data'

gsap.registerPlugin(ScrollTrigger)

export function Explorations() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const colA = useRef<HTMLDivElement>(null)
  const colB = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<(typeof MORE_WORK)[number] | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        pinSpacing: false,
      })
      gsap.to(colA.current, {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(colB.current, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const left = MORE_WORK.filter((_, i) => i % 2 === 0)
  const right = MORE_WORK.filter((_, i) => i % 2 === 1)

  return (
    <section id="explorations" ref={sectionRef} className="relative min-h-[300vh] bg-bg">
      <div ref={pinRef} className="z-10 flex h-screen items-center justify-center px-6 text-center">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">Explorations</p>
          <h2 className="mb-4 text-4xl md:text-6xl">
            Visual <span className="font-display italic">playground</span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-muted md:text-base">
            Screens from the products I shipped. Click one to open it.
          </p>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-stroke px-5 py-2.5 text-sm text-text-primary"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-2 gap-6 px-4 pt-[18vh] md:gap-24 md:px-10">
          <div ref={colA} className="flex flex-col gap-8 md:gap-16">
            {left.map((item, i) => (
              <Shot key={item.title} item={item} rotate={i % 2 ? -4 : 3} onOpen={() => setActive(item)} />
            ))}
          </div>
          <div ref={colB} className="mt-24 flex flex-col gap-8 md:mt-40 md:gap-16">
            {right.map((item, i) => (
              <Shot key={item.title} item={item} rotate={i % 2 ? 5 : -3} onOpen={() => setActive(item)} />
            ))}
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setActive(null)} aria-label="Close" />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-stroke bg-surface">
            <img src={active.img} alt={active.title} className="max-h-[70vh] w-full object-cover" />
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-display text-2xl italic">{active.title}</p>
                <p className="text-sm text-muted">{active.blurb}</p>
              </div>
              <a href={active.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-text-primary">
                Open ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Shot({
  item,
  rotate,
  onOpen,
}: {
  item: (typeof MORE_WORK)[number]
  rotate: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pointer-events-auto mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-stroke"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
    </button>
  )
}
