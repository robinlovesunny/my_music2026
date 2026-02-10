import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useSettingsStore, getDecodedApiKey } from '../../store/settingsStore'
import { useAIInsight } from '../../hooks/useAIInsight'
import LyricCardGenerator from './LyricCardGenerator'
import {
  Sparkles,
  RefreshCw,
  Loader2,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from 'lucide-react'

export default function AIInsightTab() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const { content, loading, error, streaming, fetchInsight, refresh } = useAIInsight()
  const [songKey, setSongKey] = useState('')

  // API Key 配置状态
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const qwenApiKey = useSettingsStore((s) => s.qwenApiKey)
  const setQwenApiKey = useSettingsStore((s) => s.setQwenApiKey)

  const hasApiKey = !!qwenApiKey || !!import.meta.env.VITE_DASHSCOPE_API_KEY

  // 切歌时自动获取
  useEffect(() => {
    if (!currentSong) return
    const key = `${currentSong.artist}_${currentSong.title}`
    if (key !== songKey) {
      setSongKey(key)
      if (hasApiKey) {
        fetchInsight(currentSong.artist, currentSong.title)
      }
    }
  }, [currentSong?.id, hasApiKey])

  // 保存API Key
  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setQwenApiKey(keyInput.trim())
      setKeyInput('')
      setKeySaved(true)
      setTimeout(() => {
        setKeySaved(false)
        setShowKeyModal(false)
        // 保存后自动获取当前歌曲解读
        if (currentSong) {
          fetchInsight(currentSong.artist, currentSong.title)
        }
      }, 1000)
    }
  }

  // 无歌曲时显示空状态
  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-dim p-8">
        <Sparkles size={40} className="opacity-40" />
        <p className="text-sm">请先选择一首歌曲</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-4 ai-insight-enter">
        {/* AI歌曲解读区域 */}
        <div className="rounded-xl bg-bg-card/60 backdrop-blur-sm border border-primary/10 overflow-hidden">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-text-primary">歌曲创作背景</span>
              {streaming && (
                <span className="text-[10px] text-primary/60 px-2 py-0.5 rounded-full bg-primary/10 animate-pulse">
                  AI生成中
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* API Key 配置按钮 */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  hasApiKey
                    ? 'text-primary/60 hover:text-primary hover:bg-primary/10'
                    : 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 animate-pulse'
                }`}
                title={hasApiKey ? '修改 API Key' : '配置 API Key'}
              >
                <KeyRound size={14} />
              </button>
              {/* 重新生成按钮 */}
              {content && !loading && (
                <button
                  onClick={() => refresh(currentSong.artist, currentSong.title)}
                  className="p-1.5 rounded-lg text-text-dim hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                  title="重新生成"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 内容区 */}
          <div className="px-4 py-4 min-h-[120px]">
            {!hasApiKey ? (
              /* 未配置API Key */
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <KeyRound size={32} className="text-amber-400/60" />
                <p className="text-sm text-text-muted text-center">
                  请先配置通义千问 API Key
                </p>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-all cursor-pointer"
                >
                  立即配置
                </button>
              </div>
            ) : loading && !content ? (
              /* 加载中（无内容） */
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <div className="relative">
                  <Loader2 size={28} className="text-primary animate-spin" />
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                </div>
                <p className="text-xs text-text-dim typewriter-dots">AI正在解读歌曲背景</p>
              </div>
            ) : error ? (
              /* 错误状态 */
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <AlertCircle size={28} className="text-red-400/60" />
                <p className="text-sm text-red-400/80 text-center">{error}</p>
                <button
                  onClick={() => {
                    if (error.includes('API Key')) {
                      setShowKeyModal(true)
                    } else {
                      fetchInsight(currentSong.artist, currentSong.title)
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-all cursor-pointer"
                >
                  {error.includes('API Key') ? '配置 API Key' : '重新尝试'}
                </button>
              </div>
            ) : content ? (
              /* 解读内容 */
              <div className="text-sm text-text-secondary leading-relaxed ai-text-appear">
                {content}
                {streaming && <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse align-middle" />}
              </div>
            ) : null}
          </div>
        </div>

        {/* 歌词卡片生成器 */}
        <LyricCardGenerator />
      </div>

      {/* API Key 配置弹窗 */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          />
          <div className="relative w-[400px] bg-bg-secondary rounded-2xl border border-primary/20 shadow-[0_0_60px_rgba(0,0,0,0.5)] p-6 modal-enter">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-text-dim hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <KeyRound size={16} className="text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">配置通义千问 API Key</h3>
            </div>

            <p className="text-xs text-text-dim mb-4 leading-relaxed">
              API Key 将加密存储在本地浏览器中，不会上传到任何服务器。
              <br />
              可前往
              <a
                href="https://dashscope.console.aliyun.com/apiKey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary ml-1 hover:underline"
              >
                阿里云控制台
              </a>
              获取。
            </p>

            <div className="relative mb-4">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="请输入 API Key (sk-...)"
                className="w-full px-4 py-3 pr-10 rounded-xl bg-bg-main border border-primary/15 text-sm text-text-primary placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              onClick={handleSaveKey}
              disabled={!keyInput.trim() || keySaved}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                keySaved
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : keyInput.trim()
                  ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                  : 'bg-white/5 text-text-dim border border-white/10 cursor-not-allowed'
              }`}
            >
              {keySaved ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} />
                  保存成功
                </span>
              ) : (
                '保存 API Key'
              )}
            </button>

            {hasApiKey && (
              <p className="text-[11px] text-primary/50 mt-3 text-center">
                ✓ 已配置 API Key，重新输入将覆盖旧的密钥
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
