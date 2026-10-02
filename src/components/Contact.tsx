import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { HlsVideo } from './HlsVideo'
import { LINKS, SOCIALS } from '../data'

export function Contact() {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !track.current) return
    const tween = gsap.to(track.current, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    })
    return () => {
      tween.kill()
    }
  }, [])

  const phrase = 'Change it & design • '
  const row = phrase.repeat(10)

  return (
    <footer id="contact" className="relative overflow-hidden bg-bg pb-8 pt-16 md:pb-12 md:pt-20">
      <HlsVideo flip className="opacity-80" />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">
        <div className="mb-16 overflow-hidden border-y border-white/10 py-4">
          <div ref={track} className="flex w-max whitespace-nowrap font-display text-5xl italic text-text-primary/90 md:text-7xl">
            <span>{row}</span>
            <span>{row}</span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">Contact</p>
          <h2 className="mb-8 font-display text-5xl italic leading-none md:text-7xl">Let&apos;s build it.</h2>
          <a href={LINKS.email} className="group relative inline-flex rounded-full">
            <span className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative rounded-full border border-stroke bg-surface px-7 py-3.5 text-sm text-text-primary">
              devillamarktristan@gmail.com
            </span>
          </a>
          <p className="mt-4 text-sm text-muted">+63 995 509 5686</p>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1200px] flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center md:px-10">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {SOCIALS.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-text-primary">
                {item.label}
              </a>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Available for projects
          </p>
        </div>
      </div>
    </footer>
  )
}
