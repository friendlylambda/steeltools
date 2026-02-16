/** @jsxImportSource @emotion/react */
import { motion } from "motion/react"
import { Button } from "@base-ui/react/button"
import type { Challenge } from "../types/montage"
import { createDefaultChallenge } from "../utils/defaults"
import { ChallengeEditor } from "./ChallengeEditor"
import { ChallengeSummary } from "./ChallengeSummary"
import { colors, spacing, radius, typography } from "../../theme"

const ChevronUpIcon = (): React.ReactElement => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
)

const ChevronDownIcon = (): React.ReactElement => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const reorderButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  padding: 0,
  border: "none",
  borderRadius: radius.small,
  backgroundColor: "transparent",
  color: colors.textDim,
  cursor: "pointer",
  "&:hover": {
    color: colors.text,
    backgroundColor: colors.secondary30,
  },
}

interface ChallengesListProps {
  readonly value: readonly Challenge[]
  readonly onChange: (challenges: readonly Challenge[]) => void
}

export const ChallengesList = ({ value, onChange }: ChallengesListProps): React.ReactElement => {
  const handleAddChallenge = (): void => {
    onChange([...value, createDefaultChallenge()])
  }

  const handleUpdateChallenge = (index: number, challenge: Challenge): void => {
    const updated = value.map((c, i) => (i === index ? challenge : c))
    onChange(updated)
  }

  const handleDeleteChallenge = (index: number): void => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index: number): void => {
    if (index === 0) return
    const updated = value.map((c, i) => {
      if (i === index - 1) return value[index]!
      if (i === index) return value[index - 1]!
      return c
    })
    onChange(updated)
  }

  const handleMoveDown = (index: number): void => {
    if (index === value.length - 1) return
    const updated = value.map((c, i) => {
      if (i === index) return value[index + 1]!
      if (i === index + 1) return value[index]!
      return c
    })
    onChange(updated)
  }

  return (
    <div css={{ marginBottom: spacing.large }}>
      <h3
        css={{
          fontSize: typography.fontSize.large,
          color: colors.primary,
          marginBottom: spacing.medium,
        }}
      >
        Challenges
      </h3>

      <ChallengeSummary challenges={value} />

      {value.map((challenge, index) => (
        <motion.div
          key={challenge.id}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          css={{ display: "flex", alignItems: "flex-start", gap: spacing.small }}
        >
          <div
            css={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginTop: spacing.medium,
              flexShrink: 0,
            }}
          >
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                css={reorderButtonStyle}
                title="Move up"
              >
                <ChevronUpIcon />
              </button>
            )}
            {index < value.length - 1 && (
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                css={reorderButtonStyle}
                title="Move down"
              >
                <ChevronDownIcon />
              </button>
            )}
          </div>
          <div css={{ flex: 1 }}>
            <ChallengeEditor
              value={challenge}
              onChange={(updated) => handleUpdateChallenge(index, updated)}
              onDelete={() => handleDeleteChallenge(index)}
            />
          </div>
        </motion.div>
      ))}

      <Button
        onClick={handleAddChallenge}
        css={{
          padding: `${spacing.small} ${spacing.medium}`,
          fontSize: typography.fontSize.small,
          color: colors.text,
          backgroundColor: "transparent",
          border: `1px solid ${colors.secondary30}`,
          borderRadius: radius.small,
          cursor: "pointer",
          "&:hover": {
            borderColor: colors.secondary,
            backgroundColor: colors.backgroundCard,
          },
        }}
      >
        + Add Challenge
      </Button>
    </div>
  )
}
