import { useState, useRef, useEffect } from 'react'
import { Gauge } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import type { Quality } from '../../types/player'

const qualityOptions: { value: Quality; label: string; desc: string }[] = [
  { value: 'standard', label: '标准', desc: '128kbps' },
  { value: 'high', label: '高品质', desc: '320kbps' },
  { value: 'extreme', label: '极高', desc: '无损' },
]

export default function QualitySelector() {
  const quality = usePlayerStore((s) => s.quality)
  const setQuality = usePlayerStore((s) => s.setQuality)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLabel = qualityOptions.find(q => q.value === quality)?.label ?? '标准'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-primary rounded-md hover:bg-white/5 transition-colors"
        title="音质选择"
      >
        <Gauge size={14} />
        <span>{currentLabel}</span>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setQuality(opt.value); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                quality === opt.value
                  ? 'text-primary bg-primary/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <span>{opt.label}</span>
              <span className="text-xs text-text-dim">{opt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
