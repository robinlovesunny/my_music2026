import { Disc3 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function RecommendTab() {
  const currentSong = usePlayerStore((s) => s.currentSong)

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-dim p-8">
      <Disc3 size={40} className="mb-3 opacity-40" />
      <p className="text-sm mb-1">相似推荐</p>
      {currentSong ? (
        <p className="text-xs text-center">
          与 <span className="text-text-muted">{currentSong.title}</span> 相似的歌曲推荐将在后续版本中提供
        </p>
      ) : (
        <p className="text-xs">请先选择一首歌曲</p>
      )}
    </div>
  )
}
