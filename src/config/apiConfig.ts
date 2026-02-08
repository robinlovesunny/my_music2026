/** 歌词API配置 */
export const API_CONFIG = {
  /** API基础路径（lrclib.net 支持CORS，浏览器可直连） */
  baseUrl: 'https://lrclib.net/api',

  /** 请求超时时间（毫秒） */
  timeout: 8000,

  /** 失败重试次数 */
  retryCount: 2,

  /** 缓存键前缀 */
  cachePrefix: 'lyric_cache_',

  /** 缓存过期时间（毫秒），默认7天 */
  cacheExpiry: 7 * 24 * 60 * 60 * 1000,
}
