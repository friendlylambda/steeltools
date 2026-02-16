/** @jsxImportSource @emotion/react */
import { Input } from '@base-ui/react/input'
import { colors, spacing, radius, typography } from '../../theme'

interface TitleInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
}

export const TitleInput = ({ value, onChange }: TitleInputProps): React.ReactElement => (
  <div css={{ marginBottom: spacing.large }}>
    <label
      css={{
        display: 'block',
        marginBottom: spacing.small,
        fontSize: typography.fontSize.small,
        color: colors.secondary,
      }}
    >
      Montage Title
    </label>
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Enter montage title..."
      css={{
        width: '100%',
        padding: spacing.medium,
        fontSize: typography.fontSize.medium,
        border: `1px solid ${colors.secondary30}`,
        borderRadius: radius.small,
        backgroundColor: colors.backgroundLight,
        color: colors.text,
        outline: 'none',
        '&::placeholder': {
          color: colors.textDim,
        },
        '&:focus': {
          borderColor: colors.primary,
        },
      }}
    />
  </div>
)
