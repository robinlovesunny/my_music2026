import { useState, useEffect } from 'react'
import { Music, Play, Plus, Loader2 } from 'lucide-react'
import { usePlaylistStore } from '../../store/playlistStore'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import type { Song } from '../../types/song'

interface LibrarySong {
  filename: string
  title: string
  artist: string
}

export default function LibraryTab() {
  const [librarySongs, setLibrarySongs] = useState<LibrarySong[]>([])
  const [loading, setLoading] = useState(true)
  const addSongs = usePlaylistStore((s) => s.addSongs)
  const playlist = usePlaylistStore((s) => s.playlist)
  const { playSongAtIndex } = useAudioPlayer()

  // 加载曲库歌曲列表
  useEffect(() => {
    loadLibrarySongs()
  }, [])

  const loadLibrarySongs = async () => {
    try {
      setLoading(true)
      // 从 music_database/jay 目录读取歌曲列表
      const songs: LibrarySong[] = []
      
      // 这里列出所有歌曲文件名
      const songFiles = [
        '你比从前快乐—周杰伦 加长版.mp3',
        '周杰伦 - 一路向北.mp3',
        '周杰伦 - 七里香.mp3',
        '周杰伦 - 三年二班.mp3',
        '周杰伦 - 上海一九四三.mp3',
        '周杰伦 - 东风破.mp3',
        '周杰伦 - 乱舞春秋.mp3',
        '周杰伦 - 以父之名.mp3',
        '周杰伦 - 你听得到 - 2004无与伦比演唱会.mp3',
        '周杰伦 - 你听得到.mp3',
        '周杰伦 - 借口.mp3',
        '周杰伦 - 分裂（离开）.mp3',
        '周杰伦 - 半兽人.mp3',
        '周杰伦 - 半岛铁盒.mp3',
        '周杰伦 - 双刀.mp3',
        '周杰伦 - 双截棍.mp3',
        '周杰伦 - 发如雪.mp3',
        '周杰伦 - 同一种调调.mp3',
        '周杰伦 - 听妈妈的话.mp3',
        '周杰伦 - 四面楚歌.mp3',
        '周杰伦 - 回到过去.mp3',
        '周杰伦 - 园游会.mp3',
        '周杰伦 - 困兽之斗.mp3',
        '周杰伦 - 外婆.mp3',
        '周杰伦 - 夜曲.mp3',
        '周杰伦 - 夜的第七章.mp3',
        '周杰伦 - 她的睫毛.mp3',
        '周杰伦 - 威廉古堡.mp3',
        '周杰伦 - 安静.mp3',
        '周杰伦 - 对不起.mp3',
        '周杰伦 - 将军.mp3',
        '周杰伦 - 开不了口.mp3',
        '周杰伦 - 彩虹.mp3',
        '周杰伦 - 心雨.mp3',
        '周杰伦 - 忍者.mp3',
        '周杰伦 - 懦夫.mp3',
        '周杰伦 - 我不配(距离).mp3',
        '周杰伦 - 我的地盘.mp3',
        '周杰伦 - 扯.mp3',
        '周杰伦 - 搁浅.mp3',
        '周杰伦 - 无双.mp3',
        '周杰伦 - 晴天.mp3',
        '周杰伦 - 暗号.mp3',
        '周杰伦 - 最后的战役.mp3',
        '周杰伦 - 最长的电影.mp3',
        '周杰伦 - 本草纲目.mp3',
        '周杰伦 - 枫.mp3',
        '周杰伦 - 梯田.mp3',
        '周杰伦 - 止战之殇.mp3',
        '周杰伦 - 浪漫手机.mp3',
        '周杰伦 - 火车叨位去.mp3',
        '周杰伦 - 爱在西元前.mp3',
        '周杰伦 - 爱情悬崖.mp3',
        '周杰伦 - 爷爷泡的茶.mp3',
        '周杰伦 - 爸我回来了.mp3',
        '周杰伦 - 牛仔很忙.mp3',
        '周杰伦 - 珊瑚海.mp3',
        '周杰伦 - 甜甜的.mp3',
        '周杰伦 - 白色风车.mp3',
        '周杰伦 - 稻香.mp3',
        '周杰伦 - 简单爱.mp3',
        '周杰伦 - 米兰的小铁匠.mp3',
        '周杰伦 - 红模仿.mp3',
        '周杰伦 - 菊花台.mp3',
        '周杰伦 - 蒲公英的约定.mp3',
        '周杰伦 - 蓝色风暴.mp3',
        '周杰伦 - 迷迭香.mp3',
        '周杰伦 - 退后.mp3',
        '周杰伦 - 逆鳞.mp3',
        '周杰伦 - 阳光宅男.mp3',
        '周杰伦 - 青花瓷.mp3',
        '周杰伦 - 飘移.mp3',
        '周杰伦 - 麦芽糖.mp3',
        '周杰伦 - 黑色毛衣.mp3',
        '周杰伦 - 龙拳.mp3',
        '周杰伦-枫.mp3',
        '周杰伦、费玉清 - 千里之外.mp3',
        '花海.mp3',
        '霍元甲-周杰伦.mp3',
        '黑色幽默 - 周杰伦.mp3'
      ]

      songFiles.forEach(filename => {
        const parsed = parseFilename(filename)
        songs.push({
          filename,
          title: parsed.title,
          artist: parsed.artist
        })
      })

      setLibrarySongs(songs)
    } catch (error) {
      console.error('加载曲库失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 解析文件名获取歌曲信息
  const parseFilename = (filename: string): { title: string; artist: string } => {
    const nameWithoutExt = filename.replace(/\.mp3$/i, '')
    
    if (nameWithoutExt.includes(' - ')) {
      const parts = nameWithoutExt.split(' - ')
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim()
      }
    } else if (nameWithoutExt.includes('—')) {
      const parts = nameWithoutExt.split('—')
      return {
        title: parts[0].trim(),
        artist: parts[1]?.trim() || '周杰伦'
      }
    } else if (nameWithoutExt.includes('-')) {
      const parts = nameWithoutExt.split('-')
      return {
        title: parts[0].trim(),
        artist: parts[1]?.trim() || '周杰伦'
      }
    } else if (nameWithoutExt.includes('、')) {
      const parts = nameWithoutExt.split('、')
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join('、').trim()
      }
    } else {
      return {
        title: nameWithoutExt,
        artist: '周杰伦'
      }
    }
  }

  // 播放单首歌曲
  const handlePlaySong = async (song: LibrarySong) => {
    try {
      // 构建歌曲对象
      const newSong: Song = {
        id: `lib-${song.filename}`,
        title: song.title,
        artist: song.artist,
        album: '周杰伦精选集',
        duration: 0,
        cover: '',
        audioUrl: `/music_database/jay/${song.filename}`,
        source: 'local',
        quality: 'high'
      }

      // 检查是否已在播放列表中
      const existingIndex = playlist.findIndex(s => s.id === newSong.id)
      
      if (existingIndex >= 0) {
        // 如果已存在,直接播放
        playSongAtIndex(existingIndex)
      } else {
        // 添加到播放列表并播放
        addSongs([newSong])
        // 等待状态更新后播放
        setTimeout(() => {
          const newIndex = playlist.length
          playSongAtIndex(newIndex)
        }, 100)
      }
    } catch (error) {
      console.error('播放歌曲失败:', error)
    }
  }

  // 添加到播放列表
  const handleAddToPlaylist = (song: LibrarySong) => {
    const newSong: Song = {
      id: `lib-${song.filename}`,
      title: song.title,
      artist: song.artist,
      album: '周杰伦精选集',
      duration: 0,
      cover: '',
      audioUrl: `/music_database/jay/${song.filename}`,
      source: 'local',
      quality: 'high'
    }

    addSongs([newSong])
  }

  // 全部添加到播放列表
  const handleAddAll = () => {
    const songs: Song[] = librarySongs.map(song => ({
      id: `lib-${song.filename}`,
      title: song.title,
      artist: song.artist,
      album: '周杰伦精选集',
      duration: 0,
      cover: '',
      audioUrl: `/music_database/jay/${song.filename}`,
      source: 'local',
      quality: 'high'
    }))

    addSongs(songs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">加载曲库中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Music className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-text-primary">
            曲库 <span className="text-sm text-text-muted ml-2">({librarySongs.length} 首)</span>
          </h3>
        </div>
        <button
          onClick={handleAddAll}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
        >
          <Plus size={14} />
          <span>全部添加</span>
        </button>
      </div>

      {/* 歌曲列表 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {librarySongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-dim">
            <Music size={48} className="mb-3 opacity-50" />
            <p className="text-sm">曲库为空</p>
          </div>
        ) : (
          <div className="space-y-1">
            {librarySongs.map((song, index) => (
              <div
                key={song.filename}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                {/* 序号 */}
                <div className="w-8 text-center text-text-dim text-sm">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <Play 
                    size={14} 
                    className="hidden group-hover:inline-block text-primary"
                    onClick={() => handlePlaySong(song)}
                  />
                </div>

                {/* 歌曲信息 */}
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="text-sm text-text-primary truncate font-medium">
                    {song.title}
                  </div>
                  <div className="text-xs text-text-muted truncate mt-0.5">
                    {song.artist}
                  </div>
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToPlaylist(song)
                  }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                  title="添加到播放列表"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
