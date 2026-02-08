import { useCallback } from 'react'
import type { Song } from '../types/song'
import { usePlaylistStore } from '../store/playlistStore'
import { parseLyric } from '../core/LyricParser'
import { usePlayerStore } from '../store/playerStore'

function parseAudioFile(file: File): Song {
  const audioUrl = URL.createObjectURL(file)
  const fileName = file.name.replace(/\.[^/.]+$/, '')

  // 尝试从文件名解析 "歌手 - 歌名" 格式
  let title = fileName
  let artist = '未知歌手'
  const match = fileName.match(/^(.+?)\s*-\s*(.+)$/)
  if (match) {
    artist = match[1].trim()
    title = match[2].trim()
  }

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    artist,
    album: '未知专辑',
    duration: 0,
    cover: '',
    audioUrl,
    source: 'local',
    quality: 'standard',
  }
}

export function useFileImport() {
  const addSongs = usePlaylistStore((s) => s.addSongs)
  const setLyric = usePlayerStore((s) => s.setLyric)

  const importAudioFiles = useCallback((files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(f =>
      f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a|wma)$/i.test(f.name)
    )

    const songs: Song[] = audioFiles.map(file => parseAudioFile(file))

    if (songs.length > 0) {
      addSongs(songs)
    }

    return songs
  }, [addSongs])

  const importLrcFile = useCallback(async (file: File) => {
    const text = await file.text()
    const parsed = parseLyric(text)
    setLyric(parsed)
    // 标记歌词来源为本地
    usePlayerStore.getState().setLyricSource('local')
    return parsed
  }, [setLyric])

  const importFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const audioFileList = fileArray.filter(f =>
      f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a|wma)$/i.test(f.name)
    )
    const lrcFiles = fileArray.filter(f => /\.lrc$/i.test(f.name))

    const songs = audioFileList.length > 0 ? importAudioFiles(audioFileList) : []

    if (lrcFiles.length > 0) {
      await importLrcFile(lrcFiles[0])
    }

    return songs
  }, [importAudioFiles, importLrcFile])

  return { importFiles, importAudioFiles, importLrcFile }
}
