import VinylDisc from './VinylDisc'
import Tonearm from './Tonearm'

export default function VinylSection() {
  return (
    <div className="relative flex items-center justify-center py-8">
      <Tonearm />
      <VinylDisc />
    </div>
  )
}
