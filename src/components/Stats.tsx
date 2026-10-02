import { motion } from 'framer-motion'
import { STATS } from '../data'

export function Stats() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 md:grid-cols-3 md:px-10 lg:px-16">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="border-t border-stroke pt-6"
          >
            <p className="font-display text-6xl italic text-text-primary md:text-7xl">{stat.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
