/** @jsxImportSource @emotion/react */
import { useState, useRef } from "react"
import { Button } from "@base-ui/react/button"
import { Tooltip } from "@base-ui/react/tooltip"
import { colors, spacing, radius, typography } from "../theme"

interface ExportActionsProps {
  readonly generateMarkdown: () => string
  readonly copyLabel: string
  readonly downloadLabel: string
  readonly defaultFilename: string
  readonly generateShareUrl?: () => Promise<string>
  readonly shareLabel?: string
}

type CopiedTarget = "markdown" | "share" | "share-error"

const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/markdown" })
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

export const ExportActions = ({
  generateMarkdown,
  copyLabel,
  downloadLabel,
  defaultFilename,
  generateShareUrl,
  shareLabel,
}: ExportActionsProps): React.ReactElement => {
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const showCopiedTooltip = (target: CopiedTarget): void => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setCopiedTarget(target)
    timeoutRef.current = window.setTimeout(() => {
      setCopiedTarget(null)
    }, 2000)
  }

  const handleCopy = (): void => {
    const markdown = generateMarkdown()
    copyToClipboard(markdown)
    showCopiedTooltip("markdown")
  }

  const handleDownload = (): void => {
    const markdown = generateMarkdown()
    downloadFile(markdown, defaultFilename)
  }

  const handleShare = async (): Promise<void> => {
    if (generateShareUrl) {
      try {
        const url = await generateShareUrl()
        await copyToClipboard(url)
        showCopiedTooltip("share")
      } catch {
        showCopiedTooltip("share-error")
      }
    }
  }

  return (
    <div css={{ display: "flex", gap: spacing.medium, flexWrap: "wrap" }}>
      <Tooltip.Provider>
        <Tooltip.Root open={copiedTarget === "markdown"}>
          <Tooltip.Trigger
            render={
              <Button onClick={handleCopy} css={buttonStyles}>
                {copyLabel}
              </Button>
            }
          />
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={8}>
              <Tooltip.Popup css={tooltipPopupStyles}>Copied!</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
        <Button onClick={handleDownload} css={buttonStyles}>
          {downloadLabel}
        </Button>
        {generateShareUrl && (
          <Tooltip.Root open={copiedTarget === "share" || copiedTarget === "share-error"}>
            <Tooltip.Trigger
              render={
                <Button onClick={handleShare} css={buttonStyles}>
                  {shareLabel ?? "Copy Share Link"}
                </Button>
              }
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="top" sideOffset={8}>
                <Tooltip.Popup css={tooltipPopupStyles}>
                  {copiedTarget === "share-error"
                    ? "Sharing failed — please try again"
                    : "Link copied!"}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
      </Tooltip.Provider>
    </div>
  )
}
