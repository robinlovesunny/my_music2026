import { useEffect } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useLyricSync } from '../../hooks/useLyricSync'
import { useLyricFetch } from '../../hooks/useLyricFetch'
import { RefreshCw, Loader2 } from 'lucide-react'

export default function LyricDisplay() {
  const lyric = usePlayerStore((s) => s.lyric)
  const lyricLoading = usePlayerStore((s) => s.lyricLoading)
  const lyricSource = usePlayerStore((s) => s.lyricSource)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const { currentLineIndex, containerRef } = useLyricSync()
  const { autoFetchLyric, refreshLyric } = useLyricFetch()

  // 切歌时自动获取歌词
  useEffect(() => {
    if (currentSong) {
      autoFetchLyric(currentSong.artist, currentSong.title)
    }
  }, [currentSong?.id])

  // 加载中
  if (lyricLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-dim text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>歌词获取中...</span>
      </div>
    )
  }

  // 无歌词
  if (!lyric || lyric.lines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-dim text-sm">
        <span>暂无歌词</span>
        {currentSong && currentSong.artist !== '未知歌手' && (
          <button
            onClick={() => refreshLyric(currentSong.artist, currentSong.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
              bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新获取
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 歌词来源标识 + 刷新按钮 */}
      {lyricSource === 'api' && currentSong && (
        <div className="flex items-center justify-end px-3 py-1 text-xs text-text-dim gap-2">
          <span>在线歌词</span>
          <button
            onClick={() => refreshLyric(currentSong.artist, currentSong.title)}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="刷新歌词"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-8 px-2 scroll-smooth"
        style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}
      >
      {lyric.lines.map((line, i) => (
        <div
          key={i}
          className={`lyric-line py-2 px-3 rounded-lg cursor-pointer ${
            i === currentLineIndex
              ? 'text-primary text-lg font-semibold opacity-100'
              : 'text-text-muted text-sm opacity-50 hover:opacity-70'
          }`}
          onClick={() => {
            import('../../core/AudioEngine').then(({ audioEngine }) => {
              audioEngine.seek(line.time)
            })
            usePlayerStore.getState().setCurrentTime(line.time)
          }}
        >
          <div>{line.text}</div>
          {line.translation && (
            <div className={`mt-0.5 ${
              i === currentLineIndex ? 'text-primary/70 text-sm' : 'text-text-dim text-xs'
            }`}>
              {line.translation}
            </div>
          )}
        </div>
      ))}
      <div className="h-40" />
      </div>
    </div>
  )
}
