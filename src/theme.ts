export const colors = {
  // Steel & Parchment theme
  background: '#0c1014',
  backgroundLight: '#141a20',
  backgroundCard: 'rgba(168, 180, 196, 0.05)',

  primary: '#d4b478',
  primaryLight: '#e4c898',

  secondary: '#c2cdd8',
  secondaryLight: '#dae0e8',
  secondaryDim: '#96a4b4',

  text: '#dedad4',
  textDim: '#a8a49c',

  success: 'hsl(160, 45%, 35%)', // teal-green, used for distribution tables & victory buttons
  danger: '#c75050',

  // Derived (for borders, subtle backgrounds)
  primary10: 'color-mix(in srgb, #d4b478 10%, transparent)',
  primary20: 'color-mix(in srgb, #d4b478 20%, transparent)',
  primary30: 'color-mix(in srgb, #d4b478 30%, transparent)',
  secondary10: 'color-mix(in srgb, #c2cdd8 10%, transparent)',
  secondary20: 'color-mix(in srgb, #c2cdd8 20%, transparent)',
  secondary30: 'color-mix(in srgb, #c2cdd8 30%, transparent)',
} as const

export const spacing = {
  xsmall: '0.25rem',
  small: '0.5rem',
  medium: '1rem',
  large: '1.5rem',
  xlarge: '2rem',
} as const

export const radius = {
  small: '0.5rem',
  medium: '0.75rem',
} as const

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontMono: 'ui-monospace, "SF Mono", Menlo, monospace',
  fontSize: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '2rem',
  },
  lineHeight: 1.6,
} as const

// Fixed segment colors - tuned for readability with light text
const segmentColors = [
  'hsl(160, 45%, 35%)', // teal-green (darker)
  'hsl(220, 45%, 50%)', // blue
  'hsl(280, 40%, 50%)', // purple
  'hsl(340, 45%, 50%)', // magenta/pink
  'hsl(190, 50%, 40%)', // cyan (darker)
  'hsl(260, 40%, 45%)', // violet
] as const

export const generateSegmentColor = (index: number): string =>
  segmentColors[index % segmentColors.length] ?? segmentColors[0]
