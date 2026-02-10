import { getDecodedApiKey, useSettingsStore } from '../store/settingsStore'

/** AI解读缓存 */
interface InsightCache {
  content: string
  timestamp: number
}

const CACHE_PREFIX = 'ai_insight_'
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7天

function getCacheKey(artist: string, title: string): string {
  return `${CACHE_PREFIX}${artist}_${title}`
}

function getInsightCache(artist: string, title: string): string | null {
  try {
    const raw = localStorage.getItem(getCacheKey(artist, title))
    if (!raw) return null
    const entry: InsightCache = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(getCacheKey(artist, title))
      return null
    }
    return entry.content
  } catch {
    return null
  }
}

function setInsightCache(artist: string, title: string, content: string): void {
  try {
    const entry: InsightCache = { content, timestamp: Date.now() }
    localStorage.setItem(getCacheKey(artist, title), JSON.stringify(entry))
  } catch {
    // 静默忽略
  }
}

/**
 * 调用通义千问API获取歌曲背景介绍
 * 支持流式输出回调
 */
export async function getSongBackground(
  artist: string,
  title: string,
  options?: {
    forceRefresh?: boolean
    onStream?: (text: string) => void
  }
): Promise<string> {
  // 检查缓存
  if (!options?.forceRefresh) {
    const cached = getInsightCache(artist, title)
    if (cached) {
      // 模拟打字机效果
      if (options?.onStream) {
        let i = 0
        const interval = setInterval(() => {
          i += 3
          options.onStream!(cached.slice(0, i))
          if (i >= cached.length) clearInterval(interval)
        }, 10)
        await new Promise(resolve => setTimeout(resolve, cached.length / 3 * 10 + 100))
      }
      return cached
    }
  }

  // 检查API Key
  const apiKey = getDecodedApiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  // 检查每日调用限制
  const canCall = useSettingsStore.getState().incrementCallCount()
  if (!canCall) {
    throw new Error('DAILY_LIMIT')
  }

  const prompt = `请简要介绍歌曲《${title}》（${artist}演唱）的创作背景和故事，包括创作时间、创作灵感、歌曲意义，以及是否曾被经典影视作品引用。要求：文字优美、简洁，200-300字以内，适合音乐爱好者阅读。不要使用markdown格式。`

  try {
    const response = await fetch(
      '/api/dashscope/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一位资深的音乐评论家和文化研究者，擅长用优美的文字介绍音乐作品的创作背景。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: true,
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[通义千问API] 响应错误:', errText)
      throw new Error(`API_ERROR_${response.status}`)
    }

    // 流式读取
    const reader = response.body?.getReader()
    if (!reader) throw new Error('STREAM_ERROR')

    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

      for (const line of lines) {
        const data = line.replace('data: ', '').trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullContent += delta
            options?.onStream?.(fullContent)
          }
        } catch {
          // 跳过解析错误
        }
      }
    }

    if (fullContent) {
      setInsightCache(artist, title, fullContent)
    }

    return fullContent || '暂无解读内容'
  } catch (err) {
    if (err instanceof Error && (err.message.startsWith('API_ERROR') || err.message === 'NO_API_KEY' || err.message === 'DAILY_LIMIT')) {
      throw err
    }
    console.error('[通义千问API] 请求失败:', err)
    throw new Error('NETWORK_ERROR')
  }
}

/** 清除指定歌曲的AI解读缓存 */
export function clearInsightCache(artist: string, title: string): void {
  localStorage.removeItem(getCacheKey(artist, title))
}
