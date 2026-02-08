import { usePlayerStore } from '../../store/playerStore'

export default function LyricMeta() {
  const lyric = usePlayerStore((s) => s.lyric)

  if (!lyric?.meta) return null

  const { lyricist, composer, arranger } = lyric.meta
  if (!lyricist && !composer && !arranger) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-dim px-3 py-2 border-b border-white/5">
      {lyricist && <span>词：{lyricist}</span>}
      {composer && <span>曲：{composer}</span>}
      {arranger && <span>编曲：{arranger}</span>}
    </div>
  )
}
