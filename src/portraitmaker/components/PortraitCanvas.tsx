/** @jsxImportSource @emotion/react */
import { useRef, useEffect } from "react"
import {
  RING_OUTER_RADIUS,
  getCanvasSize,
  type Transform,
  type Arc,
} from "../types/portrait"
import { renderPreview } from "../utils/canvasRenderer"
import { useCanvasInteraction } from "../hooks/useCanvasInteraction"

const BAR_LENGTH = 56
const BAR_WIDTH = 16
const BAR_HIT_WIDTH = 48

const ROTATE_STICK_LENGTH = 84
const ROTATE_STICK_WIDTH = 6
const ROTATE_BOX_SIZE = 22
const ROTATE_HIT_WIDTH = 36

// 24×24 curved-arrow rotation cursor — Lucide RotateCcw geometry, where the
// arc flows smoothly into the arrowhead (no L-shaped polyline join).
// Black halo + white fill for contrast on any background. Hotspot 12,12.
const ROTATE_CURSOR =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='black' stroke-width='4'%3E%3Cpath d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/%3E%3Cpath d='M3 3v5h5'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='2'%3E%3Cpath d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/%3E%3Cpath d='M3 3v5h5'/%3E%3C/g%3E%3C/svg%3E\") 12 12, grab"

// 24×24 double-headed arched arrow — bidirectional drag-along-arc indicator,
// same Lucide-flowing-arrowhead style as ROTATE_CURSOR. Hotspot 12,12.
const ANGLE_HANDLE_CURSOR =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='black' stroke-width='4'%3E%3Cpath d='M3 14a9.75 9.75 0 0 1 6.74-2.74 9 9 0 0 1 4.52 0 9.75 9.75 0 0 1 6.74 2.74'/%3E%3Cpath d='M3 9v5h5'/%3E%3Cpath d='M21 9v5h-5'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='2'%3E%3Cpath d='M3 14a9.75 9.75 0 0 1 6.74-2.74 9 9 0 0 1 4.52 0 9.75 9.75 0 0 1 6.74 2.74'/%3E%3Cpath d='M3 9v5h5'/%3E%3Cpath d='M21 9v5h-5'/%3E%3C/g%3E%3C/svg%3E\") 12 12, grab"

type PortraitCanvasProps = {
  readonly image: HTMLImageElement
  readonly transform: Transform
  readonly arc: Arc
  readonly hasExtraPopoutRoom: boolean
  readonly onTransformChange: (transform: Transform) => void
  readonly onArcChange: (arc: Arc) => void
}

/**
 * Compute the two endpoints of a radial bar extending outward from the ring's outer edge.
 */
const handleBar = (angle: number, center: number): {
  readonly x1: number; readonly y1: number
  readonly x2: number; readonly y2: number
} => ({
  x1: center + RING_OUTER_RADIUS * Math.cos(angle),
  y1: center + RING_OUTER_RADIUS * Math.sin(angle),
  x2: center + (RING_OUTER_RADIUS + BAR_LENGTH) * Math.cos(angle),
  y2: center + (RING_OUTER_RADIUS + BAR_LENGTH) * Math.sin(angle),
})

export const PortraitCanvas = ({
  image,
  transform,
  arc,
  hasExtraPopoutRoom,
  onTransformChange,
  onArcChange,
}: PortraitCanvasProps): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const canvasSize = getCanvasSize(hasExtraPopoutRoom)
  const center = canvasSize / 2

  const {
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
  } = useCanvasInteraction(transform, arc, onTransformChange, onArcChange, containerRef)

  // Render preview whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      renderPreview(canvas, image, transform, arc, hasExtraPopoutRoom)
    }
  }, [image, transform, arc, hasExtraPopoutRoom])

  // Attach non-passive wheel listener
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("wheel", onCanvasWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onCanvasWheel)
  }, [onCanvasWheel])

  const startBar = handleBar(arc.centerAngle - arc.halfWidth, center)
  const endBar = handleBar(arc.centerAngle + arc.halfWidth, center)

  // Rotation handle orbits the ring's outer perimeter; rotation pivots
  // around canvas center so cursor stays locked to the handle.
  const rotateAngle = -Math.PI / 2 + transform.rotation
  const rotateDx = Math.cos(rotateAngle)
  const rotateDy = Math.sin(rotateAngle)
  const rotateAnchorX = center + RING_OUTER_RADIUS * rotateDx
  const rotateAnchorY = center + RING_OUTER_RADIUS * rotateDy
  const rotateTipX = center + (RING_OUTER_RADIUS + ROTATE_STICK_LENGTH) * rotateDx
  const rotateTipY = center + (RING_OUTER_RADIUS + ROTATE_STICK_LENGTH) * rotateDy

  return (
    <div
      ref={containerRef}
      css={{
        position: "relative",
        width: "100%",
        maxWidth: 512,
        aspectRatio: "1",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        css={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
      />
      <svg
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        css={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Arc indicator connecting bar midpoints along the clipped side */}
        <path
          d={describeClippedArcPath(arc.centerAngle, arc.halfWidth, center)}
          fill="none"
          stroke="#c9b082"
          strokeWidth={6}
        />
        {/* Start edge — invisible hit area */}
        <line
          x1={startBar.x1} y1={startBar.y1}
          x2={startBar.x2} y2={startBar.y2}
          stroke="transparent"
          strokeWidth={BAR_HIT_WIDTH}
          strokeLinecap="round"
          css={{ pointerEvents: "all", cursor: ANGLE_HANDLE_CURSOR }}
          onPointerDown={(event) => onHandlePointerDown("start", event)}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
        />
        {/* Start edge — visible bar */}
        <line
          x1={startBar.x1} y1={startBar.y1}
          x2={startBar.x2} y2={startBar.y2}
          stroke="#c9b082"
          strokeWidth={BAR_WIDTH}
          strokeLinecap="butt"
          css={{ pointerEvents: "none" }}
        />
        {/* End edge — invisible hit area */}
        <line
          x1={endBar.x1} y1={endBar.y1}
          x2={endBar.x2} y2={endBar.y2}
          stroke="transparent"
          strokeWidth={BAR_HIT_WIDTH}
          strokeLinecap="round"
          css={{ pointerEvents: "all", cursor: ANGLE_HANDLE_CURSOR }}
          onPointerDown={(event) => onHandlePointerDown("end", event)}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
        />
        {/* End edge — visible bar */}
        <line
          x1={endBar.x1} y1={endBar.y1}
          x2={endBar.x2} y2={endBar.y2}
          stroke="#c9b082"
          strokeWidth={BAR_WIDTH}
          strokeLinecap="butt"
          css={{ pointerEvents: "none" }}
        />
        {/* Rotation handle — invisible hit area (stick + box) */}
        <line
          x1={rotateAnchorX} y1={rotateAnchorY}
          x2={rotateTipX} y2={rotateTipY}
          stroke="transparent"
          strokeWidth={ROTATE_HIT_WIDTH}
          strokeLinecap="round"
          css={{ pointerEvents: "all", cursor: ROTATE_CURSOR }}
          onPointerDown={onRotateHandlePointerDown}
          onPointerMove={onRotateHandlePointerMove}
          onPointerUp={onRotateHandlePointerUp}
        />
        {/* Rotation handle — visible stick */}
        <line
          x1={rotateAnchorX} y1={rotateAnchorY}
          x2={rotateTipX} y2={rotateTipY}
          stroke="#c9b082"
          strokeWidth={ROTATE_STICK_WIDTH}
          strokeLinecap="butt"
          css={{ pointerEvents: "none" }}
        />
        {/* Rotation handle — visible box at tip, oriented along the stick */}
        <rect
          x={-ROTATE_BOX_SIZE / 2}
          y={-ROTATE_BOX_SIZE / 2}
          width={ROTATE_BOX_SIZE}
          height={ROTATE_BOX_SIZE}
          fill="#c9b082"
          stroke="#3a2f1f"
          strokeWidth={2}
          transform={`translate(${rotateTipX} ${rotateTipY}) rotate(${(rotateAngle * 180) / Math.PI})`}
          css={{ pointerEvents: "all", cursor: ROTATE_CURSOR }}
          onPointerDown={onRotateHandlePointerDown}
          onPointerMove={onRotateHandlePointerMove}
          onPointerUp={onRotateHandlePointerUp}
        />
      </svg>
    </div>
  )
}

/**
 * Build an SVG arc path along the ring midline on the clipped (non-popout) side,
 * going clockwise from the end handle back around to the start handle.
 */
const describeClippedArcPath = (centerAngle: number, halfWidth: number, center: number): string => {
  const barMid = RING_OUTER_RADIUS + BAR_LENGTH / 2
  const startAngle = centerAngle - halfWidth
  const endAngle = centerAngle + halfWidth

  // Arc goes from end → start (the long way around = clipped side)
  const x1 = center + barMid * Math.cos(endAngle)
  const y1 = center + barMid * Math.sin(endAngle)
  const x2 = center + barMid * Math.cos(startAngle)
  const y2 = center + barMid * Math.sin(startAngle)

  // The clipped side spans 2π - 2*halfWidth; it's > π when halfWidth < π/2
  const largeArc = halfWidth < Math.PI / 2 ? 1 : 0

  return `M ${x1} ${y1} A ${barMid} ${barMid} 0 ${largeArc} 1 ${x2} ${y2}`
}
