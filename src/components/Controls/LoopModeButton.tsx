import { Repeat, Repeat1, Shuffle } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

const modeConfig = {
  list: { icon: Repeat, label: '列表循环' },
  single: { icon: Repeat1, label: '单曲循环' },
  random: { icon: Shuffle, label: '随机播放' },
} as const

export default function LoopModeButton() {
  const loopMode = usePlayerStore((s) => s.loopMode)
  const cycleLoopMode = usePlayerStore((s) => s.cycleLoopMode)

  const { icon: Icon, label } = modeConfig[loopMode]

  return (
    <button
      onClick={cycleLoopMode}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-90 ${
        loopMode !== 'list' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
      }`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  )
}
