import type { Transform, Arc } from '../types/portrait'
import { renderExport } from './canvasRenderer'

/**
 * Render the portrait to an offscreen canvas and trigger a PNG download.
 */
export const downloadPortraitPng = (
  image: HTMLImageElement,
  transform: Transform,
  arc: Arc,
): void => {
  const canvas = renderExport(image, transform, arc)

  canvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'popout-portrait.png'
    anchor.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
