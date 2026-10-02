import { useEffect, useState } from 'react'
import { CV_URL } from '../data'

const LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Work', href: '#work' },
  { label: 'Resume', href: CV_URL, external: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100)
      const work = document.getElementById('work')
      if (work && window.scrollY + 120 >= work.offsetTop) setActive('Work')
      else setActive('Home')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <nav
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md ${scrolled ? 'shadow-md shadow-black/10' : ''}`}
      >
        <a href="#hero" className="group relative grid h-9 w-9 place-items-center" aria-label="Home">
          <span className="accent-gradient absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:[background-image:linear-gradient(270deg,#89AACC,#4E85BF)]" />
          <span className="relative grid h-[30px] w-[30px] place-items-center rounded-full bg-bg font-display text-[13px] italic">
            MT
          </span>
        </a>
        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${
              active === link.label
                ? 'bg-stroke/50 text-text-primary'
                : 'text-muted hover:bg-stroke/50 hover:text-text-primary'
            }`}
          >
            {link.label}
          </a>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />
        <a href="#contact" className="group relative rounded-full">
          <span className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative block rounded-full bg-surface px-3 py-1.5 text-xs text-text-primary backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
            Say hi ↗
          </span>
        </a>
      </nav>
    </header>
  )
}
