import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const WORDS = ['Design', 'Build', 'Ship']

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [word, setWord] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 2700
    let frame = 0

    const tick = (now: number) => {
      const next = Math.min(100, Math.round(((now - start) / duration) * 100))
      setCount(next)
      if (next < 100) frame = requestAnimationFrame(tick)
      else window.setTimeout(onComplete, 400)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onComplete])

  useEffect(() => {
    const id = window.setInterval(() => setWord((w) => (w + 1) % WORDS.length), 900)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] bg-bg">
      <motion.p
        className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Portfolio
      </motion.p>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={WORDS[word]}
            className="font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {WORDS[word]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="absolute bottom-16 right-6 font-display text-6xl tabular-nums text-text-primary md:bottom-20 md:right-10 md:text-8xl lg:text-9xl">
        {String(count).padStart(3, '0')}
      </p>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
        <div
          className="accent-gradient h-full origin-left"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
        />
      </div>
    </div>
  )
}
