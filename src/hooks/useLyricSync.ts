import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { findCurrentLine } from '../core/LyricParser'

export function useLyricSync() {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const lyric = usePlayerStore((s) => s.lyric)
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lyric || lyric.lines.length === 0) {
      setCurrentLineIndex(-1)
      return
    }
    const idx = findCurrentLine(lyric.lines, currentTime)
    setCurrentLineIndex(idx)
  }, [currentTime, lyric])

  useEffect(() => {
    if (currentLineIndex < 0 || !containerRef.current) return
    const container = containerRef.current
    const lineEl = container.children[currentLineIndex] as HTMLElement
    if (!lineEl) return

    const containerHeight = container.clientHeight
    const targetScroll = lineEl.offsetTop - containerHeight / 3
    container.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }, [currentLineIndex])

  return { currentLineIndex, containerRef }
}
