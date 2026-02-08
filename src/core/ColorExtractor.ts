export async function extractColors(imageUrl: string): Promise<[number, number, number][]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = async () => {
      try {
        const { default: ColorThief } = await import('colorthief')
        const ct = new ColorThief()
        const palette = ct.getPalette(img, 3) as [number, number, number][]
        resolve(palette)
      } catch {
        resolve([[0, 255, 136], [0, 204, 106], [26, 26, 26]])
      }
    }
    img.onerror = () => {
      resolve([[0, 255, 136], [0, 204, 106], [26, 26, 26]])
    }
    img.src = imageUrl
  })
}

export function rgbToString(rgb: [number, number, number], alpha = 1): string {
  return alpha < 1
    ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
    : `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}
