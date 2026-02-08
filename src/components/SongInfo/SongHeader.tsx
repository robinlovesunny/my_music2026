import { usePlayerStore } from '../../store/playerStore'

export default function SongHeader() {
  const currentSong = usePlayerStore((s) => s.currentSong)

  if (!currentSong) {
    return (
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-text-muted">未选择歌曲</h2>
        <p className="text-sm text-text-dim mt-1">导入音乐文件开始播放</p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-text-primary truncate">{currentSong.title}</h2>
      <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
        <span>{currentSong.artist}</span>
        <span className="text-text-dim">·</span>
        <span>{currentSong.album}</span>
        <span
          className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary/15 text-primary"
        >
          {currentSong.source === 'local' ? '本地' : 'API'}
        </span>
      </div>
    </div>
  )
}
