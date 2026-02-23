/** @jsxImportSource @emotion/react */
import { useRef, useEffect } from "react"
import {
  CANVAS_SIZE,
  RING_OUTER_RADIUS,
  type Transform,
  type Arc,
} from "../types/portrait"
import { renderPreview } from "../utils/canvasRenderer"
import { useCanvasInteraction } from "../hooks/useCanvasInteraction"

const CENTER = CANVAS_SIZE / 2
const BAR_LENGTH = 56
const BAR_WIDTH = 16
const BAR_HIT_WIDTH = 48

type PortraitCanvasProps = {
  readonly image: HTMLImageElement
  readonly transform: Transform
  readonly arc: Arc
  readonly onTransformChange: (transform: Transform) => void
  readonly onArcChange: (arc: Arc) => void
}

/**
 * Compute the two endpoints of a radial bar extending outward from the ring's outer edge.
 */
const handleBar = (angle: number): {
  readonly x1: number; readonly y1: number
  readonly x2: number; readonly y2: number
} => ({
  x1: CENTER + RING_OUTER_RADIUS * Math.cos(angle),
  y1: CENTER + RING_OUTER_RADIUS * Math.sin(angle),
  x2: CENTER + (RING_OUTER_RADIUS + BAR_LENGTH) * Math.cos(angle),
  y2: CENTER + (RING_OUTER_RADIUS + BAR_LENGTH) * Math.sin(angle),
})

export const PortraitCanvas = ({
  image,
  transform,
  arc,
  onTransformChange,
  onArcChange,
}: PortraitCanvasProps): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onCanvasWheel,
    onHandlePointerDown,
    onHandlePointerMove,
    onHandlePointerUp,
  } = useCanvasInteraction(transform, arc, onTransformChange, onArcChange, containerRef)

  // Render preview whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      renderPreview(canvas, image, transform, arc)
    }
  }, [image, transform, arc])

  // Attach non-passive wheel listener
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("wheel", onCanvasWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onCanvasWheel)
  }, [onCanvasWheel])

  const startBar = handleBar(arc.centerAngle - arc.halfWidth)
  const endBar = handleBar(arc.centerAngle + arc.halfWidth)

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
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
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
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
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
          d={describeClippedArcPath(arc.centerAngle, arc.halfWidth)}
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
          css={{ pointerEvents: "all", cursor: "grab", "&:active": { cursor: "grabbing" } }}
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
          css={{ pointerEvents: "all", cursor: "grab", "&:active": { cursor: "grabbing" } }}
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
      </svg>
    </div>
  )
}

/**
 * Build an SVG arc path along the ring midline on the clipped (non-popout) side,
 * going clockwise from the end handle back around to the start handle.
 */
const describeClippedArcPath = (centerAngle: number, halfWidth: number): string => {
  const barMid = RING_OUTER_RADIUS + BAR_LENGTH / 2
  const startAngle = centerAngle - halfWidth
  const endAngle = centerAngle + halfWidth

  // Arc goes from end → start (the long way around = clipped side)
  const x1 = CENTER + barMid * Math.cos(endAngle)
  const y1 = CENTER + barMid * Math.sin(endAngle)
  const x2 = CENTER + barMid * Math.cos(startAngle)
  const y2 = CENTER + barMid * Math.sin(startAngle)

  // The clipped side spans 2π - 2*halfWidth; it's > π when halfWidth < π/2
  const largeArc = halfWidth < Math.PI / 2 ? 1 : 0

  return `M ${x1} ${y1} A ${barMid} ${barMid} 0 ${largeArc} 1 ${x2} ${y2}`
}
