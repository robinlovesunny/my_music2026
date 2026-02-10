import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { drawLyricCard, downloadCard } from '../../utils/cardCanvas'
import { generateMoodImage, downloadAIImage } from '../../api/wanImageApi'
import {
  Image,
  Download,
  Type,
  Smile,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react'

export default function LyricCardGenerator() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const lyric = usePlayerStore((s) => s.lyric)

  const [lyricsInput, setLyricsInput] = useState('')
  const [moodInput, setMoodInput] = useState('')
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [showLyricPicker, setShowLyricPicker] = useState(false)

  // AI心情卡片相关状态
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiPreview, setShowAiPreview] = useState(false)
  const [aiDownloadSuccess, setAiDownloadSuccess] = useState(false)
  const [aiStatusText, setAiStatusText] = useState<string>('')

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)

  // 歌词行列表
  const lyricLines = useMemo(() => {
    if (!lyric) return []
    return lyric.lines.filter(l => l.text.trim()).map(l => l.text.trim())
  }, [lyric])

  // 选中的歌词
  const selectedLyrics = useMemo(() => {
    if (lyricsInput.trim()) {
      return lyricsInput.trim().split('\n').filter(Boolean)
    }
    return Array.from(selectedLines)
      .sort((a, b) => a - b)
      .map(i => lyricLines[i])
      .filter(Boolean)
  }, [lyricsInput, selectedLines, lyricLines])

  // 切换歌词行选择
  const toggleLine = useCallback((index: number) => {
    setSelectedLines(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        if (next.size >= 5) return prev
        next.add(index)
      }
      return next
    })
    setLyricsInput('')
  }, [])

  // 生成预览
  const generatePreview = useCallback(() => {
    if (!currentSong || selectedLyrics.length === 0) return

    const canvas = drawLyricCard({
      lyrics: selectedLyrics,
      mood: moodInput,
      songTitle: currentSong.title,
      artist: currentSong.artist,
      width: 540,
      height: 960,
    })

    // 将 canvas 转为图片 URL
    setPreviewDataUrl(canvas.toDataURL('image/png'))
    setShowPreview(true)
  }, [currentSong, selectedLyrics, moodInput])

  // 下载卡片
  const handleDownload = useCallback(async () => {
    if (!currentSong || selectedLyrics.length === 0) return

    try {
      await downloadCard({
        lyrics: selectedLyrics,
        mood: moodInput,
        songTitle: currentSong.title,
        artist: currentSong.artist,
      })
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2000)
    } catch (err) {
      console.error('下载失败:', err)
    }
  }, [currentSong, selectedLyrics, moodInput])

  // AI心情卡片生成
  const handleAiGenerate = useCallback(async () => {
    if (!currentSong || selectedLyrics.length === 0) return

    setAiLoading(true)
    setAiError(null)
    setAiStatusText('正在提交生成任务...')

    try {
      const url = await generateMoodImage({
        lyrics: selectedLyrics,
        mood: moodInput,
        songTitle: currentSong.title,
        artist: currentSong.artist,
        onStatus: (status) => setAiStatusText(status),
      })
      setAiImageUrl(url)
      setShowAiPreview(true)
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case 'NO_API_KEY':
            setAiError('请先在管理后台配置API Key')
            break
          case 'DAILY_LIMIT':
            setAiError('今日API调用次数已达上限')
            break
          case 'NETWORK_ERROR':
            setAiError('网络连接失败，请重试')
            break
          case 'TASK_TIMEOUT':
            setAiError('图片生成超时，请重试')
            break
          case 'TASK_FAILED':
            setAiError('图片生成失败，请重试')
            break
          default:
            setAiError('图片生成失败，请重试')
        }
      }
    } finally {
      setAiLoading(false)
      setAiStatusText('')
    }
  }, [currentSong, selectedLyrics, moodInput])

  // AI图片下载
  const handleAiDownload = useCallback(async () => {
    if (!aiImageUrl || !currentSong) return
    try {
      await downloadAIImage(
        aiImageUrl,
        `AI心情卡片_${currentSong.title}.png`
      )
      setAiDownloadSuccess(true)
      setTimeout(() => setAiDownloadSuccess(false), 2000)
    } catch {
      // fallback handled in downloadAIImage
    }
  }, [aiImageUrl, currentSong])

  // 切歌时重置
  useEffect(() => {
    setLyricsInput('')
    setMoodInput('')
    setSelectedLines(new Set())
    setShowPreview(false)
    setShowLyricPicker(false)
    setAiImageUrl(null)
    setAiLoading(false)
    setAiError(null)
    setShowAiPreview(false)
    setAiStatusText('')
  }, [currentSong?.id])

  if (!currentSong) return null

  const hasContent = selectedLyrics.length > 0

  return (
    <div className="rounded-xl bg-bg-card/60 backdrop-blur-sm border border-primary/10 overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10">
        <Image size={16} className="text-primary" />
        <span className="text-sm font-medium text-text-primary">生成心情卡片</span>
      </div>

      <div className="p-4 space-y-4">
        {/* 歌词选择方式切换 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-text-muted flex items-center gap-1.5">
              <Type size={12} />
              选择歌词片段
            </label>
            {lyricLines.length > 0 && (
              <button
                onClick={() => {
                  setShowLyricPicker(!showLyricPicker)
                  if (!showLyricPicker) setLyricsInput('')
                }}
                className="text-[11px] text-primary/70 hover:text-primary transition-colors cursor-pointer"
              >
                {showLyricPicker ? '手动输入' : '从歌词中选择'}
              </button>
            )}
          </div>

          {showLyricPicker && lyricLines.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto rounded-lg bg-bg-main/60 border border-primary/10 custom-scrollbar">
              {lyricLines.map((line, i) => (
                <button
                  key={i}
                  onClick={() => toggleLine(i)}
                  className={`w-full text-left px-3 py-2 text-xs transition-all cursor-pointer ${
                    selectedLines.has(i)
                      ? 'bg-primary/15 text-primary border-l-2 border-primary'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-secondary border-l-2 border-transparent'
                  }`}
                >
                  {line}
                </button>
              ))}
              {selectedLines.size > 0 && (
                <div className="sticky bottom-0 px-3 py-2 bg-bg-main/90 border-t border-primary/10 text-[10px] text-primary/60">
                  已选 {selectedLines.size}/5 行
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={lyricsInput}
              onChange={(e) => {
                setLyricsInput(e.target.value)
                setSelectedLines(new Set())
              }}
              placeholder="输入或粘贴歌词片段，每行一段..."
              className="w-full h-[100px] px-3 py-2.5 rounded-lg bg-bg-main/60 border border-primary/10 text-sm text-text-primary placeholder:text-text-dim/40 resize-none focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all custom-scrollbar"
            />
          )}
        </div>

        {/* 心情输入 */}
        <div>
          <label className="text-xs text-text-muted flex items-center gap-1.5 mb-2">
            <Smile size={12} />
            此刻心情
          </label>
          <div className="relative">
            <input
              type="text"
              value={moodInput}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setMoodInput(e.target.value)
                }
              }}
              placeholder="一句话记录此刻心情..."
              className="w-full px-3 py-2.5 pr-14 rounded-lg bg-bg-main/60 border border-primary/10 text-sm text-text-primary placeholder:text-text-dim/40 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-dim/50">
              {moodInput.length}/50
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <button
            onClick={generatePreview}
            disabled={!hasContent}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              hasContent
                ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
                : 'bg-white/5 text-text-dim border border-white/5 cursor-not-allowed'
            }`}
          >
            <Image size={14} />
            预览卡片
          </button>
          <button
            onClick={handleDownload}
            disabled={!hasContent}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              downloadSuccess
                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                : hasContent
                ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
                : 'bg-white/5 text-text-dim border border-white/5 cursor-not-allowed'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={14} />
                已保存
              </>
            ) : (
              <>
                <Download size={14} />
                下载 PNG
              </>
            )}
          </button>
        </div>

        {/* AI心情卡片按钮 */}
        <button
          onClick={handleAiGenerate}
          disabled={!hasContent || aiLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            aiLoading
              ? 'bg-primary/10 text-primary/60 border border-primary/15 ai-generating'
              : hasContent
              ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 text-primary border border-primary/30 hover:from-primary/30 hover:via-primary/15 hover:to-primary/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]'
              : 'bg-white/5 text-text-dim border border-white/5 cursor-not-allowed'
          }`}
        >
          {aiLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>
                {aiStatusText || 'AI正在创作中'}
                <span className="typewriter-dots" />
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              AI心情卡片
              <span className="text-[10px] text-primary/50 ml-1">Wan2.6</span>
            </>
          )}
        </button>

        {/* AI错误提示 */}
        {aiError && (
          <div className="text-xs text-red-400/80 text-center py-1 ai-insight-enter">
            {aiError}
          </div>
        )}
      </div>

      {/* Canvas卡片预览弹窗 */}
      {showPreview && previewDataUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative modal-enter flex flex-col items-center">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-bg-secondary border border-primary/20 text-text-dim hover:text-text-primary hover:border-primary/40 transition-all cursor-pointer shadow-lg"
            >
              <X size={14} />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,255,136,0.15)] border border-primary/20">
              <img
                src={previewDataUrl}
                alt="歌词卡片预览"
                className="max-h-[80vh] w-auto block"
              />
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all cursor-pointer"
              >
                <Download size={16} />
                下载高清版 (1080×1920)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI图片预览弹窗 */}
      {showAiPreview && aiImageUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAiPreview(false)}
          />
          <div className="relative modal-enter flex flex-col items-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowAiPreview(false)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-bg-secondary border border-primary/20 text-text-dim hover:text-text-primary hover:border-primary/40 transition-all cursor-pointer shadow-lg"
            >
              <X size={14} />
            </button>

            {/* AI标签 */}
            <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-secondary border border-primary/30 shadow-lg">
              <Sparkles size={10} className="text-primary" />
              <span className="text-[10px] text-primary font-medium">
                AI · Wan2.6
              </span>
            </div>

            {/* AI生成的图片 */}
            <div className="rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,255,136,0.15)] border border-primary/20">
              <img
                src={aiImageUrl}
                alt="AI心情卡片"
                className="max-h-[80vh] w-auto"
              />
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleAiDownload}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  aiDownloadSuccess
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                }`}
              >
                {aiDownloadSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    已保存
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    保存AI心情卡片
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
