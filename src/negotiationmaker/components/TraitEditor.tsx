/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { Input } from "@base-ui/react/input"
import { Dialog } from "@base-ui/react/dialog"
import type { Trait } from "../types/negotiation"
import { RichTextEditor } from "../../components/RichTextEditor"
import { colors, spacing, radius, typography } from "../../theme"

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

interface TraitEditorProps {
  readonly value: Trait
  readonly onChange: (trait: Trait) => void
  readonly onDelete: () => void
  readonly canDelete: boolean
  readonly kind: "motivation" | "pitfall"
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

export const TraitEditor = ({
  value,
  onChange,
  onDelete,
  canDelete,
  kind,
}: TraitEditorProps): React.ReactElement => {
  const [localName, setLocalName] = useState(value.name)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setLocalName(value.name)
  }, [value.name])

  useDebounce(
    () => {
      if (localName !== value.name) {
        onChange({ ...value, name: localName })
      }
    },
    300,
    [localName],
  )

  const handleDescriptionChange = (description: string): void => {
    onChange({ ...value, description })
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
      {/* Delete button */}
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
        <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <Dialog.Trigger
            disabled={!canDelete}
            css={{
              padding: spacing.xsmall,
              border: "none",
              backgroundColor: "transparent",
              color: canDelete ? colors.textDim : colors.secondary30,
              cursor: canDelete ? "pointer" : "not-allowed",
              borderRadius: radius.small,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": canDelete
                ? {
                    color: colors.text,
                    backgroundColor: colors.secondary30,
                  }
                : {},
            }}
            title={`Delete ${kind}`}
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
                Delete {kind === "motivation" ? "Motivation" : "Pitfall"}
              </Dialog.Title>
              <Dialog.Description
                css={{
                  marginBottom: spacing.large,
                  color: colors.textDim,
                  fontSize: typography.fontSize.small,
                }}
              >
                Are you sure you want to delete this {kind}? This action cannot be undone.
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

      {/* Name */}
      <div css={{ marginBottom: spacing.medium, maxWidth: "50%" }}>
        <label css={labelStyle}>Name</label>
        <Input
          value={localName}
          onChange={(event) => setLocalName(event.target.value)}
          placeholder={`${kind === "motivation" ? "Motivation" : "Pitfall"} name...`}
          css={inputStyle}
        />
      </div>

      {/* Description */}
      <div>
        <label css={labelStyle}>Description</label>
        <RichTextEditor
          value={value.description}
          onChange={handleDescriptionChange}
          placeholder={`Describe this ${kind}...`}
        />
      </div>
    </div>
  )
}
