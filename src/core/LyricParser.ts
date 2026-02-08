import type { ParsedLyric, LyricLine, LyricMeta } from '../types/lyric'

const TIME_RE = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g
const META_RE = /^\[([a-z]+):(.+)\]$/i

function parseTimeTag(match: RegExpExecArray): number {
  const min = parseInt(match[1], 10)
  const sec = parseInt(match[2], 10)
  let ms = 0
  if (match[3]) {
    ms = match[3].length === 2
      ? parseInt(match[3], 10) * 10
      : parseInt(match[3], 10)
  }
  return min * 60 + sec + ms / 1000
}

export function parseLyric(lrcText: string): ParsedLyric {
  const meta: LyricMeta = {}
  const lines: LyricLine[] = []

  const rawLines = lrcText.split(/\r?\n/)

  for (const line of rawLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 解析元数据标签
    const metaMatch = trimmed.match(META_RE)
    if (metaMatch && !trimmed.match(TIME_RE)) {
      const key = metaMatch[1].toLowerCase()
      const value = metaMatch[2].trim()
      switch (key) {
        case 'ar': meta.artist = value; break
        case 'ti': meta.title = value; break
        case 'al': meta.album = value; break
        case 'by': meta.by = value; break
        case 'ly': meta.lyricist = value; break
        case 'mu': meta.composer = value; break
        case 'ar2': meta.arranger = value; break
      }
      continue
    }

    // 解析时间戳歌词
    const times: number[] = []
    let match: RegExpExecArray | null
    const timeRe = new RegExp(TIME_RE.source, 'g')
    while ((match = timeRe.exec(trimmed)) !== null) {
      times.push(parseTimeTag(match))
    }

    if (times.length === 0) continue

    const text = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
    if (!text) continue

    for (const time of times) {
      lines.push({ time, text })
    }
  }

  // 按时间排序
  lines.sort((a, b) => a.time - b.time)

  // 合并同时间戳行为翻译
  const merged: LyricLine[] = []
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i]
    if (i > 0 && Math.abs(current.time - lines[i - 1].time) < 0.01) {
      const prev = merged[merged.length - 1]
      if (prev && !prev.translation) {
        prev.translation = current.text
        continue
      }
    }
    merged.push({ ...current })
  }

  return { meta, lines: merged }
}

export function findCurrentLine(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1
  if (currentTime < lines[0].time) return -1

  let lo = 0
  let hi = lines.length - 1

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (lines[mid].time <= currentTime) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return hi
}
