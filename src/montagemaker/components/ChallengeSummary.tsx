/** @jsxImportSource @emotion/react */
import { Tooltip } from "@base-ui/react/tooltip"
import type { Challenge, Characteristic } from "../types/montage"
import {
  CHARACTERISTICS,
  getSkillCategory,
  SKILL_CATEGORIES,
  type SkillCategory,
} from "../constants/drawSteel"
import { colors, spacing, radius, typography, generateSegmentColor } from "../../theme"

interface ChallengeSummaryProps {
  readonly challenges: readonly Challenge[]
}

interface StackedBarSegment {
  readonly label: string
  readonly count: number
  readonly percentage: number
}

const computeSkillCounts = (challenges: readonly Challenge[]): Map<string, number> => {
  const counts = new Map<string, number>()
  for (const challenge of challenges) {
    for (const skill of challenge.suggestedSkills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1)
    }
  }
  return counts
}

const computeCategoryCounts = (skillCounts: Map<string, number>): Map<SkillCategory, number> => {
  const counts = new Map<SkillCategory, number>()
  for (const [skill, count] of skillCounts) {
    const category = getSkillCategory(skill)
    if (category) {
      counts.set(category, (counts.get(category) ?? 0) + count)
    }
  }
  return counts
}

const computeCharacteristicCounts = (
  challenges: readonly Challenge[],
): Map<Characteristic, number> => {
  const counts = new Map<Characteristic, number>()
  for (const challenge of challenges) {
    for (const char of challenge.suggestedCharacteristics) {
      counts.set(char, (counts.get(char) ?? 0) + 1)
    }
  }
  return counts
}

const toSegments = <T extends string>(counts: Map<T, number>): StackedBarSegment[] => {
  const total = Array.from(counts.values()).reduce((sum, n) => sum + n, 0)
  if (total === 0) return []
  return Array.from(counts.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

interface StackedBarProps {
  readonly segments: readonly StackedBarSegment[]
  readonly label: string
}

const StackedBar = ({ segments, label }: StackedBarProps): React.ReactElement | null => {
  if (segments.length === 0) return null

  return (
    <div css={{ marginBottom: spacing.medium }}>
      <div
        css={{
          fontSize: typography.fontSize.small,
          color: colors.textDim,
          marginBottom: spacing.xsmall,
        }}
      >
        {label}
      </div>
      <div
        css={{
          display: "flex",
          height: 24,
          borderRadius: radius.small,
          overflow: "hidden",
        }}
      >
        {segments.map((segment, index) => (
          <Tooltip.Provider key={segment.label} delay={0} closeDelay={0}>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={<div />}
                css={{
                  flex: segment.percentage,
                  backgroundColor: generateSegmentColor(index),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: `0 ${spacing.xsmall}`,
                  minWidth: 0,
                  border: "none",
                  cursor: "default",
                }}
              >
                <span
                  css={{
                    fontSize: typography.fontSize.small,
                    color: colors.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textShadow: "0 0 4px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {segment.label}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={6}>
                  <Tooltip.Popup
                    css={{
                      backgroundColor: colors.backgroundLight,
                      border: `1px solid ${colors.secondary30}`,
                      borderRadius: radius.small,
                      padding: `${spacing.xsmall} ${spacing.small}`,
                      fontSize: typography.fontSize.small,
                      color: colors.text,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {segment.label}: {segment.percentage}%
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ))}
      </div>
    </div>
  )
}

export const ChallengeSummary = ({
  challenges,
}: ChallengeSummaryProps): React.ReactElement | null => {
  if (challenges.length === 0) {
    return null
  }

  const skillCounts = computeSkillCounts(challenges)
  const categoryCounts = computeCategoryCounts(skillCounts)
  const characteristicCounts = computeCharacteristicCounts(challenges)

  const categorySegments = toSegments(categoryCounts)
  const characteristicSegments = toSegments(characteristicCounts)

  // Sort skills by count descending, then alphabetically
  const sortedSkills = Array.from(skillCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return a[0].localeCompare(b[0])
  })

  // Order categories by SKILL_CATEGORIES key order
  const categoryOrder = Object.keys(SKILL_CATEGORIES) as SkillCategory[]
  const orderedCategorySegments = categoryOrder
    .map((cat) => categorySegments.find((s) => s.label === cat))
    .filter(
      (stackedBarSegment): stackedBarSegment is StackedBarSegment =>
        stackedBarSegment !== undefined,
    )

  // Order characteristics by CHARACTERISTICS order
  const orderedCharacteristicSegments = CHARACTERISTICS.map((char) =>
    characteristicSegments.find((s) => s.label === char),
  ).filter(
    (stackedBarSegment): stackedBarSegment is StackedBarSegment =>
      stackedBarSegment !== undefined,
  )

  return (
    <div
      css={{
        padding: spacing.medium,
        backgroundColor: colors.backgroundCard,
        borderRadius: radius.medium,
        marginBottom: spacing.large,
      }}
    >
      <div
        css={{
          display: "flex",
          gap: spacing.medium,
          marginBottom: spacing.medium,
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            css={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: colors.primary,
              color: colors.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: typography.fontSize.large,
              fontWeight: 600,
            }}
          >
            {challenges.length}
          </div>
          <div
            css={{
              fontSize: typography.fontSize.small,
              color: colors.textDim,
              marginTop: spacing.xsmall,
            }}
          >
            Challenge{challenges.length !== 1 ? "s" : ""}
          </div>
        </div>

        {sortedSkills.length > 0 && (
          <div css={{ flex: 1, minWidth: 0 }}>
            <div
              css={{
                fontSize: typography.fontSize.small,
                color: colors.textDim,
                marginBottom: spacing.xsmall,
              }}
            >
              Skills Used
            </div>
            <div css={{ display: "flex", flexWrap: "wrap", gap: spacing.small }}>
              {sortedSkills.map(([skill, count]) => (
                <span
                  key={skill}
                  css={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing.xsmall,
                    padding: `${spacing.xsmall} ${spacing.small}`,
                    backgroundColor: colors.secondary20,
                    borderRadius: radius.small,
                    fontSize: typography.fontSize.small,
                    color: colors.text,
                  }}
                >
                  {skill}
                  {count > 1 && (
                    <span
                      css={{
                        fontSize: "0.7rem",
                        backgroundColor: colors.primary,
                        color: colors.background,
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <StackedBar segments={orderedCategorySegments} label="Skill Distribution" />
      <StackedBar segments={orderedCharacteristicSegments} label="Characteristic Distribution" />
    </div>
  )
}
