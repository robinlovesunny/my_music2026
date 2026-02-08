import { useState, useEffect, useRef } from 'react'
import { X, Plus, ListMusic, Check } from 'lucide-react'
import { usePlaylistStore } from '../../store/playlistStore'

interface AddToPlaylistProps {
  songId: string
  onClose: () => void
}

export default function AddToPlaylist({ songId, onClose }: AddToPlaylistProps) {
  const userPlaylists = usePlaylistStore((s) => s.userPlaylists)
  const createUserPlaylist = usePlaylistStore((s) => s.createUserPlaylist)
  const addToUserPlaylist = usePlaylistStore((s) => s.addToUserPlaylist)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    const id = createUserPlaylist(name)
    addToUserPlaylist(id, songId)
    setNewName('')
    setCreating(false)
  }

  const handleAdd = (playlistId: string) => {
    addToUserPlaylist(playlistId, songId)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-bg-secondary border border-white/10 rounded-xl shadow-2xl w-[340px] max-h-[420px] flex flex-col"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-medium text-text-primary">添加到歌单</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-text-dim hover:text-text-primary rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 新建歌单 */}
        <div className="px-4 py-2 border-b border-white/5">
          {creating ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="输入歌单名称"
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-text-primary placeholder-text-dim focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-3 py-1.5 text-sm bg-primary/15 text-primary rounded-md hover:bg-primary/25 transition-colors disabled:opacity-40"
              >
                创建
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-primary hover:bg-white/5 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span>新建歌单</span>
            </button>
          )}
        </div>

        {/* 歌单列表 */}
        <div className="flex-1 overflow-y-auto py-1">
          {userPlaylists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-dim">
              <ListMusic size={32} className="mb-2 opacity-40" />
              <p className="text-xs">还没有歌单，创建一个吧</p>
            </div>
          ) : (
            userPlaylists.map((pl) => {
              const alreadyIn = pl.songIds.includes(songId)
              return (
                <button
                  key={pl.id}
                  onClick={() => !alreadyIn && handleAdd(pl.id)}
                  disabled={alreadyIn}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                    alreadyIn
                      ? 'text-text-dim cursor-default'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ListMusic size={14} />
                    <span>{pl.name}</span>
                    <span className="text-xs text-text-dim">{pl.songIds.length} 首</span>
                  </div>
                  {alreadyIn && <Check size={14} className="text-primary" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
