/** 歌词API响应类型 */
export interface LyricApiResponse {
  /** LRC格式的歌词文本 */
  lyrics: string
}

/** 封面API响应类型 */
export interface CoverApiResponse {
  /** 封面图片URL */
  url: string
}

/** 歌词获取状态 */
export type LyricFetchStatus = 'idle' | 'loading' | 'success' | 'error'

/** 歌词来源 */
export type LyricSource = 'local' | 'api' | null

/** 缓存条目 */
export interface LyricCacheEntry {
  /** LRC歌词原文 */
  lrcText: string
  /** 缓存时间戳 */
  timestamp: number
}
