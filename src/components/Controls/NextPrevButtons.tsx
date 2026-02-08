import { SkipBack, SkipForward } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

interface Props {
  leftOnly?: boolean
  rightOnly?: boolean
}

export default function NextPrevButtons({ leftOnly, rightOnly }: Props) {
  const { prevSong, nextSong } = useAudioPlayer()

  if (leftOnly) {
    return (
      <button
        onClick={prevSong}
        className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
        aria-label="上一首"
      >
        <SkipBack size={18} fill="currentColor" />
      </button>
    )
  }

  if (rightOnly) {
    return (
      <button
        onClick={nextSong}
        className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
        aria-label="下一首"
      >
        <SkipForward size={18} fill="currentColor" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prevSong}
        className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
        aria-label="上一首"
      >
        <SkipBack size={18} fill="currentColor" />
      </button>
      <button
        onClick={nextSong}
        className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
        aria-label="下一首"
      >
        <SkipForward size={18} fill="currentColor" />
      </button>
    </div>
  )
}
