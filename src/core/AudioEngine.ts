import type { Song } from '../types/song'

type AudioEventCallback = () => void
type AudioTimeCallback = (time: number) => void
type AudioErrorCallback = (error: string) => void

class AudioEngine {
  private audio: HTMLAudioElement
  private onTimeUpdate: AudioTimeCallback | null = null
  private onDurationChange: AudioTimeCallback | null = null
  private onEnded: AudioEventCallback | null = null
  private onPlay: AudioEventCallback | null = null
  private onPause: AudioEventCallback | null = null
  private onError: AudioErrorCallback | null = null
  private currentBlobUrl: string | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'
    this.setupEvents()
  }

  private setupEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdate?.(this.audio.currentTime)
    })
    this.audio.addEventListener('durationchange', () => {
      if (isFinite(this.audio.duration)) {
        this.onDurationChange?.(this.audio.duration)
      }
    })
    this.audio.addEventListener('ended', () => {
      this.onEnded?.()
    })
    this.audio.addEventListener('play', () => {
      this.onPlay?.()
    })
    this.audio.addEventListener('pause', () => {
      this.onPause?.()
    })
    this.audio.addEventListener('error', () => {
      const error = this.audio.error
      this.onError?.(error?.message || '音频加载失败')
    })
  }

  loadSong(song: Song) {
    this.audio.pause()
    this.audio.currentTime = 0
    this.audio.src = song.audioUrl
    this.audio.load()
  }

  async play(): Promise<void> {
    try {
      await this.audio.play()
    } catch (err) {
      console.warn('播放失败，可能需要用户交互:', err)
      throw err
    }
  }

  pause() {
    this.audio.pause()
  }

  seek(time: number) {
    if (isFinite(time) && time >= 0) {
      this.audio.currentTime = Math.min(time, this.audio.duration || 0)
    }
  }

  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  getVolume(): number {
    return this.audio.volume
  }

  getCurrentTime(): number {
    return this.audio.currentTime
  }

  getDuration(): number {
    return this.audio.duration || 0
  }

  getIsPlaying(): boolean {
    return !this.audio.paused
  }

  setMuted(muted: boolean) {
    this.audio.muted = muted
  }

  isMuted(): boolean {
    return this.audio.muted
  }

  on(event: 'timeupdate', cb: AudioTimeCallback): void
  on(event: 'durationchange', cb: AudioTimeCallback): void
  on(event: 'ended', cb: AudioEventCallback): void
  on(event: 'play', cb: AudioEventCallback): void
  on(event: 'pause', cb: AudioEventCallback): void
  on(event: 'error', cb: AudioErrorCallback): void
  on(event: string, cb: (...args: never[]) => void): void {
    switch (event) {
      case 'timeupdate': this.onTimeUpdate = cb as AudioTimeCallback; break
      case 'durationchange': this.onDurationChange = cb as AudioTimeCallback; break
      case 'ended': this.onEnded = cb as AudioEventCallback; break
      case 'play': this.onPlay = cb as AudioEventCallback; break
      case 'pause': this.onPause = cb as AudioEventCallback; break
      case 'error': this.onError = cb as AudioErrorCallback; break
    }
  }

  revokeBlobUrl() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl)
      this.currentBlobUrl = null
    }
  }

  setBlobUrl(url: string) {
    this.revokeBlobUrl()
    this.currentBlobUrl = url
  }

  destroy() {
    this.audio.pause()
    this.audio.src = ''
    this.revokeBlobUrl()
  }
}

export const audioEngine = new AudioEngine()

// 暴露到 window 用于调试
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__audioEngine = audioEngine
}
