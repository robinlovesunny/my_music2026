/** 歌词API配置 */
export const API_CONFIG = {
  /** API基础路径（开发环境通过Vite代理转发） */
  baseUrl: '/lrcapi',

  /** 歌词源列表，按优先级排序 */
  lyricSources: [
    { name: 'LrcApi', baseUrl: '/lrcapi', enabled: true },
  ],

  /** 请求超时时间（毫秒） */
  timeout: 5000,

  /** 失败重试次数 */
  retryCount: 2,

  /** 缓存键前缀 */
  cachePrefix: 'lyric_cache_',

  /** 缓存过期时间（毫秒），默认7天 */
  cacheExpiry: 7 * 24 * 60 * 60 * 1000,
}
