export interface CardConfig {
  lyrics: string[]
  mood: string
  songTitle: string
  artist: string
  width?: number
  height?: number
}

/**
 * 在Canvas上绘制歌词心情卡片
 * 返回 Canvas 元素
 */
export function drawLyricCard(config: CardConfig): HTMLCanvasElement {
  const {
    lyrics,
    mood,
    songTitle,
    artist,
    width = 1080,
    height = 1920,
  } = config

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const scale = width / 1080

  // 1. 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(0.3, '#0d1a12')
  gradient.addColorStop(0.5, '#0a1f10')
  gradient.addColorStop(0.7, '#0d1a12')
  gradient.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 2. 绘制装饰光晕
  const glow1 = ctx.createRadialGradient(
    width * 0.3, height * 0.3, 0,
    width * 0.3, height * 0.3, width * 0.6
  )
  glow1.addColorStop(0, 'rgba(0, 255, 136, 0.08)')
  glow1.addColorStop(1, 'transparent')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, width, height)

  const glow2 = ctx.createRadialGradient(
    width * 0.7, height * 0.7, 0,
    width * 0.7, height * 0.7, width * 0.5
  )
  glow2.addColorStop(0, 'rgba(0, 204, 106, 0.06)')
  glow2.addColorStop(1, 'transparent')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, width, height)

  // 3. 绘制顶部装饰线条
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(width * 0.15, height * 0.12)
  ctx.lineTo(width * 0.85, height * 0.12)
  ctx.stroke()

  // 4. 绘制音符图标
  ctx.font = `${48 * scale}px Arial`
  ctx.fillStyle = 'rgba(0, 255, 136, 0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('♪', width / 2, height * 0.17)

  // 5. 绘制歌词文本
  const lyricFontSize = lyrics.length > 3 ? 42 * scale : 48 * scale
  ctx.font = `300 ${lyricFontSize}px "PingFang SC", "Microsoft YaHei", Arial, sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'

  const lyricStartY = height * 0.3
  const lyricLineHeight = lyricFontSize * 2.2

  lyrics.forEach((line, i) => {
    // 每行歌词添加引号效果
    const displayText = line.trim()
    if (displayText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fillText(`"${displayText}"`, width / 2, lyricStartY + i * lyricLineHeight)
    }
  })

  // 6. 绘制分隔线
  const dividerY = lyricStartY + lyrics.length * lyricLineHeight + 60 * scale
  const dividerGradient = ctx.createLinearGradient(width * 0.25, 0, width * 0.75, 0)
  dividerGradient.addColorStop(0, 'transparent')
  dividerGradient.addColorStop(0.2, 'rgba(0, 255, 136, 0.4)')
  dividerGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.6)')
  dividerGradient.addColorStop(0.8, 'rgba(0, 255, 136, 0.4)')
  dividerGradient.addColorStop(1, 'transparent')

  ctx.strokeStyle = dividerGradient
  ctx.lineWidth = 1.5 * scale
  ctx.beginPath()
  ctx.moveTo(width * 0.25, dividerY)
  ctx.lineTo(width * 0.75, dividerY)
  ctx.stroke()

  // 分隔线两侧装饰
  ctx.fillStyle = 'rgba(0, 255, 136, 0.5)'
  ctx.font = `${14 * scale}px Arial`
  ctx.fillText('── 此刻心情 ──', width / 2, dividerY - 15 * scale)

  // 7. 绘制心情文本
  if (mood) {
    const moodY = dividerY + 80 * scale
    ctx.font = `italic 300 ${38 * scale}px "PingFang SC", "Microsoft YaHei", Arial, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.textAlign = 'center'

    // 自动换行
    const maxWidth = width * 0.7
    const words = mood.split('')
    let currentLine = ''
    const moodLines: string[] = []

    for (const char of words) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        moodLines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) moodLines.push(currentLine)

    moodLines.forEach((line, i) => {
      ctx.fillText(`"${line}"`, width / 2, moodY + i * (44 * scale))
    })
  }

  // 8. 绘制底部歌曲信息
  const bottomY = height * 0.85

  // 底部分隔线
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(width * 0.3, bottomY - 40 * scale)
  ctx.lineTo(width * 0.7, bottomY - 40 * scale)
  ctx.stroke()

  // 歌名
  ctx.font = `500 ${32 * scale}px "PingFang SC", "Microsoft YaHei", Arial, sans-serif`
  ctx.fillStyle = 'rgba(0, 255, 136, 0.8)'
  ctx.textAlign = 'center'
  ctx.fillText(songTitle, width / 2, bottomY)

  // 歌手
  ctx.font = `300 ${26 * scale}px "PingFang SC", "Microsoft YaHei", Arial, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText(artist, width / 2, bottomY + 45 * scale)

  // 9. 水印
  ctx.font = `${16 * scale}px "Microsoft YaHei", Arial, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.fillText('仅供学习交流 · QoMusic', width / 2, height * 0.95)

  return canvas
}

/**
 * 将Canvas转换为Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas转换失败'))
      },
      'image/png',
      1.0
    )
  })
}

/**
 * 下载卡片为PNG文件
 */
export async function downloadCard(
  config: CardConfig,
  filename?: string
): Promise<void> {
  const canvas = drawLyricCard(config)
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${config.songTitle}-心情卡片-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
