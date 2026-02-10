import { useState, useCallback, useRef } from 'react'
import { getSongBackground, clearInsightCache } from '../api/qwenApi'

interface AIInsightState {
  content: string
  loading: boolean
  error: string | null
  streaming: boolean
}

export function useAIInsight() {
  const [state, setState] = useState<AIInsightState>({
    content: '',
    loading: false,
    error: null,
    streaming: false,
  })

  const abortRef = useRef(false)

  /** 获取AI解读内容 */
  const fetchInsight = useCallback(async (artist: string, title: string, forceRefresh = false) => {
    if (!artist || !title) return
    if (artist === '未知歌手') {
      setState({ content: '', loading: false, error: '无法识别歌手信息，请确保歌曲信息完整', streaming: false })
      return
    }

    abortRef.current = false
    setState({ content: '', loading: true, error: null, streaming: true })

    try {
      const result = await getSongBackground(artist, title, {
        forceRefresh,
        onStream: (text) => {
          if (!abortRef.current) {
            setState(prev => ({ ...prev, content: text }))
          }
        },
      })

      if (!abortRef.current) {
        setState({ content: result, loading: false, error: null, streaming: false })
      }
    } catch (err) {
      if (abortRef.current) return

      const message = err instanceof Error ? err.message : '未知错误'
      let errorText: string

      switch (message) {
        case 'NO_API_KEY':
          errorText = '请先配置通义千问 API Key'
          break
        case 'DAILY_LIMIT':
          errorText = '今日API调用次数已达上限'
          break
        case 'NETWORK_ERROR':
          errorText = '网络连接失败，请检查网络后重试'
          break
        default:
          if (message.startsWith('API_ERROR')) {
            errorText = `API调用失败（${message.replace('API_ERROR_', '状态码')}）`
          } else {
            errorText = '获取解读内容失败，请稍后重试'
          }
      }

      setState({ content: '', loading: false, error: errorText, streaming: false })
    }
  }, [])

  /** 重新生成 */
  const refresh = useCallback(async (artist: string, title: string) => {
    clearInsightCache(artist, title)
    await fetchInsight(artist, title, true)
  }, [fetchInsight])

  /** 取消请求 */
  const cancel = useCallback(() => {
    abortRef.current = true
    setState(prev => ({ ...prev, loading: false, streaming: false }))
  }, [])

  return {
    ...state,
    fetchInsight,
    refresh,
    cancel,
  }
}
