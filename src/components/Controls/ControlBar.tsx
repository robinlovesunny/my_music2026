import ProgressBar from './ProgressBar'
import PlayButton from './PlayButton'
import NextPrevButtons from './NextPrevButtons'
import VolumeControl from './VolumeControl'
import LoopModeButton from './LoopModeButton'
import QualitySelector from './QualitySelector'
import ModeToggle from './ModeToggle'
import { ListMusic, FolderOpen, ListPlus } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { usePlaylistStore } from '../../store/playlistStore'
import { useFileImport } from '../../hooks/useFileImport'
import { useRef, useState } from 'react'
import FavoriteButton from '../SongInfo/FavoriteButton'
import AddToPlaylist from '../Playlist/AddToPlaylist'

export default function ControlBar() {
  const togglePlaylist = usePlayerStore((s) => s.togglePlaylist)
  const playlist = usePlaylistStore((s) => s.playlist)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const { importFiles } = useFileImport()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-2xl border-t border-primary/10 z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
      {/* 顶部发光线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* 进度条 */}
      <ProgressBar />

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* 左侧：导入 + 列表数量 */}
        <div className="flex items-center gap-2 w-1/4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary transition-all duration-300 rounded-full hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
            aria-label="导入音乐"
            title="导入音乐"
          >
            <FolderOpen size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.lrc"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={togglePlaylist}
            className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-all duration-300 text-xs px-2 py-1 rounded-full hover:bg-primary/10"
            aria-label="播放列表"
          >
            <ListMusic size={14} />
            <span>{playlist.length}</span>
          </button>
          <LoopModeButton />
        </div>

        {/* 中间：播放控制 - 三组件居中，绿色播放按钮在中间 */}
        <div className="flex items-center justify-center flex-1 gap-4">
          {/* 左侧辅助按钮 */}
          <div className="flex items-center gap-2">
            {currentSong && <FavoriteButton songId={currentSong.id} />}
            {currentSong && (
              <button
                onClick={() => setShowAddToPlaylist(true)}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary transition-all duration-300 rounded-full hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                aria-label="添加到歌单"
                title="添加到歌单"
              >
                <ListPlus size={16} />
              </button>
            )}
          </div>
          {/* 音量 */}
          <VolumeControl />
          {/* 上一曲/下一曲 中的上一曲 + 播放按钮 + 下一曲 */}
          <NextPrevButtons leftOnly />
          <PlayButton />
          <NextPrevButtons rightOnly />
        </div>

        {/* 右侧：音质 + 模式 */}
        <div className="flex items-center justify-end gap-2 w-1/4">
          <QualitySelector />
          <ModeToggle />
        </div>
      </div>

      {/* 添加到歌单弹窗 */}
      {showAddToPlaylist && currentSong && (
        <AddToPlaylist songId={currentSong.id} onClose={() => setShowAddToPlaylist(false)} />
      )}
    </div>
  )
}
