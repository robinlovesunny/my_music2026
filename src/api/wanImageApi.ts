import { getDecodedApiKey, useSettingsStore } from '../store/settingsStore'

/** 同步调用 API 地址（走 Vite 代理） */
const API_URL =
  '/api/dashscope/api/v1/services/aigc/multimodal-generation/generation'

/**
 * 使用万相 Wan2.6-T2I 模型生成心情卡片图片（同步调用）
 */
export async function generateMoodImage(options: {
  lyrics: string[]
  mood: string
  songTitle?: string
  artist?: string
  songBackground?: string
  onStatus?: (status: string) => void
}): Promise<string> {
  const apiKey = getDecodedApiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  const canCall = useSettingsStore.getState().incrementCallCount()
  if (!canCall) {
    throw new Error('DAILY_LIMIT')
  }

  const lyricsText = options.lyrics.join('，')
  const mood = options.mood || '感动而温暖'
  const bgHint = options.songBackground
    ? `歌曲创作背景：${options.songBackground.slice(0, 100)}。`
    : ''

  const prompt = `根据这段歌词意境创作一张唯美艺术插画：「${lyricsText}」。${bgHint}画面表达${mood}的情感氛围。风格：梦幻唯美，色彩温暖柔和，画面空灵富有诗意，适合作为手机壁纸，不包含任何文字和水印。`

  try {
    options.onStatus?.('AI正在创作中，请耐心等待...')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: {
          messages: [
            {
              role: 'user',
              content: [{ text: prompt }],
            },
          ],
        },
        parameters: {
          prompt_extend: true,
          watermark: false,
          n: 1,
          negative_prompt:
            '低分辨率，低画质，文字，水印，模糊，扭曲，畸形，蜡像感',
          size: '960*1696',
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Wan2.6-T2I] API响应错误:', errText)
      throw new Error(`API_ERROR_${response.status}`)
    }

    const data = await response.json()

    // 同步模式：直接从 output 中取图片 URL
    const imageUrl =
      data?.output?.choices?.[0]?.message?.content?.[0]?.image ??
      data?.output?.results?.[0]?.url

    if (!imageUrl) {
      console.error('[Wan2.6-T2I] 无图片结果:', data)
      throw new Error('NO_IMAGE_RESULT')
    }

    return imageUrl
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message === 'NO_API_KEY' ||
        err.message === 'DAILY_LIMIT' ||
        err.message.startsWith('API_ERROR') ||
        err.message === 'NO_IMAGE_RESULT')
    ) {
      throw err
    }
    console.error('[Wan2.6-T2I] 请求失败:', err)
    throw new Error('NETWORK_ERROR')
  }
}

/**
 * 下载AI生成的图片
 */
export async function downloadAIImage(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(imageUrl, { mode: 'cors' })
    if (!response.ok) throw new Error('fetch failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    // CORS不支持时，打开新标签页供手动保存
    window.open(imageUrl, '_blank')
  }
}
