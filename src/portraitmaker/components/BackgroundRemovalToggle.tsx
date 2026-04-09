/** @jsxImportSource @emotion/react */
import { Switch } from "@base-ui/react/switch"
import { colors, spacing, typography } from "../../theme"

type BackgroundRemovalToggleProps = {
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly disabled?: boolean
}

export const BackgroundRemovalToggle = ({
  checked,
  onCheckedChange,
  disabled = false,
}: BackgroundRemovalToggleProps): React.ReactElement => (
  <label
    css={{
      display: "flex",
      alignItems: "center",
      gap: spacing.medium,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      css={{
        width: 42,
        height: 24,
        padding: 0,
        borderRadius: 12,
        border: "none",
        backgroundColor: colors.secondary30,
        cursor: disabled ? "default" : "pointer",
        position: "relative",
        flexShrink: 0,
        "&[data-checked]": {
          backgroundColor: colors.primary,
        },
      }}
    >
      <Switch.Thumb
        css={{
          display: "block",
          width: 18,
          height: 18,
          backgroundColor: colors.text,
          borderRadius: "50%",
          position: "absolute",
          top: 3,
          left: 3,
          transition: "transform 150ms ease",
          "[data-checked] &": {
            transform: "translateX(18px)",
          },
        }}
      />
    </Switch.Root>
    <span css={{ color: colors.text, fontSize: typography.fontSize.medium, lineHeight: 1.4 }}>
      Try to Automatically Remove Image Background
    </span>
  </label>
)
