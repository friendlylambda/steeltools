/** @jsxImportSource @emotion/react */
import { useEffect } from "react"
import { useParams, useNavigate, Link } from "@tanstack/react-router"
import { Switch } from "@base-ui/react/switch"
import { useNegotiationStore } from "../store/negotiationStore"
import { generateMarkdown } from "../utils/markdown"
import { TitleInput } from "../../components/TitleInput"
import { RichTextEditor } from "../../components/RichTextEditor"
import { ExportActions } from "../../components/ExportActions"
import { NpcStatsSection } from "./NpcStatsSection"
import { TraitsList } from "./TraitsList"
import { OutcomesTable } from "./OutcomesTable"
import type { Trait, OutcomeRow } from "../types/negotiation"
import { colors, spacing, radius, typography } from "../../theme"

export const Editor = (): React.ReactElement | null => {
  const { negotiationId } = useParams({ from: "/negotiation-maker/$negotiationId" })
  const navigate = useNavigate()
  const negotiations = useNegotiationStore((state) => state.negotiations)
  const updateNegotiation = useNegotiationStore((state) => state.updateNegotiation)
  const setCurrentId = useNegotiationStore((state) => state.setCurrentId)

  const negotiation = negotiations[negotiationId]

  useEffect(() => {
    if (!negotiation) {
      navigate({ to: "/negotiation-maker" })
    } else {
      setCurrentId(negotiationId)
    }
  }, [negotiation, negotiationId, navigate, setCurrentId])

  if (!negotiation) {
    return null
  }

  const handleTitleChange = (title: string): void => {
    updateNegotiation(negotiationId, { title })
  }

  const handleSceneDetailsChange = (sceneDetails: string): void => {
    updateNegotiation(negotiationId, { sceneDetails })
  }

  const handleImpressionChange = (impression: number): void => {
    updateNegotiation(negotiationId, { impression })
  }

  const handleNativeLanguageChange = (nativeLanguage: string): void => {
    updateNegotiation(negotiationId, { nativeLanguage })
  }

  const handleInterestChange = (startingInterest: number): void => {
    updateNegotiation(negotiationId, { startingInterest })
  }

  const handlePatienceChange = (startingPatience: number): void => {
    updateNegotiation(negotiationId, { startingPatience })
  }

  const handleMotivationsChange = (motivations: readonly Trait[]): void => {
    updateNegotiation(negotiationId, { motivations })
  }

  const handlePitfallsChange = (pitfalls: readonly Trait[]): void => {
    updateNegotiation(negotiationId, { pitfalls })
  }

  const handleOutcomesChange = (outcomes: readonly OutcomeRow[]): void => {
    updateNegotiation(negotiationId, { outcomes })
  }

  const handleRulesReferenceChange = (includeRulesReference: boolean): void => {
    updateNegotiation(negotiationId, { includeRulesReference })
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
          to="/negotiation-maker"
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
          Edit Negotiation
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
        <TitleInput
          value={negotiation.title}
          onChange={handleTitleChange}
          label="NPC Name"
          placeholder="Enter NPC name..."
        />
        <div>
          <label
            css={{
              display: "block",
              marginBottom: spacing.small,
              fontSize: typography.fontSize.small,
              color: colors.secondary,
            }}
          >
            Scene / GM Notes
          </label>
          <RichTextEditor
            value={negotiation.sceneDetails ?? ""}
            onChange={handleSceneDetailsChange}
            placeholder="Describe the negotiation scenario..."
          />
        </div>
      </section>

      <NpcStatsSection
        impression={negotiation.impression}
        nativeLanguage={negotiation.nativeLanguage}
        startingInterest={negotiation.startingInterest}
        startingPatience={negotiation.startingPatience}
        onImpressionChange={handleImpressionChange}
        onNativeLanguageChange={handleNativeLanguageChange}
        onInterestChange={handleInterestChange}
        onPatienceChange={handlePatienceChange}
      />

      <TraitsList
        kind="motivation"
        value={negotiation.motivations}
        onChange={handleMotivationsChange}
      />

      <TraitsList
        kind="pitfall"
        value={negotiation.pitfalls}
        onChange={handlePitfallsChange}
      />

      <OutcomesTable value={negotiation.outcomes} onChange={handleOutcomesChange} />

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
            checked={negotiation.includeRulesReference}
            onCheckedChange={handleRulesReferenceChange}
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
            Include rules reference tables (argument mechanics, uncovering motivations)
          </span>
        </label>
      </section>

      <ExportActions
        generateMarkdown={() => generateMarkdown(negotiation)}
        copyLabel="Copy Negotiation Markdown to Clipboard"
        downloadLabel="Download Negotiation Markdown as a File"
        defaultFilename={
          negotiation.title
            ? `${negotiation.title.toLowerCase().replace(/\s+/g, "-")}.md`
            : "negotiation.md"
        }
      />
    </div>
  )
}
