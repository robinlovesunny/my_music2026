interface DynamicGradientProps {
  colors?: [number, number, number][]
}

export default function DynamicGradient({ colors }: DynamicGradientProps) {
  const c1 = colors?.[0] ? `rgb(${colors[0].join(',')})` : 'rgb(0, 255, 136)'
  const c2 = colors?.[1] ? `rgb(${colors[1].join(',')})` : 'rgb(0, 204, 106)'

  return (
    <>
      {/* 主背景渐变 */}
      <div
        className="fixed inset-0 -z-10 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, ${c1}20, transparent 60%),
            radial-gradient(circle at 80% 70%, ${c2}15, transparent 60%),
            radial-gradient(circle at 50% 50%, ${c1}08, transparent 70%),
            #1a1a1a
          `,
        }}
      />
      
      {/* 几何装饰层 */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-primary/30 rounded-full" />
        <div className="absolute bottom-32 right-32 w-80 h-80 border border-primary/20 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 border border-primary/15 rotate-45" />
      </div>

      {/* 噪点纹理 */}
      <div 
        className="fixed inset-0 -z-10 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}
