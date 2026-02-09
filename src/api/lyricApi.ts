import { API_CONFIG } from '../config/apiConfig'
import type { LyricCacheEntry } from './types'

/** lrclib.net 搜索结果条目 */
interface LrclibResult {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  syncedLyrics: string | null
  plainLyrics: string | null
}

/**
 * 带超时和重试的 fetch 封装
 */
async function fetchWithRetry(
  url: string,
  options: { timeout: number; retryCount: number }
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= options.retryCount; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), options.timeout)

    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      return res
    } catch (err) {
      clearTimeout(timer)
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt === options.retryCount) break

      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }

  throw lastError ?? new Error('请求失败')
}

// ========== 缓存工具 ==========

function getCacheKey(artist: string, title: string): string {
  return `${API_CONFIG.cachePrefix}${artist}_${title}`
}

function getCache(artist: string, title: string): string | null {
  try {
    const raw = localStorage.getItem(getCacheKey(artist, title))
    if (!raw) return null

    const entry: LyricCacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > API_CONFIG.cacheExpiry) {
      localStorage.removeItem(getCacheKey(artist, title))
      return null
    }
    return entry.lrcText
  } catch {
    return null
  }
}

function setCache(artist: string, title: string, lrcText: string): void {
  try {
    const entry: LyricCacheEntry = { lrcText, timestamp: Date.now() }
    localStorage.setItem(getCacheKey(artist, title), JSON.stringify(entry))
  } catch {
    // localStorage 满了或不可用，静默忽略
  }
}

// ========== 对外接口 ==========

/**
 * 搜索歌词（使用 lrclib.net）
 * @returns LRC格式歌词文本，找不到时返回 null
 */
export async function searchLyric(
  artist: string,
  title: string
): Promise<string | null> {
  const cached = getCache(artist, title)
  if (cached) return cached

  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  })
  const url = `${API_CONFIG.baseUrl}/search?${params.toString()}`

  try {
    const res = await fetchWithRetry(url, {
      timeout: API_CONFIG.timeout,
      retryCount: API_CONFIG.retryCount,
    })

    const results: LrclibResult[] = await res.json()
    if (!results || results.length === 0) return null

    // 优先取带时间戳的歌词，其次纯文本
    const withSync = results.find((r) => r.syncedLyrics)
    const lrcText = withSync?.syncedLyrics ?? results[0]?.plainLyrics
    if (!lrcText) return null

    setCache(artist, title, lrcText)
    return lrcText
  } catch (err) {
    console.warn('[歌词API] 获取失败:', err)
    return null
  }
}

/**
 * 获取歌曲封面URL
 * lrclib.net 不提供封面，当前返回 null
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCover(_artist: string, _title: string): Promise<string | null> {
  return null
}
