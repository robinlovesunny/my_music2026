import { BookOpen } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function WikiTab() {
  const currentSong = usePlayerStore((s) => s.currentSong)

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-dim p-8">
      <BookOpen size={40} className="mb-3 opacity-40" />
      <p className="text-sm mb-1">百科信息</p>
      {currentSong ? (
        <p className="text-xs text-center">
          关于 <span className="text-text-muted">{currentSong.artist}</span> 的百科信息将在后续版本中提供
        </p>
      ) : (
        <p className="text-xs">请先选择一首歌曲</p>
      )}
    </div>
  )
}
