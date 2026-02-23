import { useReducer, useCallback } from 'react'
import {
  RING_INNER_RADIUS,
  DEFAULT_ARC_CENTER,
  DEFAULT_ARC_HALF_WIDTH,
  type PortraitState,
  type PortraitAction,
  type Transform,
  type Arc,
} from '../types/portrait'

const initialState: PortraitState = {
  imageState: null,
  transform: { panX: 0, panY: 0, zoom: 1 },
  arc: { centerAngle: DEFAULT_ARC_CENTER, halfWidth: DEFAULT_ARC_HALF_WIDTH },
}

const reducer = (state: PortraitState, action: PortraitAction): PortraitState => {
  switch (action.type) {
    case 'SET_IMAGE':
      return {
        ...state,
        imageState: { image: action.image, objectUrl: action.objectUrl },
        transform: {
          panX: 0,
          panY: 0,
          zoom: (RING_INNER_RADIUS * 2) / Math.min(action.image.width, action.image.height),
        },
      }
    case 'SET_TRANSFORM':
      return { ...state, transform: action.transform }
    case 'SET_ARC':
      return { ...state, arc: action.arc }
    case 'RESET':
      return initialState
  }
}

type PortraitActions = {
  readonly loadImage: (file: File) => void
  readonly setTransform: (transform: Transform) => void
  readonly setArc: (arc: Arc) => void
  readonly reset: () => void
}

export const usePortraitState = (): readonly [PortraitState, PortraitActions] => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadImage = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      dispatch({ type: 'SET_IMAGE', image, objectUrl })
    }
    image.src = objectUrl
  }, [])

  const setTransform = useCallback((transform: Transform) => {
    dispatch({ type: 'SET_TRANSFORM', transform })
  }, [])

  const setArc = useCallback((arc: Arc) => {
    dispatch({ type: 'SET_ARC', arc })
  }, [])

  const reset = useCallback(() => {
    if (state.imageState) {
      URL.revokeObjectURL(state.imageState.objectUrl)
    }
    dispatch({ type: 'RESET' })
  }, [state.imageState])

  return [state, { loadImage, setTransform, setArc, reset }] as const
}
