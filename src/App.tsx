import { useEffect, useState } from 'react'
import VinylSection from './components/Player/VinylSection'
import SongHeader from './components/SongInfo/SongHeader'
import TabContainer from './components/ContentTabs/TabContainer'
import ControlBar from './components/Controls/ControlBar'
import PlaylistDrawer from './components/Playlist/PlaylistDrawer'
import DragDropZone from './components/FileImport/DragDropZone'
import DynamicGradient from './components/Background/DynamicGradient'
import { usePlayerStore } from './store/playerStore'
import { usePlaylistStore } from './store/playlistStore'
import { extractColors } from './core/ColorExtractor'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getCover } from './api/lyricApi'

function App() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const playerMode = usePlayerStore((s) => s.playerMode)
  const playlist = usePlaylistStore((s) => s.playlist)
  const [bgColors, setBgColors] = useState<[number, number, number][]>()

  // 注册键盘快捷键
  useKeyboardShortcuts()

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

      {isEmpty ? (
        /* 空状态：拖拽导入区 */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <DragDropZone />
          </div>
        </div>
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
