interface DynamicGradientProps {
  colors?: [number, number, number][]
}

export default function DynamicGradient({ colors }: DynamicGradientProps) {
  const c1 = colors?.[0] ? `rgb(${colors[0].join(',')})` : 'rgb(0, 255, 136)'
  const c2 = colors?.[1] ? `rgb(${colors[1].join(',')})` : 'rgb(0, 204, 106)'

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-1000"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, ${c1}15, transparent 50%),
          radial-gradient(circle at 80% 70%, ${c2}10, transparent 50%),
          #1a1a1a
        `,
      }}
    />
  )
}
