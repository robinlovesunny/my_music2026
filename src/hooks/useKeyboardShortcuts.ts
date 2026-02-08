import { useEffect } from 'react'
import { audioEngine } from '../core/AudioEngine'
import { usePlayerStore } from '../store/playerStore'
import { useAudioPlayer } from './useAudioPlayer'

export function useKeyboardShortcuts() {
  const { togglePlay, nextSong, prevSong } = useAudioPlayer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break

        case 'n':
        case 'N':
          nextSong()
          break

        case 'p':
        case 'P':
          prevSong()
          break

        case 'ArrowRight':
          e.preventDefault()
          audioEngine.seek(Math.min(audioEngine.getCurrentTime() + 5, audioEngine.getDuration()))
          break

        case 'ArrowLeft':
          e.preventDefault()
          audioEngine.seek(Math.max(audioEngine.getCurrentTime() - 5, 0))
          break

        case 'ArrowUp':
          e.preventDefault()
          {
            const state = usePlayerStore.getState()
            const newVol = Math.min(state.volume + 0.05, 1)
            state.setVolume(newVol)
          }
          break

        case 'ArrowDown':
          e.preventDefault()
          {
            const state = usePlayerStore.getState()
            const newVol = Math.max(state.volume - 0.05, 0)
            state.setVolume(newVol)
          }
          break

        case 'm':
        case 'M':
          {
            const state = usePlayerStore.getState()
            state.setIsMuted(!state.isMuted)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, nextSong, prevSong])
}
