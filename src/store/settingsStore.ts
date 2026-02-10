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
  /** 管理员密码（加密存储） */
  adminPassword: string
  /** 管理员是否已登录 */
  isAdminLoggedIn: boolean

  setQwenApiKey: (key: string) => void
  incrementCallCount: () => boolean
  resetDailyCount: () => void
  setDailyLimit: (limit: number) => void
  setAdminPassword: (pwd: string) => void
  verifyAdminPassword: (pwd: string) => boolean
  setAdminLoggedIn: (v: boolean) => void
  logout: () => void
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
      adminPassword: encode('123456'),
      isAdminLoggedIn: false,

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

      setAdminPassword: (pwd: string) => set({ adminPassword: encode(pwd) }),

      verifyAdminPassword: (pwd: string) => {
        const state = get()
        return decode(state.adminPassword) === pwd
      },

      setAdminLoggedIn: (v: boolean) => set({ isAdminLoggedIn: v }),

      logout: () => set({ isAdminLoggedIn: false }),
    }),
    {
      name: 'music-player-settings-ai',
      partialize: (state) => ({
        qwenApiKey: state.qwenApiKey,
        dailyCallCount: state.dailyCallCount,
        lastCallDate: state.lastCallDate,
        dailyLimit: state.dailyLimit,
        adminPassword: state.adminPassword,
      }),
    }
  )
)

/** 获取解密后的API Key（优先用户配置，其次环境变量默认值） */
export function getDecodedApiKey(): string {
  const encoded = useSettingsStore.getState().qwenApiKey
  if (encoded) return decode(encoded)
  // 回退到环境变量中的默认 Key
  return import.meta.env.VITE_DASHSCOPE_API_KEY ?? ''
}
