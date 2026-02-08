import { Heart } from 'lucide-react'
import { usePlaylistStore } from '../../store/playlistStore'
import { useState } from 'react'

export default function FavoriteButton({ songId }: { songId: string }) {
  const favorites = usePlaylistStore((s) => s.favorites)
  const toggleFavorite = usePlaylistStore((s) => s.toggleFavorite)
  const isFav = favorites.includes(songId)
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    toggleFavorite(songId)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white/10 ${animating ? 'heart-beat' : ''}`}
      aria-label={isFav ? '取消收藏' : '收藏'}
    >
      <Heart
        size={16}
        className={isFav ? 'text-red-500 fill-red-500' : 'text-text-muted hover:text-red-400'}
      />
    </button>
  )
}
