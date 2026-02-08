import { usePlayerStore } from '../../store/playerStore'
import { formatTime } from '../../utils/timeFormat'
import { useCallback, useRef, useState } from 'react'

export default function ProgressBar() {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const barRef = useRef<HTMLDivElement>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const seek = useCallback((clientX: number) => {
    if (!barRef.current || duration <= 0) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const time = ratio * duration

    // 直接操作引擎
    import('../../core/AudioEngine').then(({ audioEngine }) => {
      audioEngine.seek(time)
    })
    usePlayerStore.getState().setCurrentTime(time)
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    seek(e.clientX)

    const handleMouseMove = (e: MouseEvent) => seek(e.clientX)
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [seek])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!barRef.current || duration <= 0) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverTime(ratio * duration)
    setHoverX(e.clientX - rect.left)
  }, [duration])

  return (
    <div className="flex items-center gap-3 w-full px-4">
      <span className="text-xs text-text-muted w-10 text-right font-mono">{formatTime(currentTime)}</span>
      <div
        ref={barRef}
        className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* 已播放进度 */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        {/* 拖拽点 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_6px_rgba(0,255,136,0.5)]"
          style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
        {/* hover 时间气泡 */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 bg-bg-secondary text-xs px-2 py-1 rounded text-text-primary pointer-events-none"
            style={{ left: `${hoverX}px`, transform: 'translateX(-50%)' }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
        {/* hover 扩展高度 */}
        <div className="absolute inset-0 -top-1 -bottom-1 group-hover:bg-white/5 rounded-full" />
      </div>
      <span className="text-xs text-text-muted w-10 font-mono">{formatTime(duration)}</span>
    </div>
  )
}
