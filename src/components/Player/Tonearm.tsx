import { usePlayerStore } from '../../store/playerStore'

export default function Tonearm() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  return (
    <div className="absolute -top-2 right-[60px] z-10">
      {/* 唱针底座 */}
      <div className="w-5 h-5 rounded-full bg-zinc-600 border-2 border-zinc-500 absolute top-0 right-0 z-20 shadow-lg" />

      {/* 唱针臂 */}
      <div
        className={`tonearm ${isPlaying ? 'tonearm-down' : 'tonearm-up'}`}
        style={{ width: '120px', height: '140px' }}
      >
        {/* 唱针杆 */}
        <div className="absolute top-2 right-2 w-[3px] h-[100px] bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full origin-top rotate-[-30deg]" />
        {/* 唱针头 */}
        <div className="absolute bottom-4 left-4 w-2 h-4 bg-zinc-400 rounded-b-full" />
      </div>
    </div>
  )
}
