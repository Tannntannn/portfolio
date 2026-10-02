import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Contact } from './components/Contact'
import { Explorations } from './components/Explorations'
import { Hero } from './components/Hero'
import { Journal } from './components/Journal'
import { LoadingScreen } from './components/LoadingScreen'
import { Navbar } from './components/Navbar'
import { Stats } from './components/Stats'
import { Works } from './components/Works'

function Page() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Navbar />
      <Hero />
      <Works />
      <Journal />
      <Explorations />
      <Stats />
      <Contact />
    </motion.main>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const finish = useCallback(() => setLoading(false), [])

  return (
    <>
      {loading && <LoadingScreen onComplete={finish} />}
      {!loading && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="*" element={<Page />} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  )
}
