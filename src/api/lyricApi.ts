import { API_CONFIG } from '../config/apiConfig'
import type { LyricCacheEntry } from './types'

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

      // 最后一次重试也失败了就抛出
      if (attempt === options.retryCount) break

      // 重试前等待一小段时间
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
    // 检查是否过期
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
 * 搜索歌词
 * @returns LRC格式歌词文本，找不到时返回 null
 */
export async function searchLyric(
  artist: string,
  title: string
): Promise<string | null> {
  // 1. 优先读缓存
  const cached = getCache(artist, title)
  if (cached) return cached

  // 2. 调用API
  const params = new URLSearchParams({ artist, title })
  const url = `${API_CONFIG.baseUrl}/lyrics?${params.toString()}`

  try {
    const res = await fetchWithRetry(url, {
      timeout: API_CONFIG.timeout,
      retryCount: API_CONFIG.retryCount,
    })

    const text = await res.text()
    if (!text || text.trim().length === 0) return null

    // 3. 写入缓存
    setCache(artist, title, text)
    return text
  } catch (err) {
    console.warn('[歌词API] 获取失败:', err)
    return null
  }
}

/**
 * 获取歌曲封面URL
 * @returns 封面图片URL，找不到时返回 null
 */
export async function getCover(
  artist: string,
  title: string
): Promise<string | null> {
  const params = new URLSearchParams({ artist, title })
  const url = `${API_CONFIG.baseUrl}/cover?${params.toString()}`

  try {
    const res = await fetchWithRetry(url, {
      timeout: API_CONFIG.timeout,
      retryCount: 1,
    })

    const blob = await res.blob()
    if (blob.size === 0) return null

    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}
