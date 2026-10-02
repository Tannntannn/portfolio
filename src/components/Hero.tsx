import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { HlsVideo } from './HlsVideo'

const ROLES = ['Developer', 'Full-stack', 'Designer', 'Builder']

export function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.name-reveal', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1 })
    tl.fromTo(
      '.blur-in',
      { opacity: 0, filter: 'blur(10px)', y: 20 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1, delay: 0.3 },
      0,
    )
    return () => {
      tl.kill()
    }
  }, [])

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <HlsVideo />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-muted">Collection &apos;26</p>
        <h1 className="name-reveal mb-6 font-display text-6xl italic leading-[0.9] tracking-tight text-text-primary md:text-8xl lg:text-9xl">
          Mark Tristan
        </h1>
        <p className="blur-in mb-4 text-lg text-text-primary/90 md:text-xl">
          A{' '}
          <span key={roleIndex} className="inline-block animate-role-fade-in font-display italic text-text-primary">
            {ROLES[roleIndex]}
          </span>{' '}
          based in Sariaya.
        </p>
        <p className="blur-in mx-auto mb-12 max-w-md text-sm text-muted md:text-base">
          I build modern web systems, Android apps, and WordPress sites — and I turn rough ideas into clean, working products.
        </p>
        <div className="blur-in inline-flex flex-wrap justify-center gap-4">
          <a href="#work" className="group relative inline-flex transition-transform hover:scale-105">
            <span className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100" />
            <span className="relative rounded-full bg-text-primary px-7 py-3.5 text-sm text-bg group-hover:bg-bg group-hover:text-text-primary">
              See works
            </span>
          </a>
          <a href="#contact" className="group relative inline-flex transition-transform hover:scale-105">
            <span className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100" />
            <span className="relative rounded-full border-2 border-stroke bg-bg px-7 py-3.5 text-sm text-text-primary group-hover:border-transparent">
              Reach out...
            </span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-stroke">
          <span className="animate-scroll-down absolute inset-x-0 top-0 h-3 accent-gradient" />
        </span>
      </div>
    </section>
  )
}
