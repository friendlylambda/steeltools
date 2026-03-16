/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { Input } from "@base-ui/react/input"
import { STARTING_ATTITUDES, STARTING_ATTITUDE_NAMES } from "../constants/negotiation"
import { Stepper } from "../../components/Stepper"
import { colors, spacing, radius, typography } from "../../theme"

interface NpcStatsSectionProps {
  readonly impression: number
  readonly nativeLanguage: string
  readonly startingInterest: number
  readonly startingPatience: number
  readonly onImpressionChange: (value: number) => void
  readonly onNativeLanguageChange: (value: string) => void
  readonly onInterestChange: (value: number) => void
  readonly onPatienceChange: (value: number) => void
}

const labelStyle = {
  display: "block",
  marginBottom: spacing.xsmall,
  fontSize: typography.fontSize.small,
  color: colors.secondary,
}

const inputStyle = {
  width: "100%",
  padding: spacing.small,
  fontSize: typography.fontSize.medium,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  backgroundColor: colors.backgroundLight,
  color: colors.text,
  outline: "none",
  "&::placeholder": {
    color: colors.textDim,
  },
  "&:focus": {
    borderColor: colors.primary,
  },
}

export const NpcStatsSection = ({
  impression,
  nativeLanguage,
  startingInterest,
  startingPatience,
  onImpressionChange,
  onNativeLanguageChange,
  onInterestChange,
  onPatienceChange,
}: NpcStatsSectionProps): React.ReactElement => {
  const [localLanguage, setLocalLanguage] = useState(nativeLanguage)

  useEffect(() => {
    setLocalLanguage(nativeLanguage)
  }, [nativeLanguage])

  useDebounce(
    () => {
      if (localLanguage !== nativeLanguage) {
        onNativeLanguageChange(localLanguage)
      }
    },
    300,
    [localLanguage],
  )

  const handleAttitudeClick = (attitudeName: string): void => {
    const attitude = STARTING_ATTITUDES[attitudeName]
    if (!attitude) return
    onInterestChange(attitude.interest)
    onPatienceChange(attitude.patience)
  }

  return (
    <section css={{ marginBottom: spacing.large }}>
      <h3
        css={{
          fontSize: typography.fontSize.large,
          color: colors.primary,
          marginBottom: spacing.medium,
        }}
      >
        NPC Stats
      </h3>

      {/* Starting Attitude presets */}
      <div css={{ marginBottom: spacing.medium }}>
        <label css={labelStyle}>Starting Attitude</label>
        <div css={{ display: "flex", gap: spacing.xsmall, flexWrap: "wrap" }}>
          {STARTING_ATTITUDE_NAMES.map((attitudeName) => (
              <button
                key={attitudeName}
                type="button"
                onClick={() => handleAttitudeClick(attitudeName)}
                css={{
                  padding: `${spacing.xsmall} ${spacing.small}`,
                  fontSize: typography.fontSize.small,
                  border: `1px solid ${colors.secondary30}`,
                  borderRadius: radius.small,
                  backgroundColor: "transparent",
                  color: colors.text,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: colors.primary,
                    backgroundColor: colors.backgroundCard,
                  },
                }}
                title={`Interest ${STARTING_ATTITUDES[attitudeName]?.interest}, Patience ${STARTING_ATTITUDES[attitudeName]?.patience}`}
              >
                {attitudeName}
              </button>
            ))}
        </div>
      </div>

      {/* Interest & Patience */}
      <div
        css={{
          display: "flex",
          gap: spacing.large,
          marginBottom: spacing.medium,
        }}
      >
        <div>
          <label css={labelStyle}>Starting Interest</label>
          <Stepper value={startingInterest} onChange={onInterestChange} min={0} max={5} />
        </div>
        <div>
          <label css={labelStyle}>Starting Patience</label>
          <Stepper value={startingPatience} onChange={onPatienceChange} min={0} max={5} />
        </div>
      </div>

      {/* Impression & Native Language */}
      <div
        css={{
          display: "flex",
          gap: spacing.large,
          alignItems: "flex-end",
        }}
      >
        <div>
          <label css={labelStyle}>Impression</label>
          <Stepper value={impression} onChange={onImpressionChange} min={1} max={12} />
        </div>
        <div css={{ flex: 1, maxWidth: "300px" }}>
          <label css={labelStyle}>Native Language</label>
          <Input
            value={localLanguage}
            onChange={(event) => setLocalLanguage(event.target.value)}
            placeholder="e.g. Caelian, Higaran..."
            css={inputStyle}
          />
        </div>
      </div>
    </section>
  )
}
