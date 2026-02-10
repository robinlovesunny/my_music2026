import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  /** 通义千问 API Key（加密存储） */
  qwenApiKey: string
  /** 每日API调用次数 */
  dailyCallCount: number
  /** 上次调用日期 */
  lastCallDate: string
  /** 每日调用上限 */
  dailyLimit: number

  setQwenApiKey: (key: string) => void
  incrementCallCount: () => boolean
  resetDailyCount: () => void
  setDailyLimit: (limit: number) => void
}

/** 简单加密/解密（base64 + 翻转） */
function encode(text: string): string {
  return btoa(text.split('').reverse().join(''))
}

function decode(encoded: string): string {
  try {
    return atob(encoded).split('').reverse().join('')
  } catch {
    return ''
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      qwenApiKey: '',
      dailyCallCount: 0,
      lastCallDate: '',
      dailyLimit: 50,

      setQwenApiKey: (key: string) => set({ qwenApiKey: encode(key) }),

      incrementCallCount: () => {
        const today = new Date().toISOString().split('T')[0]
        const state = get()

        // 如果是新的一天，重置计数
        if (state.lastCallDate !== today) {
          set({ dailyCallCount: 1, lastCallDate: today })
          return true
        }

        // 检查是否超过限制
        if (state.dailyCallCount >= state.dailyLimit) {
          return false
        }

        set({ dailyCallCount: state.dailyCallCount + 1 })
        return true
      },

      resetDailyCount: () => set({ dailyCallCount: 0, lastCallDate: '' }),

      setDailyLimit: (limit: number) => set({ dailyLimit: limit }),
    }),
    {
      name: 'music-player-settings-ai',
      partialize: (state) => ({
        qwenApiKey: state.qwenApiKey,
        dailyCallCount: state.dailyCallCount,
        lastCallDate: state.lastCallDate,
        dailyLimit: state.dailyLimit,
      }),
    }
  )
)

/** 获取解密后的API Key */
export function getDecodedApiKey(): string {
  const encoded = useSettingsStore.getState().qwenApiKey
  if (encoded) return decode(encoded)
  return ''
}
