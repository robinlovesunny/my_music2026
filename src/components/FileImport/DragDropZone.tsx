import { useCallback } from 'react'
import { FolderOpen, Music } from 'lucide-react'
import { useFileImport } from '../../hooks/useFileImport'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { usePlaylistStore } from '../../store/playlistStore'

export default function DragDropZone() {
  const { importFiles } = useFileImport()
  const { playSongAtIndex } = useAudioPlayer()
  const playlist = usePlaylistStore((s) => s.playlist)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('border-primary')
    if (e.dataTransfer.files.length > 0) {
      const prevLen = playlist.length
      const songs = await importFiles(e.dataTransfer.files)
      if (songs.length > 0 && prevLen === 0) {
        playSongAtIndex(0)
      }
    }
  }, [importFiles, playSongAtIndex, playlist.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-primary')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary')
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center h-full border-2 border-dashed border-primary/20 rounded-2xl p-8 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_40px_rgba(0,255,136,0.15)] group relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* 背景光晕动效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 音乐图标 - 添加动效 */}
      <div className="relative mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
        <Music size={64} className="text-primary/40 group-hover:text-primary/60 transition-colors drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]" />
        {/* 脉冲圆环 */}
        <div className="absolute inset-0 -m-4 border-2 border-primary/20 rounded-full animate-ping opacity-0 group-hover:opacity-100" />
      </div>
      
      <div className="relative z-10 text-center">
        <p className="text-text-secondary text-lg mb-2 font-medium">拖拽音乐文件到此处</p>
        <p className="text-text-dim text-sm mb-6">支持 MP3、WAV、OGG、FLAC 等格式</p>
        
        <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary text-sm rounded-xl cursor-pointer hover:from-primary/30 hover:to-primary-dark/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:scale-105 border border-primary/30 backdrop-blur-sm">
          <FolderOpen size={18} />
          <span className="font-medium">选择文件</span>
          <input
            type="file"
            accept="audio/*,.lrc"
            multiple
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                const prevLen = playlist.length
                const songs = await importFiles(e.target.files)
                if (songs.length > 0 && prevLen === 0) {
                  playSongAtIndex(0)
                }
                e.target.value = ''
              }
            }}
          />
        </label>
      </div>
      
      {/* 装饰线条 */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/20 rounded-br-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
