import {
  CANVAS_SIZE,
  RING_INNER_RADIUS,
  ARC_HALF_WIDTH_MIN,
  ARC_HALF_WIDTH_MAX,
} from '../types/portrait'

const CENTER = CANVAS_SIZE / 2
/** Distance from center to canvas corner — used as the wedge outer radius */
const WEDGE_RADIUS = Math.sqrt(CENTER * CENTER + CENTER * CENTER)

/**
 * Normalise an angle into the range [-PI, PI).
 */
export const normalizeAngle = (angle: number): number => {
  const twoPi = 2 * Math.PI
  const result = ((angle % twoPi) + twoPi) % twoPi
  return result >= Math.PI ? result - twoPi : result
}

/**
 * Build a Path2D that is the union of:
 *   1. The full inner circle (everything inside the ring)
 *   2. An angular wedge from the center outward at the popout arc
 *
 * Used as a clip path so the character image shows through both regions.
 */
export const createMaskPath = (
  centerAngle: number,
  halfWidth: number,
): Path2D => {
  const path = new Path2D()

  // Sub-path 1: full inner circle
  path.arc(CENTER, CENTER, RING_INNER_RADIUS, 0, Math.PI * 2)

  // Sub-path 2: sector wedge from center to canvas edge
  const startAngle = centerAngle - halfWidth
  const endAngle = centerAngle + halfWidth

  path.moveTo(CENTER, CENTER)
  path.lineTo(
    CENTER + WEDGE_RADIUS * Math.cos(startAngle),
    CENTER + WEDGE_RADIUS * Math.sin(startAngle),
  )
  path.arc(CENTER, CENTER, WEDGE_RADIUS, startAngle, endAngle)
  path.lineTo(CENTER, CENTER)
  path.closePath()

  return path
}

/**
 * Convert a pointer event position (relative to an element) to an angle
 * from the element's visual center.
 */
export const pointerToAngle = (clientX: number, clientY: number, rect: DOMRect): number =>
  Math.atan2(clientY - rect.top - rect.height / 2, clientX - rect.left - rect.width / 2)

/**
 * Clamp halfWidth within allowed bounds.
 */
export const clampHalfWidth = (halfWidth: number): number =>
  Math.max(ARC_HALF_WIDTH_MIN, Math.min(ARC_HALF_WIDTH_MAX, halfWidth))
