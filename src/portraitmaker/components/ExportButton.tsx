/** @jsxImportSource @emotion/react */
import { useCallback } from 'react'
import type { Transform, Arc } from '../types/portrait'
import { downloadPortraitPng, downloadPortraitWebp } from '../utils/downloadPortrait'
import { colors, spacing, radius, typography } from '../../theme'

type ExportButtonProps = {
  readonly image: HTMLImageElement
  readonly transform: Transform
  readonly arc: Arc
  readonly hasExtraPopoutRoom: boolean
}

const buttonStyle = {
  padding: `${spacing.small} ${spacing.large}`,
  backgroundColor: colors.primary,
  color: colors.background,
  border: 'none',
  borderRadius: radius.small,
  fontSize: typography.fontSize.medium,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  '&:hover': { opacity: 0.85 },
  '&:active': { opacity: 0.7 },
} as const

export const ExportButton = ({ image, transform, arc, hasExtraPopoutRoom }: ExportButtonProps): React.ReactElement => {
  const handlePng = useCallback(() => {
    downloadPortraitPng(image, transform, arc, hasExtraPopoutRoom)
  }, [image, transform, arc, hasExtraPopoutRoom])

  const handleWebp = useCallback(() => {
    downloadPortraitWebp(image, transform, arc, hasExtraPopoutRoom)
  }, [image, transform, arc, hasExtraPopoutRoom])

  return (
    <div css={{ display: 'flex', gap: spacing.small }}>
      <button type="button" onClick={handlePng} css={buttonStyle}>
        Download PNG
      </button>
      <button type="button" onClick={handleWebp} css={buttonStyle}>
        Download WebP
      </button>
    </div>
  )
}
