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
      className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-2xl p-8 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Music size={48} className="text-text-dim mb-4" />
      <p className="text-text-muted text-sm mb-2">拖拽音乐文件到此处</p>
      <p className="text-text-dim text-xs mb-4">支持 MP3、WAV、OGG、FLAC 等格式</p>
      <label className="flex items-center gap-2 px-4 py-2 bg-primary/15 text-primary text-sm rounded-lg cursor-pointer hover:bg-primary/25 transition-colors">
        <FolderOpen size={16} />
        选择文件
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
  )
}
