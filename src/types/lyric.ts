export interface LyricLine {
  time: number
  text: string
  translation?: string
}

export interface LyricMeta {
  artist?: string
  title?: string
  album?: string
  by?: string
  lyricist?: string
  composer?: string
  arranger?: string
}

export interface ParsedLyric {
  meta: LyricMeta
  lines: LyricLine[]
}
