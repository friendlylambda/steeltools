import { useCallback, useRef } from 'react'
import type { Transform, Arc } from '../types/portrait'
import { CANVAS_SIZE } from '../types/portrait'
import { normalizeAngle, pointerToAngle, clampHalfWidth } from '../utils/geometry'

type DragMode =
  | { readonly kind: 'pan'; readonly startPanX: number; readonly startPanY: number; readonly startClientX: number; readonly startClientY: number }
  | { readonly kind: 'edge'; readonly edge: 'start' | 'end'; readonly fixedAngle: number }

type CanvasInteractionHandlers = {
  readonly onCanvasPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasWheel: (event: WheelEvent) => void
  readonly onHandlePointerDown: (
    edge: 'start' | 'end',
    event: React.PointerEvent<SVGElement>,
  ) => void
  readonly onHandlePointerMove: (event: React.PointerEvent<SVGElement>) => void
  readonly onHandlePointerUp: (event: React.PointerEvent<SVGElement>) => void
}

/**
 * Compute the element-relative scale factor when the canvas element
 * is CSS-sized differently from its internal resolution.
 */
const getScale = (element: HTMLCanvasElement): number =>
  CANVAS_SIZE / element.getBoundingClientRect().width

/**
 * Given a moving edge angle and a fixed opposite edge angle, derive the
 * new arc center and half-width. The arc spans from startAngle to endAngle
 * in the positive (counter-clockwise in math, clockwise on screen) direction.
 */
const deriveArc = (edge: 'start' | 'end', movingAngle: number, fixedAngle: number): Arc => {
  const startAngle = edge === 'start' ? movingAngle : fixedAngle
  const endAngle = edge === 'end' ? movingAngle : fixedAngle

  // Compute span in the positive direction from start to end
  const rawSpan = endAngle - startAngle
  const span = rawSpan < 0 ? rawSpan + 2 * Math.PI : rawSpan
  const halfWidth = clampHalfWidth(span / 2)

  // Re-derive center from the fixed edge after clamping
  const centerAngle = edge === 'start'
    ? normalizeAngle(fixedAngle - halfWidth)
    : normalizeAngle(fixedAngle + halfWidth)

  return { centerAngle, halfWidth }
}

export const useCanvasInteraction = (
  transform: Transform,
  arc: Arc,
  onTransformChange: (transform: Transform) => void,
  onArcChange: (arc: Arc) => void,
  containerRef: React.RefObject<HTMLDivElement | null>,
): CanvasInteractionHandlers => {
  const dragRef = useRef<DragMode | null>(null)

  const onCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = {
        kind: 'pan',
        startPanX: transform.panX,
        startPanY: transform.panY,
        startClientX: event.clientX,
        startClientY: event.clientY,
      }
    },
    [transform.panX, transform.panY],
  )

  const onCanvasPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      if (!drag || drag.kind !== 'pan') return

      const scale = getScale(event.currentTarget)
      const deltaX = (event.clientX - drag.startClientX) * scale
      const deltaY = (event.clientY - drag.startClientY) * scale

      onTransformChange({
        ...transform,
        panX: drag.startPanX + deltaX,
        panY: drag.startPanY + deltaY,
      })
    },
    [transform, onTransformChange],
  )

  const onCanvasPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.currentTarget.releasePointerCapture(event.pointerId)
      dragRef.current = null
    },
    [],
  )

  const onCanvasWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      const factor = Math.pow(0.999, event.deltaY)
      const newZoom = Math.max(0.01, transform.zoom * factor)
      onTransformChange({ ...transform, zoom: newZoom })
    },
    [transform, onTransformChange],
  )

  const onHandlePointerDown = useCallback(
    (
      edge: 'start' | 'end',
      event: React.PointerEvent<SVGElement>,
    ) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      event.stopPropagation()

      // The opposite edge stays fixed while this one moves
      const fixedAngle = edge === 'start'
        ? arc.centerAngle + arc.halfWidth // end stays fixed
        : arc.centerAngle - arc.halfWidth // start stays fixed

      dragRef.current = { kind: 'edge', edge, fixedAngle }
    },
    [arc.centerAngle, arc.halfWidth],
  )

  const onHandlePointerMove = useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      const drag = dragRef.current
      if (!drag || drag.kind !== 'edge') return

      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const movingAngle = pointerToAngle(event.clientX, event.clientY, rect)

      onArcChange(deriveArc(drag.edge, movingAngle, drag.fixedAngle))
    },
    [onArcChange, containerRef],
  )

  const onHandlePointerUp = useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      event.currentTarget.releasePointerCapture(event.pointerId)
      dragRef.current = null
    },
    [],
  )

  return {
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onCanvasWheel,
    onHandlePointerDown,
    onHandlePointerMove,
    onHandlePointerUp,
  }
}
