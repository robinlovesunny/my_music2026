import { X, Music } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { usePlaylistStore } from '../../store/playlistStore'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

export default function PlaylistDrawer() {
  const showPlaylist = usePlayerStore((s) => s.showPlaylist)
  const setShowPlaylist = usePlayerStore((s) => s.setShowPlaylist)
  const playlist = usePlaylistStore((s) => s.playlist)
  const removeSong = usePlaylistStore((s) => s.removeSong)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const { playSongAtIndex } = useAudioPlayer()

  if (!showPlaylist) return null

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* 遮罩 */}
      <div className="flex-1" onClick={() => setShowPlaylist(false)} />
      {/* 抽屉 */}
      <div className="w-80 h-full bg-bg-secondary/95 backdrop-blur-xl border-l border-white/5 flex flex-col animate-in slide-in-from-right">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold">播放列表 ({playlist.length})</h3>
          <button
            onClick={() => setShowPlaylist(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-text-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-dim text-sm gap-2">
              <Music size={32} />
              <span>播放列表为空</span>
            </div>
          ) : (
            playlist.map((song, i) => (
              <div
                key={song.id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors group ${
                  i === currentIndex
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-white/5 text-text-secondary'
                }`}
                onClick={() => playSongAtIndex(i)}
              >
                <span className="text-xs w-5 text-center text-text-dim">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{song.title}</div>
                  <div className="text-xs text-text-dim truncate">{song.artist}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeSong(song.id) }}
                  className="w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 text-text-dim hover:text-text-primary transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
