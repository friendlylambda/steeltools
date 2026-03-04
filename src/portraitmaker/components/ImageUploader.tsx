/** @jsxImportSource @emotion/react */
import { useCallback, useRef } from 'react'
import { colors, spacing, radius, typography } from '../../theme'

type ImageUploaderProps = {
  readonly onFileSelected: (file: File) => void
}

export const ImageUploader = ({ onFileSelected }: ImageUploaderProps): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        onFileSelected(file)
      }
    },
    [onFileSelected],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 512,
        aspectRatio: '1',
        border: `2px dashed ${colors.secondary30}`,
        borderRadius: radius.medium,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
        backgroundColor: colors.backgroundCard,
        '&:hover': {
          borderColor: colors.primary30,
          backgroundColor: 'rgba(168, 180, 196, 0.08)',
        },
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <div css={{ fontSize: typography.fontSize.large, color: colors.textDim, marginBottom: spacing.small }}>
        Drop an image here
      </div>
      <div css={{ fontSize: typography.fontSize.small, color: colors.textDim, marginBottom: spacing.medium }}>
        or click to browse
      </div>
      <div css={{ fontSize: typography.fontSize.small, color: colors.textDim, opacity: 0.7, textAlign: 'center', padding: `0 ${spacing.large}` }}>
        Use a PNG with a transparent background for best results
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        css={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  )
}
