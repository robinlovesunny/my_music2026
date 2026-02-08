import { Play, Pause } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

export default function PlayButton() {
  const { isPlaying, togglePlay } = useAudioPlayer()

  return (
    <button
      onClick={togglePlay}
      className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-bg-main hover:bg-primary-dark transition-colors hover:scale-105 active:scale-95"
      aria-label={isPlaying ? '暂停' : '播放'}
    >
      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
    </button>
  )
}
