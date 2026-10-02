import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { HLS_SRC } from '../data'

type Props = {
  className?: string
  flip?: boolean
}

export function HlsVideo({ className = '', flip = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hls.loadSource(HLS_SRC)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_SRC
    }
  }, [])

  return (
    <video
      ref={ref}
      className={`absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${flip ? 'scale-y-[-1]' : ''} ${className}`}
      autoPlay
      muted
      loop
      playsInline
    />
  )
}
