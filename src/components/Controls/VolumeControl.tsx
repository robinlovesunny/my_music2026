import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { useCallback, useRef } from 'react'

export default function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume)
  const isMuted = usePlayerStore((s) => s.isMuted)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const setIsMuted = usePlayerStore((s) => s.setIsMuted)
  const barRef = useRef<HTMLDivElement>(null)

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  const handleVolumeChange = useCallback((clientX: number) => {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setVolume(ratio)
    if (ratio > 0 && isMuted) setIsMuted(false)
  }, [setVolume, isMuted, setIsMuted])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleVolumeChange(e.clientX)
    const onMove = (e: MouseEvent) => handleVolumeChange(e.clientX)
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [handleVolumeChange])

  return (
    <div className="flex items-center gap-2 group/vol">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        aria-label={isMuted ? '取消静音' : '静音'}
      >
        <VolumeIcon size={18} />
      </button>
      <div
        ref={barRef}
        className="w-20 h-1 bg-white/10 rounded-full cursor-pointer relative"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity"
          style={{ left: `${(isMuted ? 0 : volume) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>
    </div>
  )
}
