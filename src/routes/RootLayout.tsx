/** @jsxImportSource @emotion/react */
import { Outlet } from '@tanstack/react-router'
import { colors, typography } from '../theme'

export const RootLayout = (): React.ReactElement => (
  <div
    css={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundLight} 100%)`,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize.medium,
      lineHeight: typography.lineHeight,
      color: colors.text,
    }}
  >
    <Outlet />
  </div>
)
