import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song } from '../types/song'

export interface UserPlaylist {
  id: string
  name: string
  songIds: string[]
  createdAt: number
}

interface PlaylistState {
  playlist: Song[]
  favorites: string[]
  userPlaylists: UserPlaylist[]

  addSongs: (songs: Song[]) => void
  removeSong: (id: string) => void
  clearPlaylist: () => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  createUserPlaylist: (name: string) => string
  deleteUserPlaylist: (id: string) => void
  addToUserPlaylist: (playlistId: string, songId: string) => void
  removeFromUserPlaylist: (playlistId: string, songId: string) => void
  updateSongCover: (songId: string, cover: string) => void
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlist: [],
      favorites: [],
      userPlaylists: [],

      addSongs: (songs) => set((state) => ({
        playlist: [...state.playlist, ...songs.filter(s => !state.playlist.some(p => p.id === s.id))]
      })),
      removeSong: (id) => set((state) => ({
        playlist: state.playlist.filter(s => s.id !== id)
      })),
      clearPlaylist: () => set({ playlist: [] }),
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter(f => f !== id)
          : [...state.favorites, id]
      })),
      isFavorite: (id) => get().favorites.includes(id),
      createUserPlaylist: (name) => {
        const id = `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        set((state) => ({
          userPlaylists: [...state.userPlaylists, { id, name, songIds: [], createdAt: Date.now() }]
        }))
        return id
      },
      deleteUserPlaylist: (id) => set((state) => ({
        userPlaylists: state.userPlaylists.filter(p => p.id !== id)
      })),
      addToUserPlaylist: (playlistId, songId) => set((state) => ({
        userPlaylists: state.userPlaylists.map(p =>
          p.id === playlistId && !p.songIds.includes(songId)
            ? { ...p, songIds: [...p.songIds, songId] }
            : p
        )
      })),
      removeFromUserPlaylist: (playlistId, songId) => set((state) => ({
        userPlaylists: state.userPlaylists.map(p =>
          p.id === playlistId
            ? { ...p, songIds: p.songIds.filter(s => s !== songId) }
            : p
        )
      })),
      updateSongCover: (songId, cover) => set((state) => ({
        playlist: state.playlist.map(s =>
          s.id === songId ? { ...s, cover } : s
        )
      })),
    }),
    {
      name: 'music-player-playlist',
      partialize: (state) => ({
        favorites: state.favorites,
        userPlaylists: state.userPlaylists,
      }),
    }
  )
)
