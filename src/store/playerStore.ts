import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song } from '../types/song'
import type { LoopMode, Quality, PlayerMode } from '../types/player'
import type { ParsedLyric } from '../types/lyric'
import type { LyricSource } from '../api/types'

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  currentSong: Song | null
  currentIndex: number
  loopMode: LoopMode
  quality: Quality
  playerMode: PlayerMode
  lyric: ParsedLyric | null
  lyricSource: LyricSource
  lyricLoading: boolean
  showPlaylist: boolean

  setIsPlaying: (v: boolean) => void
  setCurrentTime: (v: number) => void
  setDuration: (v: number) => void
  setVolume: (v: number) => void
  setIsMuted: (v: boolean) => void
  setCurrentSong: (song: Song | null, index: number) => void
  setLoopMode: (mode: LoopMode) => void
  cycleLoopMode: () => void
  setQuality: (q: Quality) => void
  setPlayerMode: (m: PlayerMode) => void
  setLyric: (l: ParsedLyric | null) => void
  setLyricSource: (s: LyricSource) => void
  setLyricLoading: (v: boolean) => void
  setShowPlaylist: (v: boolean) => void
  togglePlaylist: () => void
  updateCurrentSongCover: (cover: string) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      currentSong: null,
      currentIndex: -1,
      loopMode: 'list',
      quality: 'high',
      playerMode: 'fullscreen',
      lyric: null,
      lyricSource: null,
      lyricLoading: false,
      showPlaylist: false,

      setIsPlaying: (v) => set({ isPlaying: v }),
      setCurrentTime: (v) => set({ currentTime: v }),
      setDuration: (v) => set({ duration: v }),
      setVolume: (v) => set({ volume: v }),
      setIsMuted: (v) => set({ isMuted: v }),
      setCurrentSong: (song, index) => set({ currentSong: song, currentIndex: index, currentTime: 0 }),
      setLoopMode: (mode) => set({ loopMode: mode }),
      cycleLoopMode: () => set((state) => {
        const modes: LoopMode[] = ['list', 'single', 'random']
        const idx = modes.indexOf(state.loopMode)
        return { loopMode: modes[(idx + 1) % modes.length] }
      }),
      setQuality: (q) => set({ quality: q }),
      setPlayerMode: (m) => set({ playerMode: m }),
      setLyric: (l) => set({ lyric: l }),
      setLyricSource: (s) => set({ lyricSource: s }),
      setLyricLoading: (v) => set({ lyricLoading: v }),
      setShowPlaylist: (v) => set({ showPlaylist: v }),
      togglePlaylist: () => set((state) => ({ showPlaylist: !state.showPlaylist })),
      updateCurrentSongCover: (cover) => set((state) => ({
        currentSong: state.currentSong ? { ...state.currentSong, cover } : null,
      })),
    }),
    {
      name: 'music-player-settings',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        loopMode: state.loopMode,
        quality: state.quality,
        playerMode: state.playerMode,
      }),
    }
  )
)
