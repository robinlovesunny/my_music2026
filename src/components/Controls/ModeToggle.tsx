import { Maximize2, Minimize2 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function ModeToggle() {
  const playerMode = usePlayerStore((s) => s.playerMode)
  const setPlayerMode = usePlayerStore((s) => s.setPlayerMode)

  const toggleMode = () => {
    setPlayerMode(playerMode === 'fullscreen' ? 'mini' : 'fullscreen')
  }

  return (
    <button
      onClick={toggleMode}
      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary transition-colors rounded-full hover:bg-white/10"
      aria-label={playerMode === 'fullscreen' ? '切换迷你模式' : '切换全屏模式'}
      title={playerMode === 'fullscreen' ? '迷你模式' : '全屏模式'}
    >
      {playerMode === 'fullscreen' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  )
}
