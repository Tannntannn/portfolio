import { motion } from 'framer-motion'
import { useState } from 'react'
import certificate from '../../assets/certificate.png'
import pdf from '../../assets/ojt-certificate.pdf'
import { NOTES } from '../data'

export function Journal() {
  const [open, setOpen] = useState(false)

  return (
    <section id="experience" className="bg-bg py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
            <span className="h-px w-8 bg-stroke" />
            Experience
          </p>
          <h2 className="mb-3 text-4xl tracking-tight md:text-6xl">
            Recent <span className="font-display italic">work</span>
          </h2>
          <p className="max-w-md text-sm text-muted md:text-base">
            Internship, shipped products, and the certificate from Taaeen.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {NOTES.map((note) => {
            const intern = note.title.startsWith('Web Developer')
            const className =
              'flex items-center gap-4 rounded-[40px] border border-stroke bg-surface/30 p-4 transition-colors hover:bg-surface sm:gap-6 sm:rounded-full'
            const inner = (
              <>
                <img src={note.img} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-text-primary sm:text-base">{note.title}</span>
                  <span className="block truncate text-xs text-muted sm:text-sm">{note.detail}</span>
                </span>
                <span className="hidden shrink-0 text-xs uppercase tracking-[0.14em] text-muted sm:block">{note.meta}</span>
              </>
            )
            if (intern) {
              return (
                <button key={note.title} type="button" className={`${className} text-left`} onClick={() => setOpen(true)}>
                  {inner}
                </button>
              )
            }
            return (
              <a key={note.title} href={note.href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
              </a>
            )
          })}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="OJT certificate">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-stroke bg-bg">
            <div className="flex items-center justify-between border-b border-stroke px-5 py-4">
              <p className="font-display text-xl italic">OJT certificate</p>
              <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <img src={certificate} alt="OJT completion certificate for Mark Tristan Perjes De Villa" className="max-h-[70vh] w-full object-contain" />
            <div className="border-t border-stroke px-5 py-3 text-right">
              <a href={pdf} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.14em] text-text-primary">
                Open PDF ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
