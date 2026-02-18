/** @jsxImportSource @emotion/react */
import { useRef, useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { startCase } from "lodash-es"
import { Input } from "@base-ui/react/input"
import { Combobox } from "@base-ui/react/combobox"
import { Dialog } from "@base-ui/react/dialog"
import { Switch } from "@base-ui/react/switch"
import type { Challenge, Characteristic, Difficulty } from "../types/montage"
import { CHARACTERISTICS, SKILLS } from "../constants/drawSteel"
import { colors, spacing, radius, typography } from "../../theme"
import { Stepper } from "./Stepper"

const CheckIcon = (): React.ReactElement => (
  <svg fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
    <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
  </svg>
)

const XIcon = (): React.ReactElement => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const TrashIcon = (): React.ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

interface ChallengeEditorProps {
  readonly value: Challenge
  readonly onChange: (challenge: Challenge) => void
  readonly onDelete: () => void
}

interface CharacteristicChipProps {
  readonly characteristic: Characteristic
  readonly selected: boolean
  readonly onClick: () => void
}

const CharacteristicChip = ({
  characteristic,
  selected,
  onClick,
}: CharacteristicChipProps): React.ReactElement => (
  <button
    type="button"
    onClick={onClick}
    css={{
      padding: `${spacing.xsmall} ${spacing.small}`,
      borderRadius: radius.medium,
      border: `1px solid ${selected ? colors.primary : colors.secondary30}`,
      backgroundColor: selected ? colors.primary : "transparent",
      color: selected ? colors.background : colors.text,
      fontSize: typography.fontSize.small,
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        borderColor: colors.primary,
        backgroundColor: selected ? colors.primary : colors.backgroundCard,
      },
    }}
  >
    {characteristic}
  </button>
)

interface DifficultyRadioProps {
  readonly difficulty: Difficulty
  readonly label: string
  readonly selected: boolean
  readonly name: string
  readonly onChange: () => void
}

const DifficultyRadio = ({
  difficulty,
  label,
  selected,
  name,
  onChange,
}: DifficultyRadioProps): React.ReactElement => (
  <label
    css={{
      display: "inline-flex",
      alignItems: "center",
      gap: spacing.xsmall,
      cursor: "pointer",
      fontSize: typography.fontSize.small,
      color: colors.text,
    }}
  >
    <input
      type="radio"
      name={name}
      value={difficulty}
      checked={selected}
      onChange={onChange}
      css={{
        accentColor: colors.primary,
      }}
    />
    {label}
  </label>
)

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

export const ChallengeEditor = ({
  value,
  onChange,
  onDelete,
}: ChallengeEditorProps): React.ReactElement => {
  const [localName, setLocalName] = useState(value.name)
  const [localDescription, setLocalDescription] = useState(value.description)
  const [localExtraDetails, setLocalExtraDetails] = useState(value.extraDetails ?? "")
  const [skillInputValue, setSkillInputValue] = useState("")
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const chipsContainerRef = useRef<HTMLDivElement>(null)

  // Sync local state when prop changes from external source
  useEffect(() => {
    setLocalName(value.name)
  }, [value.name])

  useEffect(() => {
    setLocalDescription(value.description)
  }, [value.description])

  useEffect(() => {
    setLocalExtraDetails(value.extraDetails ?? "")
  }, [value.extraDetails])

  // Debounce updates to parent
  useDebounce(
    () => {
      if (localName !== value.name) {
        onChange({ ...value, name: localName })
      }
    },
    300,
    [localName],
  )

  useDebounce(
    () => {
      if (localDescription !== value.description) {
        onChange({ ...value, description: localDescription })
      }
    },
    300,
    [localDescription],
  )

  useDebounce(
    () => {
      if (typeof value.extraDetails === "string" && localExtraDetails !== value.extraDetails) {
        onChange({ ...value, extraDetails: localExtraDetails })
      }
    },
    300,
    [localExtraDetails],
  )

  const filteredSkills = SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillInputValue.toLowerCase()),
  )

  const trimmedInput = skillInputValue.trim()
  const exactMatch = SKILLS.some((skill) => skill.toLowerCase() === trimmedInput.toLowerCase())
  const showAddOption = trimmedInput !== "" && !exactMatch

  const toggleCharacteristic = (char: Characteristic): void => {
    const current = value.suggestedCharacteristics
    const updated = current.includes(char) ? current.filter((c) => c !== char) : [...current, char]
    onChange({ ...value, suggestedCharacteristics: updated })
  }

  const handleSkillsChange = (skills: string[]): void => {
    onChange({ ...value, suggestedSkills: skills })
  }

  return (
    <div
      css={{
        position: "relative",
        padding: spacing.medium,
        marginBottom: spacing.medium,
        borderRadius: radius.medium,
        border: `1px solid ${colors.secondary30}`,
        backgroundColor: colors.backgroundCard,
      }}
    >
      {/* Visibility toggle + delete button */}
      <div
        css={{
          position: "absolute",
          top: spacing.small,
          right: spacing.small,
          display: "flex",
          alignItems: "center",
          gap: spacing.small,
        }}
      >
        <label
          css={{
            display: "inline-flex",
            alignItems: "center",
            gap: spacing.xsmall,
            fontSize: typography.fontSize.small,
            color: colors.textDim,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span>Visible to Players</span>
          <Switch.Root
            checked={!value.hidden}
            onCheckedChange={(checked) => onChange({ ...value, hidden: !checked })}
            css={{
              width: 32,
              height: 18,
              padding: 2,
              borderRadius: 9,
              border: "none",
              backgroundColor: colors.secondary30,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              "&[data-checked]": {
                backgroundColor: colors.primary,
              },
            }}
          >
            <Switch.Thumb
              css={{
                display: "block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: colors.text,
                transition: "transform 0.15s ease",
                "&[data-checked]": {
                  transform: "translateX(14px)",
                },
              }}
            />
          </Switch.Root>
        </label>
        <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <Dialog.Trigger
            css={{
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
            }}
            title="Delete challenge"
          >
            <TrashIcon />
          </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop
            css={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          />
          <Dialog.Popup
            css={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: colors.background,
              border: `1px solid ${colors.secondary30}`,
              borderRadius: radius.medium,
              padding: spacing.large,
              zIndex: 1001,
              minWidth: "300px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Dialog.Title
              css={{
                margin: 0,
                marginBottom: spacing.small,
                fontSize: typography.fontSize.large,
                color: colors.primary,
              }}
            >
              Delete Challenge
            </Dialog.Title>
            <Dialog.Description
              css={{
                marginBottom: spacing.large,
                color: colors.textDim,
                fontSize: typography.fontSize.small,
              }}
            >
              Are you sure you want to delete this challenge? This action cannot be undone.
            </Dialog.Description>
            <div css={{ display: "flex", gap: spacing.small, justifyContent: "flex-end" }}>
              <Dialog.Close
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  fontSize: typography.fontSize.small,
                  border: `1px solid ${colors.secondary30}`,
                  borderRadius: radius.small,
                  backgroundColor: "transparent",
                  color: colors.text,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: colors.backgroundLight,
                  },
                }}
              >
                Cancel
              </Dialog.Close>
              <button
                type="button"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  onDelete()
                }}
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  fontSize: typography.fontSize.small,
                  border: "none",
                  borderRadius: radius.small,
                  backgroundColor: "#c44",
                  color: colors.text,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#a33",
                  },
                }}
              >
                Delete
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      </div>
      {/* Name & Description row */}
      <div css={{ display: "flex", gap: spacing.medium, marginBottom: spacing.medium }}>
        <div css={{ flex: "0 0 30%" }}>
          <label css={labelStyle}>Name</label>
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Challenge name..."
            css={inputStyle}
          />
        </div>
        <div css={{ flex: 1 }}>
          <label css={labelStyle}>Description</label>
          <Input
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Challenge description..."
            css={inputStyle}
          />
        </div>
      </div>

      {/* Extra Details (only shown once enabled) */}
      {typeof value.extraDetails === "string" && (
        <div css={{ marginBottom: spacing.medium }}>
          <label css={labelStyle}>Extra Details</label>
          <Input
            value={localExtraDetails}
            onChange={(e) => setLocalExtraDetails(e.target.value)}
            placeholder="Special: enter any special details for this challenge here"
            css={inputStyle}
          />
        </div>
      )}

      {/* Characteristics & Skills row */}
      <div css={{ display: "flex", gap: spacing.medium, marginBottom: spacing.medium }}>
        <div css={{ flex: 1 }}>
          <label css={labelStyle}>Suggested Characteristics</label>
          <div
            css={{
              display: "flex",
              gap: spacing.xsmall,
              flexWrap: "wrap",
              alignItems: "center",
              padding: spacing.small,
              minHeight: "2.5rem",
              border: `1px solid ${colors.secondary30}`,
              borderRadius: radius.small,
              backgroundColor: colors.backgroundLight,
            }}
          >
            {CHARACTERISTICS.map((char) => (
              <CharacteristicChip
                key={char}
                characteristic={char}
                selected={value.suggestedCharacteristics.includes(char)}
                onClick={() => toggleCharacteristic(char)}
              />
            ))}
          </div>
        </div>

        <div css={{ flex: 1 }}>
          <label css={labelStyle}>Suggested Skills</label>

          <Combobox.Root
            multiple
            open={skillsOpen}
            onOpenChange={setSkillsOpen}
            value={[...value.suggestedSkills]}
            onValueChange={handleSkillsChange}
            inputValue={skillInputValue}
            onInputValueChange={setSkillInputValue}
          >
            <Combobox.Chips
              ref={chipsContainerRef}
              css={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: spacing.xsmall,
                padding: spacing.small,
                minHeight: "2.5rem",
                border: `1px solid ${colors.secondary30}`,
                borderRadius: radius.small,
                backgroundColor: colors.backgroundLight,
                "&:focus-within": {
                  borderColor: colors.primary,
                },
              }}
            >
              {value.suggestedSkills.map((skill) => (
                <Combobox.Chip
                  key={skill}
                  css={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: `0.125rem ${spacing.xsmall}`,
                    borderRadius: radius.small,
                    backgroundColor: colors.secondary30,
                    color: colors.text,
                    fontSize: typography.fontSize.small,
                  }}
                >
                  {skill}
                  <Combobox.ChipRemove
                    css={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      background: "none",
                      color: colors.textDim,
                      cursor: "pointer",
                      padding: 0,
                      marginLeft: "0.125rem",
                      "&:hover": {
                        color: colors.text,
                      },
                    }}
                  >
                    <XIcon />
                  </Combobox.ChipRemove>
                </Combobox.Chip>
              ))}
              <Combobox.Input
                placeholder={value.suggestedSkills.length > 0 ? "" : "Type to filter skills..."}
                css={{
                  flex: 1,
                  minWidth: "8rem",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: colors.text,
                  fontSize: typography.fontSize.small,
                  "&::placeholder": {
                    color: colors.textDim,
                  },
                }}
              />
            </Combobox.Chips>

            <Combobox.Portal>
              <Combobox.Positioner
                sideOffset={4}
                anchor={chipsContainerRef}
                css={{
                  zIndex: 1000,
                  width: "var(--anchor-width)",
                }}
              >
                <Combobox.Popup
                  css={{
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: colors.backgroundLight,
                    border: `1px solid ${colors.secondary30}`,
                    borderRadius: radius.small,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {filteredSkills.length === 0 && (
                    <div
                      css={{
                        padding: spacing.small,
                        color: colors.textDim,
                        fontSize: typography.fontSize.small,
                      }}
                    >
                      No skills found
                    </div>
                  )}
                  <Combobox.List>
                    {filteredSkills.map((skill) => (
                      <Combobox.Item
                        key={skill}
                        value={skill}
                        css={{
                          padding: `${spacing.small} ${spacing.medium}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.small,
                          fontSize: typography.fontSize.small,
                          color: colors.text,
                          "&[data-highlighted]": {
                            backgroundColor: colors.backgroundCard,
                          },
                        }}
                      >
                        <Combobox.ItemIndicator
                          css={{
                            width: "1rem",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.primary,
                          }}
                        >
                          <CheckIcon />
                        </Combobox.ItemIndicator>
                        <span>{skill}</span>
                      </Combobox.Item>
                    ))}
                    {showAddOption && (
                      <Combobox.Item
                        value={startCase(trimmedInput)}
                        css={{
                          padding: `${spacing.small} ${spacing.medium}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.small,
                          fontSize: typography.fontSize.small,
                          fontWeight: "bold",
                          color: colors.text,
                          borderTop: `1px solid ${colors.secondary30}`,
                          "&[data-highlighted]": {
                            backgroundColor: colors.backgroundCard,
                          },
                        }}
                      >
                        Add {startCase(trimmedInput)}
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>

      {/* Times Completable & Default Difficulty row */}
      <div
        css={{
          display: "flex",
          gap: spacing.large,
          marginBottom: value.extraDetails == null ? spacing.medium : 0,
        }}
      >
        <div>
          <label css={labelStyle}>Times Completable</label>
          <Stepper
            value={value.timesCompletable}
            onChange={(newValue) => onChange({ ...value, timesCompletable: newValue })}
            min={1}
          />
        </div>
        <div>
          <label css={labelStyle}>Default Difficulty</label>
          <div css={{ display: "flex", gap: spacing.medium }}>
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <DifficultyRadio
                key={diff}
                difficulty={diff}
                label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                selected={value.difficulty === diff}
                name={`difficulty-${value.id}`}
                onChange={() => onChange({ ...value, difficulty: diff })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Button to add extra details field */}
      {value.extraDetails == null && (
        <div css={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => onChange({ ...value, extraDetails: "" })}
            css={{
              padding: `${spacing.xsmall} ${spacing.small}`,
              fontSize: typography.fontSize.small,
              border: `1px solid ${colors.secondary30}`,
              borderRadius: radius.small,
              backgroundColor: "transparent",
              color: colors.textDim,
              cursor: "pointer",
              "&:hover": {
                borderColor: colors.primary,
                color: colors.text,
              },
            }}
          >
            +Details
          </button>
        </div>
      )}
    </div>
  )
}
