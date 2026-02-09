import { Music, Sparkles, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface HomePageProps {
  onOpenLibrary: () => void
}

export default function HomePage({ onOpenLibrary }: HomePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 轻柔粒子背景
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`
        ctx.fill()

        particles.forEach(other => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.06 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* 粒子画布 */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* 柔和背景光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[160px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* 标题 - 轻盈简洁 */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-primary/40" />
            <Sparkles className="text-primary/60" size={12} />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-4 tracking-wide">
            <span className="font-light text-text-secondary">欢迎使用</span>
            <span className="text-primary ml-2" style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}>QoMusic</span>
          </h1>

          <p className="text-text-dim text-xs tracking-widest">选择一种方式开始</p>
        </div>

        {/* 选项卡片 - 小而精致 */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* 曲库卡片 */}
          <button
            onClick={onOpenLibrary}
            className="group w-full flex items-center gap-5 px-6 py-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-primary/15 hover:border-primary/40 transition-all duration-500 text-left hover:bg-white/[0.06]"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-400">
              <Music className="text-primary" size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-text-primary mb-0.5 group-hover:text-primary transition-colors duration-300">
                浏览曲库
              </h2>
              <p className="text-text-dim text-xs">
                周杰伦精选 · <span className="text-primary/70">88 首</span>
              </p>
            </div>

            <ChevronRight size={16} className="text-text-dim group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
          </button>


        </div>

        {/* 底部快捷键提示 - 极简 */}
        <div className="text-center mt-14 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-text-dim/50 text-[10px] tracking-wider">
            空格 播放 · ← → 切歌 · ↑ ↓ 音量
          </p>
        </div>
      </div>
    </div>
  )
}
