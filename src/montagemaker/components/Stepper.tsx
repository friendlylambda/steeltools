/** @jsxImportSource @emotion/react */
import { colors, spacing, typography } from "../../theme"

interface StepperProps {
  readonly value: number
  readonly onChange: (value: number) => void
  readonly min?: number
  readonly max?: number
}

const StepperButton = ({
  onClick,
  children,
}: {
  readonly onClick: () => void
  readonly children: React.ReactNode
}): React.ReactElement => (
  <button
    type="button"
    onClick={onClick}
    css={{
      width: "1.25rem",
      height: "1.25rem",
      borderRadius: "50%",
      border: `1px solid ${colors.secondary30}`,
      backgroundColor: "transparent",
      color: colors.text,
      fontSize: typography.fontSize.small,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
      "&:hover": {
        backgroundColor: colors.backgroundCard,
        borderColor: colors.secondary,
      },
    }}
  >
    {children}
  </button>
)

export const Stepper = ({ value, onChange, min, max }: StepperProps): React.ReactElement => {
  const handleDecrement = (): void => {
    const newValue = value - 1
    if (min === undefined || newValue >= min) {
      onChange(newValue)
    }
  }

  const handleIncrement = (): void => {
    const newValue = value + 1
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div css={{ display: "inline-flex", alignItems: "center", gap: spacing.small }}>
      <StepperButton onClick={handleDecrement}>−</StepperButton>
      <span
        css={{
          minWidth: "1.5rem",
          textAlign: "center",
          fontSize: typography.fontSize.medium,
          color: colors.text,
        }}
      >
        {value}
      </span>
      <StepperButton onClick={handleIncrement}>+</StepperButton>
    </div>
  )
}
