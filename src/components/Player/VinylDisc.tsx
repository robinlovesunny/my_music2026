import { usePlayerStore } from '../../store/playerStore'
import { Music } from 'lucide-react'

export default function VinylDisc() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const cover = currentSong?.cover

  return (
    <div className="relative w-[280px] h-[280px] select-none">
      {/* 唱片底盘 */}
      <div
        className={`w-full h-full rounded-full vinyl-spinning ${!isPlaying ? 'vinyl-paused' : ''}`}
        style={{ willChange: 'transform' }}
      >
        {/* 唱片外环 */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-1 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {/* 唱片纹路 */}
          <div className="w-full h-full rounded-full border-[3px] border-zinc-700/50 flex items-center justify-center relative overflow-hidden">
            {/* 纹路环 */}
            <div className="absolute inset-0 rounded-full border-[1px] border-zinc-700/30" style={{ margin: '15%' }} />
            <div className="absolute inset-0 rounded-full border-[1px] border-zinc-700/20" style={{ margin: '25%' }} />
            <div className="absolute inset-0 rounded-full border-[1px] border-zinc-700/30" style={{ margin: '10%' }} />

            {/* 中心封面 */}
            <div className="w-[45%] h-[45%] rounded-full overflow-hidden border-2 border-zinc-600 shadow-inner z-10">
              {cover ? (
                <img src={cover} alt="封面" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                  <Music size={32} className="text-text-dim" />
                </div>
              )}
            </div>

            {/* 中心小圆点 */}
            <div className="absolute w-3 h-3 rounded-full bg-zinc-500 z-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
