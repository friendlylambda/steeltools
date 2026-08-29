/** @jsxImportSource @emotion/react */
import { Fragment, useState, useRef } from "react"
import { Button } from "@base-ui/react/button"
import { Tooltip } from "@base-ui/react/tooltip"
import { colors, spacing, radius, typography } from "../theme"

// One format a document can be exported as — the montage maker offers both
// Codex markdown and Codex module JSON, the negotiation maker only markdown.
export interface ExportTarget {
  readonly generateContent: () => string
  readonly mimeType: string
  readonly copyLabel: string
  readonly downloadLabel: string
  readonly filename: string
  // Optional explanation for the format, shown above this target's buttons and
  // separated from the exports before it by a rule.
  readonly note?: React.ReactNode
}

interface ExportActionsProps {
  readonly exports: readonly ExportTarget[]
  readonly generateShareUrl?: () => Promise<string>
  readonly shareLabel?: string
}

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const buttonStyles = {
  padding: `${spacing.small} ${spacing.medium}`,
  fontSize: typography.fontSize.medium,
  border: "none",
  borderRadius: radius.small,
  cursor: "pointer",
  backgroundColor: colors.secondary,
  color: colors.background,
  "&:hover": {
    backgroundColor: colors.secondaryLight,
  },
} as const

const tooltipPopupStyles = {
  backgroundColor: colors.backgroundLight,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.medium,
  padding: `${spacing.medium} ${spacing.large}`,
  fontSize: typography.fontSize.medium,
  color: colors.text,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  opacity: 1,
  transform: "translateY(0) scale(1)",
  transition: "opacity 200ms ease, transform 200ms ease",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: 0,
    transform: "translateY(4px) scale(0.95)",
  },
} as const

type CopyOutcome = "copied" | "failed"

interface CopyButtonProps {
  readonly label: string
  // Produces the text to put on the clipboard: export content, or a share link
  // that has to be created first.
  readonly copy: () => string | Promise<string>
  readonly copiedMessage: string
  readonly failedMessage: string
}

// Owns its own confirmation tooltip, so nothing outside has to track which
// button was last clicked.
const CopyButton = ({
  label,
  copy,
  copiedMessage,
  failedMessage,
}: CopyButtonProps): React.ReactElement => {
  const [outcome, setOutcome] = useState<CopyOutcome | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const showOutcome = (newOutcome: CopyOutcome): void => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setOutcome(newOutcome)
    timeoutRef.current = window.setTimeout(() => {
      setOutcome(null)
    }, 2000)
  }

  const handleClick = async (): Promise<void> => {
    try {
      const text = await copy()
      await navigator.clipboard.writeText(text)
      showOutcome("copied")
    } catch {
      showOutcome("failed")
    }
  }

  return (
    <Tooltip.Root open={outcome !== null}>
      <Tooltip.Trigger
        render={
          <Button onClick={handleClick} css={buttonStyles}>
            {label}
          </Button>
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8}>
          <Tooltip.Popup css={tooltipPopupStyles}>
            {outcome === "copied" ? copiedMessage : failedMessage}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export const ExportActions = ({
  exports,
  generateShareUrl,
  shareLabel,
}: ExportActionsProps): React.ReactElement => {
  const handleDownload = (exportTarget: ExportTarget): void => {
    downloadFile(exportTarget.generateContent(), exportTarget.filename, exportTarget.mimeType)
  }

  return (
    <div css={{ display: "flex", gap: spacing.medium, flexWrap: "wrap" }}>
      <Tooltip.Provider>
        {exports.map((exportTarget) => (
          <Fragment key={exportTarget.copyLabel}>
            {exportTarget.note && (
              // Full width so it breaks the button row and heads its own section.
              <div
                css={{
                  width: "100%",
                  borderTop: `1px solid ${colors.secondary30}`,
                  paddingTop: spacing.medium,
                  fontSize: typography.fontSize.small,
                  color: colors.textDim,
                }}
              >
                {exportTarget.note}
              </div>
            )}
            <CopyButton
              label={exportTarget.copyLabel}
              copy={exportTarget.generateContent}
              copiedMessage="Copied!"
              failedMessage="Copying failed — please try again"
            />
            <Button onClick={() => handleDownload(exportTarget)} css={buttonStyles}>
              {exportTarget.downloadLabel}
            </Button>
          </Fragment>
        ))}
        {generateShareUrl && (
          <CopyButton
            label={shareLabel ?? "Copy Share Link"}
            copy={generateShareUrl}
            copiedMessage="Link copied!"
            failedMessage="Sharing failed — please try again"
          />
        )}
      </Tooltip.Provider>
    </div>
  )
}
