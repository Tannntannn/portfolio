import { motion } from 'framer-motion'
import { PROJECTS } from '../data'

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export function Works() {
  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <motion.div
          className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
              <span className="h-px w-8 bg-stroke" />
              Selected work
            </p>
            <h2 className="mb-3 text-4xl tracking-tight text-text-primary md:text-6xl">
              Featured <span className="font-display italic">projects</span>
            </h2>
            <p className="max-w-md text-sm text-muted md:text-base">
              A selection of products I shipped, from campus tools to studio and gym systems.
            </p>
          </div>
          <a
            href="#explorations"
            className="group relative hidden rounded-full md:inline-flex"
          >
            <span className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative rounded-full border border-stroke bg-bg px-5 py-2.5 text-sm text-text-primary">
              View all work →
            </span>
          </a>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-3xl border border-stroke bg-surface ${project.span} aspect-[4/3] md:aspect-auto md:min-h-[340px]`}
            >
              <img
                src={project.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                }}
              />
              <span className="absolute inset-0 bg-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="relative rounded-full">
                  <span className="accent-gradient-animated absolute -inset-[2px] rounded-full" />
                  <span className="relative block rounded-full bg-white px-5 py-2 text-sm text-black">
                    View — <span className="font-display italic">{project.title}</span>
                  </span>
                </span>
              </span>
              <span className="absolute bottom-4 left-4 right-4 text-left md:hidden">
                <span className="block text-sm text-white">{project.title}</span>
                <span className="text-xs text-white/70">{project.year}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
