import { colors, spacing, radius, typography } from "../../theme"

export const toggleButtonStyle = (isLast: boolean) => ({
  padding: `${spacing.small} ${spacing.medium}`,
  border: "none",
  borderRight: isLast ? "none" : `1px solid ${colors.secondary}`,
  backgroundColor: "transparent",
  color: colors.secondary,
  fontSize: typography.fontSize.small,
  cursor: "pointer",
  "&[data-pressed]": {
    backgroundColor: colors.secondary30,
    color: colors.text,
  },
  "&:hover:not([data-pressed])": {
    backgroundColor: colors.backgroundCard,
  },
})

export const toggleGroupStyle = {
  display: "flex",
  gap: 0,
  border: `1px solid ${colors.secondary}`,
  borderRadius: radius.small,
  overflow: "hidden",
}
