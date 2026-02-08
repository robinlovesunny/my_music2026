import { useCallback, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { searchLyric } from '../api/lyricApi'
import { parseLyric } from '../core/LyricParser'

/**
 * 歌词智能获取 Hook
 * - 切歌时自动调用API获取歌词（如果没有本地歌词）
 * - 支持手动刷新
 * - 防抖：快速切歌不会发出多余请求
 */
export function useLyricFetch() {
  const setLyric = usePlayerStore((s) => s.setLyric)
  const setLyricSource = usePlayerStore((s) => s.setLyricSource)
  const setLyricLoading = usePlayerStore((s) => s.setLyricLoading)

  // 用于取消上一次请求（防止快速切歌竞态）
  const fetchIdRef = useRef(0)

  /**
   * 从API获取歌词
   */
  const fetchLyricFromApi = useCallback(
    async (artist: string, title: string): Promise<boolean> => {
      if (!artist || !title || artist === '未知歌手') return false

      const currentId = ++fetchIdRef.current
      setLyricLoading(true)

      try {
        const lrcText = await searchLyric(artist, title)

        // 防竞态：如果已经有更新的请求，忽略本次结果
        if (currentId !== fetchIdRef.current) return false

        if (lrcText) {
          const parsed = parseLyric(lrcText)
          if (parsed.lines.length > 0) {
            setLyric(parsed)
            setLyricSource('api')
            return true
          }
        }

        // 没找到歌词
        setLyricSource(null)
        return false
      } catch {
        if (currentId === fetchIdRef.current) {
          setLyricSource(null)
        }
        return false
      } finally {
        if (currentId === fetchIdRef.current) {
          setLyricLoading(false)
        }
      }
    },
    [setLyric, setLyricSource, setLyricLoading]
  )

  /**
   * 自动获取歌词（仅在无本地歌词时调用API）
   */
  const autoFetchLyric = useCallback(
    async (artist: string, title: string) => {
      const state = usePlayerStore.getState()

      // 已有本地歌词则不获取
      if (state.lyric && state.lyricSource === 'local') return

      // 清空旧歌词
      setLyric(null)
      setLyricSource(null)

      await fetchLyricFromApi(artist, title)
    },
    [fetchLyricFromApi, setLyric, setLyricSource]
  )

  /**
   * 手动刷新歌词（强制从API重新获取）
   */
  const refreshLyric = useCallback(
    async (artist: string, title: string) => {
      setLyric(null)
      setLyricSource(null)
      await fetchLyricFromApi(artist, title)
    },
    [fetchLyricFromApi, setLyric, setLyricSource]
  )

  return { autoFetchLyric, refreshLyric, fetchLyricFromApi }
}
