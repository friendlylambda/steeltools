/** @jsxImportSource @emotion/react */
import { Link } from '@tanstack/react-router'
import { colors, spacing, radius, typography } from '../theme'

export const HomePage = (): React.ReactElement => (
  <div css={{ padding: spacing.xlarge, maxWidth: 900, margin: '0 auto' }}>
    <h1
      css={{
        fontSize: typography.fontSize.xlarge,
        color: colors.primary,
        marginBottom: spacing.xlarge,
      }}
    >
      Steel Tools
    </h1>
    <p
      css={{
        color: colors.textDim,
        marginBottom: spacing.xlarge,
      }}
    >
      A collection of tools for the Draw Steel TTRPG.
    </p>
    <ul css={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li>
        <Link
          to="/montagemaker"
          css={{
            display: 'block',
            padding: spacing.large,
            backgroundColor: colors.backgroundCard,
            borderRadius: radius.medium,
            border: `1px solid ${colors.secondary30}`,
            textDecoration: 'none',
            color: colors.text,
            '&:hover': {
              borderColor: colors.primary30,
              backgroundColor: 'rgba(168, 180, 196, 0.08)',
            },
          }}
        >
          <div css={{ fontSize: typography.fontSize.large, color: colors.primary }}>
            Montage Maker
          </div>
          <div css={{ fontSize: typography.fontSize.small, color: colors.textDim, marginTop: spacing.small }}>
            Generate montage test configurations for the Draw Steel VTT system.
          </div>
        </Link>
      </li>
    </ul>
  </div>
)
