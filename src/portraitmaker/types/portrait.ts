export const CANVAS_SIZE = 1024

// The Draw Steel VTT scales popout portrait overlays up by ~1/0.79x, making
// them too large relative to the token ring. We enlarge the ring by the same
// factor so that the character is proportionally smaller in the canvas. When
// the VTT applies its scale, the ring lands at the correct size.
export const VTT_SCALE_COMPENSATION = 1 / 0.79
export const RING_INNER_RADIUS = 236.5 * VTT_SCALE_COMPENSATION
export const RING_OUTER_RADIUS = 256.5 * VTT_SCALE_COMPENSATION

// The VTT also shifts the overlay ~1px down and ~1px left. We counter this in
// the exported image so the portrait aligns with the token ring without manual
// adjustment. (Preview stays centered — the 1px nudge is imperceptible there.)
export const VTT_OFFSET_X = 1
export const VTT_OFFSET_Y = -1
export const ARC_HALF_WIDTH_MIN = Math.PI / 12 // 15° → 30° total minimum
export const ARC_HALF_WIDTH_MAX = (11 * Math.PI) / 12 // 165° → 330° total maximum

export const DEFAULT_ARC_CENTER = -Math.PI / 2 // north
export const DEFAULT_ARC_HALF_WIDTH = Math.PI / 2 // 180° total

export type ImageState = {
  readonly image: HTMLImageElement
  readonly objectUrl: string
}

export type Transform = {
  readonly panX: number
  readonly panY: number
  readonly zoom: number
}

export type Arc = {
  readonly centerAngle: number
  readonly halfWidth: number
}

export type PortraitState = {
  readonly imageState: ImageState | null
  readonly transform: Transform
  readonly arc: Arc
}

export type PortraitAction =
  | { readonly type: 'SET_IMAGE'; readonly image: HTMLImageElement; readonly objectUrl: string }
  | { readonly type: 'SET_TRANSFORM'; readonly transform: Transform }
  | { readonly type: 'SET_ARC'; readonly arc: Arc }
  | { readonly type: 'RESET' }
