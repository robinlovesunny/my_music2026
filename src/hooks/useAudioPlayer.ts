import { useEffect, useCallback, useRef } from 'react'
import { audioEngine } from '../core/AudioEngine'
import { usePlayerStore } from '../store/playerStore'
import { usePlaylistStore } from '../store/playlistStore'

export function useAudioPlayer() {
  const {
    isPlaying, volume, isMuted, currentSong,
    setCurrentTime, setCurrentSong,
  } = usePlayerStore()
  const { playlist } = usePlaylistStore()
  const initRef = useRef(false)

  // 初始化引擎事件
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    audioEngine.on('timeupdate', (time) => {
      usePlayerStore.getState().setCurrentTime(time)
    })
    audioEngine.on('durationchange', (dur) => {
      usePlayerStore.getState().setDuration(dur)
    })
    audioEngine.on('play', () => {
      usePlayerStore.getState().setIsPlaying(true)
    })
    audioEngine.on('pause', () => {
      usePlayerStore.getState().setIsPlaying(false)
    })
    audioEngine.on('ended', () => {
      const state = usePlayerStore.getState()
      const pl = usePlaylistStore.getState().playlist
      handleSongEnd(state.loopMode, state.currentIndex, pl)
    })
  }, [])

  // 同步音量
  useEffect(() => {
    audioEngine.setVolume(volume)
  }, [volume])

  useEffect(() => {
    audioEngine.setMuted(isMuted)
  }, [isMuted])

  const handleSongEnd = useCallback((mode: string, idx: number, pl: typeof playlist) => {
    if (pl.length === 0) return
    if (mode === 'single') {
      audioEngine.seek(0)
      audioEngine.play()
    } else if (mode === 'random') {
      let next = Math.floor(Math.random() * pl.length)
      if (pl.length > 1) {
        while (next === idx) next = Math.floor(Math.random() * pl.length)
      }
      playSongAtIndex(next, pl)
    } else {
      const next = (idx + 1) % pl.length
      playSongAtIndex(next, pl)
    }
  }, [])

  const playSongAtIndex = useCallback(async (index: number, pl?: typeof playlist) => {
    const list = pl || usePlaylistStore.getState().playlist
    if (index < 0 || index >= list.length) return
    const song = list[index]
    setCurrentSong(song, index)
    audioEngine.loadSong(song)
    try {
      await audioEngine.play()
    } catch {
      // 浏览器自动播放限制，等待用户交互
    }
  }, [setCurrentSong])

  const togglePlay = useCallback(async () => {
    if (!currentSong) {
      const pl = usePlaylistStore.getState().playlist
      if (pl.length > 0) {
        await playSongAtIndex(0, pl)
      }
      return
    }
    if (isPlaying) {
      audioEngine.pause()
    } else {
      await audioEngine.play()
    }
  }, [currentSong, isPlaying, playSongAtIndex])

  const nextSong = useCallback(() => {
    const pl = usePlaylistStore.getState().playlist
    if (pl.length === 0) return
    const state = usePlayerStore.getState()
    if (state.loopMode === 'random') {
      let next = Math.floor(Math.random() * pl.length)
      if (pl.length > 1) {
        while (next === state.currentIndex) next = Math.floor(Math.random() * pl.length)
      }
      playSongAtIndex(next, pl)
    } else {
      const next = (state.currentIndex + 1) % pl.length
      playSongAtIndex(next, pl)
    }
  }, [playSongAtIndex])

  const prevSong = useCallback(() => {
    const pl = usePlaylistStore.getState().playlist
    if (pl.length === 0) return
    const state = usePlayerStore.getState()
    const prev = (state.currentIndex - 1 + pl.length) % pl.length
    playSongAtIndex(prev, pl)
  }, [playSongAtIndex])

  const seek = useCallback((time: number) => {
    audioEngine.seek(time)
    setCurrentTime(time)
  }, [setCurrentTime])

  return {
    isPlaying,
    currentSong,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    playSongAtIndex,
  }
}
