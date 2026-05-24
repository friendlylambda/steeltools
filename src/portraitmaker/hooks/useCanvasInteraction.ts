import { useCallback, useRef } from "react"
import type { Transform, Arc } from "../types/portrait"
import { normalizeAngle, pointerToAngle, clampHalfWidth, snapRotation } from "../utils/geometry"

type DragMode =
  | {
      readonly kind: "pan"
      readonly startPanX: number
      readonly startPanY: number
      readonly startClientX: number
      readonly startClientY: number
    }
  | { readonly kind: "edge"; readonly edge: "start" | "end"; readonly fixedAngle: number }
  | {
      readonly kind: "rotate"
      readonly startRotation: number
      readonly startPointerAngle: number
      readonly pivotClientX: number
      readonly pivotClientY: number
    }

type CanvasInteractionHandlers = {
  readonly onCanvasPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void
  readonly onCanvasWheel: (event: WheelEvent) => void
  readonly onHandlePointerDown: (
    edge: "start" | "end",
    event: React.PointerEvent<SVGElement>,
  ) => void
  readonly onHandlePointerMove: (event: React.PointerEvent<SVGElement>) => void
  readonly onHandlePointerUp: (event: React.PointerEvent<SVGElement>) => void
  readonly onRotateHandlePointerDown: (event: React.PointerEvent<SVGElement>) => void
  readonly onRotateHandlePointerMove: (event: React.PointerEvent<SVGElement>) => void
  readonly onRotateHandlePointerUp: (event: React.PointerEvent<SVGElement>) => void
}

const getScale = (element: HTMLCanvasElement): number =>
  element.width / element.getBoundingClientRect().width

const deriveArc = (edge: "start" | "end", movingAngle: number, fixedAngle: number): Arc => {
  const startAngle = edge === "start" ? movingAngle : fixedAngle
  const endAngle = edge === "end" ? movingAngle : fixedAngle

  const rawSpan = endAngle - startAngle
  const span = rawSpan < 0 ? rawSpan + 2 * Math.PI : rawSpan
  const halfWidth = clampHalfWidth(span / 2)

  const centerAngle =
    edge === "start"
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

  // Mirror props into refs so handlers can read the latest values
  // without re-creating on every transform/arc change.
  const transformRef = useRef(transform)
  transformRef.current = transform
  const arcRef = useRef(arc)
  arcRef.current = arc

  const onCanvasPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      kind: "pan",
      startPanX: transformRef.current.panX,
      startPanY: transformRef.current.panY,
      startClientX: event.clientX,
      startClientY: event.clientY,
    }
  }, [])

  const onCanvasPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      if (!drag || drag.kind !== "pan") return

      const scale = getScale(event.currentTarget)
      const screenDeltaX = (event.clientX - drag.startClientX) * scale
      const screenDeltaY = (event.clientY - drag.startClientY) * scale

      // Pan is stored in the image's local frame, but the user's drag is in
      // screen space. Apply the inverse rotation so a rightward drag always
      // moves the image right on screen.
      const cosR = Math.cos(transformRef.current.rotation)
      const sinR = Math.sin(transformRef.current.rotation)
      const localDeltaX = cosR * screenDeltaX + sinR * screenDeltaY
      const localDeltaY = -sinR * screenDeltaX + cosR * screenDeltaY

      onTransformChange({
        ...transformRef.current,
        panX: drag.startPanX + localDeltaX,
        panY: drag.startPanY + localDeltaY,
      })
    },
    [onTransformChange],
  )

  const onCanvasPointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }, [])

  const onCanvasWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      const factor = Math.pow(0.999, event.deltaY)
      const newZoom = Math.max(0.01, transformRef.current.zoom * factor)
      onTransformChange({ ...transformRef.current, zoom: newZoom })
    },
    [onTransformChange],
  )

  const onHandlePointerDown = useCallback(
    (edge: "start" | "end", event: React.PointerEvent<SVGElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      event.stopPropagation()

      const currentArc = arcRef.current
      const fixedAngle =
        edge === "start"
          ? currentArc.centerAngle + currentArc.halfWidth
          : currentArc.centerAngle - currentArc.halfWidth

      dragRef.current = { kind: "edge", edge, fixedAngle }
    },
    [],
  )

  const onHandlePointerMove = useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      const drag = dragRef.current
      if (!drag || drag.kind !== "edge") return

      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const movingAngle = pointerToAngle(event.clientX, event.clientY, rect)

      onArcChange(deriveArc(drag.edge, movingAngle, drag.fixedAngle))
    },
    [onArcChange, containerRef],
  )

  const onHandlePointerUp = useCallback((event: React.PointerEvent<SVGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }, [])

  const onRotateHandlePointerDown = useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      event.stopPropagation()

      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()

      // Pivot is the canvas/ring center in client coords — rotation spins
      // the whole composition around this point.
      const pivotClientX = rect.left + rect.width / 2
      const pivotClientY = rect.top + rect.height / 2

      dragRef.current = {
        kind: "rotate",
        startRotation: transformRef.current.rotation,
        startPointerAngle: Math.atan2(
          event.clientY - pivotClientY,
          event.clientX - pivotClientX,
        ),
        pivotClientX,
        pivotClientY,
      }
    },
    [containerRef],
  )

  const onRotateHandlePointerMove = useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      const drag = dragRef.current
      if (!drag || drag.kind !== "rotate") return

      const currentAngle = Math.atan2(
        event.clientY - drag.pivotClientY,
        event.clientX - drag.pivotClientX,
      )
      const delta = currentAngle - drag.startPointerAngle
      const rawRotation = drag.startRotation + delta
      const rotation = event.shiftKey ? snapRotation(rawRotation) : rawRotation

      onTransformChange({ ...transformRef.current, rotation: normalizeAngle(rotation) })
    },
    [onTransformChange],
  )

  const onRotateHandlePointerUp = useCallback((event: React.PointerEvent<SVGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }, [])

  return {
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onCanvasWheel,
    onHandlePointerDown,
    onHandlePointerMove,
    onHandlePointerUp,
    onRotateHandlePointerDown,
    onRotateHandlePointerMove,
    onRotateHandlePointerUp,
  }
}
