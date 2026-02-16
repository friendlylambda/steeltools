/** @jsxImportSource @emotion/react */
import { useEffect } from "react"
import { useParams, useNavigate, Link } from "@tanstack/react-router"
import { Switch } from "@base-ui/react/switch"
import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { useMontageStore } from "../store/montageStore"
import { TitleInput } from "./TitleInput"
import { DifficultyTable } from "./DifficultyTable"
import { ChallengesList } from "./ChallengesList"
import { ExportActions } from "./ExportActions"
import { RichTextEditor } from "./RichTextEditor"
import type {
  DifficultyTable as DifficultyTableType,
  Challenge,
  OutcomesMode,
} from "../types/montage"
import { DEFAULT_OUTCOMES_HTML } from "../constants/outcomes"
import { colors, spacing, radius, typography } from "../../theme"

export const Editor = (): React.ReactElement | null => {
  const { montageId } = useParams({ from: '/montagemaker/$montageId' })
  const navigate = useNavigate()
  const montages = useMontageStore((state) => state.montages)
  const updateMontage = useMontageStore((state) => state.updateMontage)
  const setCurrentId = useMontageStore((state) => state.setCurrentId)

  const montage = montages[montageId]

  useEffect(() => {
    if (!montage) {
      navigate({ to: '/montagemaker' })
    } else {
      setCurrentId(montageId)
    }
  }, [montage, montageId, navigate, setCurrentId])

  if (!montage) {
    return null
  }

  const handleTitleChange = (title: string): void => {
    updateMontage(montageId, { title })
  }

  const handleDetailsChange = (details: string): void => {
    updateMontage(montageId, { details })
  }

  const handleDifficultyTableChange = (difficultyTable: DifficultyTableType): void => {
    updateMontage(montageId, { difficultyTable })
  }

  const handleChallengesChange = (challenges: readonly Challenge[]): void => {
    updateMontage(montageId, { challenges })
  }

  const handlePlayerTrackerChange = (includePlayerTracker: boolean): void => {
    updateMontage(montageId, { includePlayerTracker })
  }

  const handleOutcomesModeChange = (value: string[]): void => {
    if (value.length > 0) {
      updateMontage(montageId, { outcomesMode: value[0] as OutcomesMode })
    }
  }

  const handleCustomOutcomesChange = (customOutcomesHtml: string): void => {
    updateMontage(montageId, { customOutcomesHtml })
  }

  const handleRollButtonsChange = (includeRollButtons: boolean): void => {
    updateMontage(montageId, { includeRollButtons })
  }

  return (
    <div css={{ padding: spacing.xlarge, maxWidth: 900, margin: "0 auto" }}>
      <header
        css={{
          marginBottom: spacing.xlarge,
          display: "flex",
          alignItems: "center",
          gap: spacing.medium,
        }}
      >
        <Link
          to="/montagemaker"
          onClick={() => setCurrentId(null)}
          css={{
            display: "inline-block",
            padding: `${spacing.small} ${spacing.medium}`,
            fontSize: typography.fontSize.medium,
            border: `1px solid ${colors.secondary30}`,
            borderRadius: radius.small,
            cursor: "pointer",
            backgroundColor: "transparent",
            color: colors.text,
            textDecoration: "none",
            "&:hover": {
              backgroundColor: colors.backgroundCard,
            },
          }}
        >
          Back
        </Link>
        <h1
          css={{ fontSize: typography.fontSize.xlarge, margin: 0, flex: 1, color: colors.primary }}
        >
          Edit Montage
        </h1>
      </header>

      <section css={{ marginBottom: spacing.large }}>
        <h3
          css={{
            fontSize: typography.fontSize.large,
            color: colors.primary,
            marginBottom: spacing.medium,
          }}
        >
          Basic Details
        </h3>
        <TitleInput value={montage.title} onChange={handleTitleChange} />
        <div>
          <label
            css={{
              display: "block",
              marginBottom: spacing.small,
              fontSize: typography.fontSize.small,
              color: colors.secondary,
            }}
          >
            Details
          </label>
          <RichTextEditor
            value={montage.details ?? ""}
            onChange={handleDetailsChange}
            placeholder="Enter montage details..."
          />
        </div>
      </section>

      <DifficultyTable value={montage.difficultyTable} onChange={handleDifficultyTableChange} />

      <ChallengesList value={montage.challenges} onChange={handleChallengesChange} />

      <section css={{ marginBottom: spacing.large }}>
        <h3
          css={{
            fontSize: typography.fontSize.large,
            color: colors.primary,
            marginBottom: spacing.medium,
          }}
        >
          Options
        </h3>
        <label
          css={{
            display: "flex",
            alignItems: "center",
            gap: spacing.medium,
            cursor: "pointer",
          }}
        >
          <Switch.Root
            checked={montage.includePlayerTracker ?? false}
            onCheckedChange={handlePlayerTrackerChange}
            css={{
              width: 42,
              height: 24,
              padding: 0,
              borderRadius: 12,
              border: "none",
              backgroundColor: colors.secondary30,
              cursor: "pointer",
              position: "relative",
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
          <span css={{ fontSize: typography.fontSize.medium, color: colors.text }}>
            Include player tracker to track who has acted each round
          </span>
        </label>

        <label
          css={{
            display: "flex",
            alignItems: "center",
            gap: spacing.medium,
            cursor: "pointer",
            marginTop: spacing.medium,
          }}
        >
          <Switch.Root
            checked={montage.includeRollButtons ?? false}
            onCheckedChange={handleRollButtonsChange}
            css={{
              width: 42,
              height: 24,
              padding: 0,
              borderRadius: 12,
              border: "none",
              backgroundColor: colors.secondary30,
              cursor: "pointer",
              position: "relative",
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
          <span css={{ fontSize: typography.fontSize.medium, color: colors.text }}>
            Include roll buttons under each challenge (only visible to the Director)
          </span>
        </label>
        <div css={{ marginTop: spacing.medium }}>
          <div
            css={{
              display: "flex",
              alignItems: "center",
              gap: spacing.medium,
              marginBottom: spacing.small,
            }}
          >
            <span css={{ fontSize: typography.fontSize.medium, color: colors.text }}>
              Outcomes section:
            </span>
            <ToggleGroup
              value={[montage.outcomesMode]}
              onValueChange={handleOutcomesModeChange}
              css={{
                display: "flex",
                gap: 0,
                border: `1px solid ${colors.secondary}`,
                borderRadius: radius.small,
                overflow: "hidden",
              }}
            >
              <Toggle
                value="default"
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  border: "none",
                  borderRight: `1px solid ${colors.secondary}`,
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
                }}
              >
                Default
              </Toggle>
              <Toggle
                value="minimal"
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  border: "none",
                  borderRight: `1px solid ${colors.secondary}`,
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
                }}
              >
                Minimal
              </Toggle>
              <Toggle
                value="custom"
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  border: "none",
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
                }}
              >
                Custom
              </Toggle>
            </ToggleGroup>
          </div>
          {montage.outcomesMode === "custom" && (
            <RichTextEditor
              value={montage.customOutcomesHtml || DEFAULT_OUTCOMES_HTML}
              onChange={handleCustomOutcomesChange}
              placeholder="Enter custom outcomes..."
              showSubheader
              showVictoryButton
            />
          )}
        </div>
      </section>

      <ExportActions montage={montage} />
    </div>
  )
}
