import { useEffect, useState } from 'react'
import VinylSection from './components/Player/VinylSection'
import SongHeader from './components/SongInfo/SongHeader'
import TabContainer from './components/ContentTabs/TabContainer'
import ControlBar from './components/Controls/ControlBar'
import PlaylistDrawer from './components/Playlist/PlaylistDrawer'
import HomePage from './components/Home/HomePage'
import LibraryTab from './components/ContentTabs/LibraryTab'
import DynamicGradient from './components/Background/DynamicGradient'
import { usePlayerStore } from './store/playerStore'
import { usePlaylistStore } from './store/playlistStore'
import { extractColors } from './core/ColorExtractor'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getCover } from './api/lyricApi'
import AdminPage from './components/Admin/AdminPage'
import { ArrowLeft, Settings } from 'lucide-react'

type ViewMode = 'home' | 'library' | 'player' | 'admin'

function App() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const playerMode = usePlayerStore((s) => s.playerMode)
  const playlist = usePlaylistStore((s) => s.playlist)
  const [bgColors, setBgColors] = useState<[number, number, number][]>()
  const [viewMode, setViewMode] = useState<ViewMode>('home')

  // 注册键盘快捷键
  useKeyboardShortcuts()

  // 当有歌曲播放时自动切换到播放器视图
  useEffect(() => {
    if (currentSong && viewMode === 'home') {
      setViewMode('player')
    }
  }, [currentSong, viewMode])

  // 封面变化时提取颜色
  useEffect(() => {
    if (currentSong?.cover) {
      extractColors(currentSong.cover).then(setBgColors)
    } else {
      setBgColors(undefined)
    }
  }, [currentSong?.cover])

  // 无封面时自动从API获取
  useEffect(() => {
    if (!currentSong || currentSong.cover) return
    if (currentSong.artist === '未知歌手') return

    let cancelled = false
    getCover(currentSong.artist, currentSong.title).then((coverUrl) => {
      if (cancelled || !coverUrl) return
      usePlayerStore.getState().updateCurrentSongCover(coverUrl)
      usePlaylistStore.getState().updateSongCover(currentSong.id, coverUrl)
    })

    return () => { cancelled = true }
  }, [currentSong?.id])

  const isEmpty = playlist.length === 0 && !currentSong

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DynamicGradient colors={bgColors} />

      {/* 曲库视图返回按钮 */}
      {viewMode === 'library' && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setViewMode(isEmpty ? 'home' : 'player')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-card/80 backdrop-blur-xl border border-primary/20 text-text-primary hover:border-primary/50 hover:bg-bg-card transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">返回</span>
          </button>
        </div>
      )}

      {/* 管理员入口按钮 */}
      {viewMode !== 'admin' && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setViewMode('admin')}
            className="p-2.5 rounded-lg bg-bg-card/60 backdrop-blur-xl border border-primary/10 text-text-dim hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
            title="管理员设置"
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {viewMode === 'admin' ? (
        /* 管理员页面 */
        <AdminPage onBack={() => setViewMode(isEmpty ? 'home' : 'player')} />
      ) : viewMode === 'home' ? (
        /* 首页：选择曲库或导入 */
        <HomePage onOpenLibrary={() => setViewMode('library')} />
      ) : viewMode === 'library' ? (
        /* 曲库视图 */
        <div className="flex-1 flex items-center justify-center p-8 pb-24">
          <div className="w-full max-w-4xl h-[calc(100vh-200px)] bg-bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <LibraryTab />
          </div>
        </div>
      ) : isEmpty ? (
        /* 空状态：返回首页 */
        <HomePage onOpenLibrary={() => setViewMode('library')} />
      ) : playerMode === 'mini' ? (
        /* 迷你模式：仅显示歌曲信息 */
        <div className="flex-1 flex items-center justify-center pb-[88px]">
          <div className="text-center px-6">
            <VinylSection />
            <div className="mt-4">
              <h2 className="text-xl font-bold text-text-primary truncate">{currentSong?.title ?? '未选择歌曲'}</h2>
              <p className="text-sm text-text-muted mt-1">{currentSong?.artist ?? ''}</p>
            </div>
          </div>
        </div>
      ) : (
        /* 全屏模式：播放器主界面 */
        <div className="flex-1 flex overflow-hidden pb-[88px]">
          {/* 左侧：唱片区域 */}
          <div className="w-[420px] flex-shrink-0 flex items-center justify-center">
            <VinylSection />
          </div>

          {/* 右侧：歌曲信息 + Tab内容 */}
          <div className="flex-1 flex flex-col px-6 py-6 min-w-0">
            <SongHeader />
            <TabContainer />
          </div>
        </div>
      )}

      {/* 底部控制条 */}
      <ControlBar />

      {/* 播放列表抽屉 */}
      <PlaylistDrawer />
    </div>
  )
}

export default App
