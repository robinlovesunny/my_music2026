export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  cover: string
  audioUrl: string
  source: 'local' | 'api'
  quality: 'standard' | 'high' | 'extreme'
  /** API歌词链接（可选） */
  lrcUrl?: string
}
