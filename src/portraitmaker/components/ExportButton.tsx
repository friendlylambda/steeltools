/** @jsxImportSource @emotion/react */
import { useCallback } from 'react'
import type { Transform, Arc } from '../types/portrait'
import { downloadPortraitPng } from '../utils/exportPng'
import { colors, spacing, radius, typography } from '../../theme'

type ExportButtonProps = {
  readonly image: HTMLImageElement
  readonly transform: Transform
  readonly arc: Arc
}

export const ExportButton = ({ image, transform, arc }: ExportButtonProps): React.ReactElement => {
  const handleClick = useCallback(() => {
    downloadPortraitPng(image, transform, arc)
  }, [image, transform, arc])

  return (
    <button
      type="button"
      onClick={handleClick}
      css={{
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
      }}
    >
      Download Image
    </button>
  )
}
