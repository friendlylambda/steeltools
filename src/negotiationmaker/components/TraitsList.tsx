/** @jsxImportSource @emotion/react */
import { useState } from "react"
import { motion } from "motion/react"
import { Menu } from "@base-ui/react/menu"
import type { Trait } from "../types/negotiation"
import { MOTIVATION_PRESETS } from "../constants/negotiation"
import { createDefaultTrait } from "../utils/defaults"
import { TraitEditor } from "./TraitEditor"
import { colors, spacing, radius, typography } from "../../theme"

const ArrowUpIcon = (): React.ReactElement => (
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

const ArrowDownIcon = (): React.ReactElement => (
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

interface TraitsListProps {
  readonly kind: "motivation" | "pitfall"
  readonly value: readonly Trait[]
  readonly onChange: (traits: readonly Trait[]) => void
}

const arrowButtonStyle = {
  padding: spacing.xsmall,
  border: "none",
  backgroundColor: "transparent",
  color: colors.textDim,
  cursor: "pointer",
  borderRadius: radius.small,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    color: colors.text,
    backgroundColor: colors.secondary30,
  },
} as const

const menuPopupStyles = {
  backgroundColor: colors.backgroundLight,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  padding: spacing.xsmall,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
  maxHeight: "min(50vh, 360px)",
  overflowY: "auto" as const,
  width: "min(80vw, 420px)",
}

const menuItemStyles = {
  padding: `${spacing.small} ${spacing.medium}`,
  cursor: "pointer",
  borderRadius: radius.small,
  fontSize: typography.fontSize.small,
  color: colors.text,
  "&[data-highlighted]": {
    backgroundColor: colors.secondary30,
  },
}

export const TraitsList = ({ kind, value, onChange }: TraitsListProps): React.ReactElement => {
  const [menuOpen, setMenuOpen] = useState(false)
  const kindLabel = kind === "motivation" ? "Motivation" : "Pitfall"
  const kindLabelPlural = kind === "motivation" ? "Motivations" : "Pitfalls"

  const handleTraitChange = (index: number, updated: Trait): void => {
    const newTraits = value.map((trait, traitIndex) => (traitIndex === index ? updated : trait))
    onChange(newTraits)
  }

  const handleDelete = (index: number): void => {
    onChange(value.filter((_, traitIndex) => traitIndex !== index))
  }

  const swapTraits = (indexA: number, indexB: number): void => {
    const newTraits = value.map((trait, traitIndex) => {
      if (traitIndex === indexA) return value[indexB] as Trait
      if (traitIndex === indexB) return value[indexA] as Trait
      return trait
    })
    onChange(newTraits)
  }

  const handleMoveUp = (index: number): void => {
    if (index === 0) return
    swapTraits(index - 1, index)
  }

  const handleMoveDown = (index: number): void => {
    if (index === value.length - 1) return
    swapTraits(index, index + 1)
  }

  const textToHtml = (text: string): string =>
    text
      .split("\n\n")
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("")

  const firstSentence = (text: string): string => {
    const match = text.match(/^[^.!?]+[.!?]/)
    return match ? match[0] : text.slice(0, 120)
  }

  const handleAddPreset = (presetName: string, description: string): void => {
    const newTrait = createDefaultTrait(presetName, textToHtml(description))
    onChange([...value, newTrait])
    setMenuOpen(false)
  }

  const handleAddCustom = (): void => {
    const newTrait = createDefaultTrait("", `<p>Write your own ${kind}.</p>`)
    onChange([...value, newTrait])
    setMenuOpen(false)
  }

  return (
    <section css={{ marginBottom: spacing.large }}>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.medium,
        }}
      >
        <h3
          css={{
            fontSize: typography.fontSize.large,
            color: colors.primary,
            margin: 0,
          }}
        >
          {kindLabelPlural}
        </h3>
        <Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Menu.Trigger
            css={{
              padding: `${spacing.small} ${spacing.medium}`,
              fontSize: typography.fontSize.small,
              border: `1px solid ${colors.secondary30}`,
              borderRadius: radius.small,
              cursor: "pointer",
              backgroundColor: "transparent",
              color: colors.text,
              "&:hover": {
                borderColor: colors.primary,
                color: colors.primary,
              },
            }}
          >
            + Add {kindLabel}
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup css={menuPopupStyles}>
                {MOTIVATION_PRESETS.map((preset) => {
                  const description =
                    kind === "motivation" ? preset.motivationDescription : preset.pitfallDescription
                  return (
                    <Menu.Item
                      key={preset.name}
                      css={menuItemStyles}
                      onClick={() => handleAddPreset(preset.name, description)}
                    >
                      <div css={{ fontWeight: 600 }}>{preset.name}</div>
                      <div
                        css={{
                          fontSize: "0.8rem",
                          color: colors.textDim,
                          marginTop: "2px",
                          lineHeight: 1.3,
                        }}
                      >
                        {firstSentence(description)}
                      </div>
                    </Menu.Item>
                  )
                })}
                <Menu.Item
                  css={{
                    ...menuItemStyles,
                    borderTop: `1px solid ${colors.secondary30}`,
                    marginTop: spacing.xsmall,
                    paddingTop: spacing.small,
                  }}
                  onClick={handleAddCustom}
                >
                  <div css={{ fontWeight: 600 }}>Custom</div>
                  <div
                    css={{
                      fontSize: "0.8rem",
                      color: colors.textDim,
                      marginTop: "2px",
                      lineHeight: 1.3,
                    }}
                  >
                    Write your own {kind}
                  </div>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {value.length === 0 && (
        <p css={{ color: colors.textDim, fontSize: typography.fontSize.small }}>
          No {kindLabelPlural.toLowerCase()} added yet. Click "Add {kindLabel}" to get started.
        </p>
      )}

      {value.map((trait, index) => (
        <motion.div key={trait.id} layout transition={{ type: "spring", duration: 0.3 }}>
          <div
            css={{
              display: "flex",
              gap: spacing.xsmall,
              alignItems: "flex-start",
            }}
          >
            <div
              css={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                paddingTop: spacing.medium,
              }}
            >
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                css={{
                  ...arrowButtonStyle,
                  opacity: index === 0 ? 0.3 : 1,
                  cursor: index === 0 ? "default" : "pointer",
                }}
              >
                <ArrowUpIcon />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === value.length - 1}
                css={{
                  ...arrowButtonStyle,
                  opacity: index === value.length - 1 ? 0.3 : 1,
                  cursor: index === value.length - 1 ? "default" : "pointer",
                }}
              >
                <ArrowDownIcon />
              </button>
            </div>
            <div css={{ flex: 1 }}>
              <TraitEditor
                value={trait}
                onChange={(updated) => handleTraitChange(index, updated)}
                onDelete={() => handleDelete(index)}
                canDelete={true}
                kind={kind}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  )
}
