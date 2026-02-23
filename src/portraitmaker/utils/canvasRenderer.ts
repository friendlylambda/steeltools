import {
  CANVAS_SIZE,
  RING_INNER_RADIUS,
  RING_OUTER_RADIUS,
  VTT_OFFSET_X,
  VTT_OFFSET_Y,
  type Transform,
  type Arc,
} from '../types/portrait'
import { createMaskPath } from './geometry'

const CENTER = CANVAS_SIZE / 2

/**
 * Draw the full token ring as a complete circle. In the preview this is
 * rendered BEFORE the clipped image so the character visibly pops over
 * the ring in the arc region — matching how it looks on a VTT token.
 */
const drawTokenRing = (ctx: CanvasRenderingContext2D): void => {
  // Conic gradient for metallic sheen — highlights rotate around the ring
  const conic = ctx.createConicGradient(0, CENTER, CENTER)
  conic.addColorStop(0, '#b0b0b0')
  conic.addColorStop(0.15, '#e8e8e8')
  conic.addColorStop(0.3, '#a0a0a0')
  conic.addColorStop(0.5, '#d8d8d8')
  conic.addColorStop(0.65, '#909090')
  conic.addColorStop(0.8, '#e0e0e0')
  conic.addColorStop(1, '#b0b0b0')

  // Radial gradient for inner bevel / depth
  const radial = ctx.createRadialGradient(
    CENTER, CENTER, RING_INNER_RADIUS,
    CENTER, CENTER, RING_OUTER_RADIUS,
  )
  radial.addColorStop(0, 'rgba(0, 0, 0, 0.25)')
  radial.addColorStop(0.15, 'rgba(0, 0, 0, 0)')
  radial.addColorStop(0.85, 'rgba(0, 0, 0, 0)')
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.3)')

  ctx.save()
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RING_OUTER_RADIUS, 0, Math.PI * 2)
  ctx.arc(CENTER, CENTER, RING_INNER_RADIUS, 0, Math.PI * 2, true)

  // Base metallic fill
  ctx.fillStyle = conic
  ctx.fill()

  // Bevel overlay for depth at edges
  ctx.fillStyle = radial
  ctx.fill()

  ctx.restore()
}

/**
 * Draw the character image clipped to the mask region.
 */
const drawClippedImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: Transform,
  arc: Arc,
): void => {
  const mask = createMaskPath(arc.centerAngle, arc.halfWidth)

  ctx.save()
  ctx.clip(mask)

  const drawWidth = image.width * transform.zoom
  const drawHeight = image.height * transform.zoom
  const drawX = CENTER + transform.panX - drawWidth / 2
  const drawY = CENTER + transform.panY - drawHeight / 2

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  ctx.restore()
}

/**
 * Render the full preview (clipped image + ring overlay) onto the given canvas.
 */
export const renderPreview = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: Transform,
  arc: Arc,
): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawTokenRing(ctx)
  drawClippedImage(ctx, image, transform, arc)
}

/**
 * Render the export image (clipped image only, no ring) onto the given canvas.
 * Returns the canvas for downstream PNG encoding.
 */
export const renderExport = (
  image: HTMLImageElement,
  transform: Transform,
  arc: Arc,
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.translate(VTT_OFFSET_X, VTT_OFFSET_Y)
  drawClippedImage(ctx, image, transform, arc)
  return canvas
}
