/** @jsxImportSource @emotion/react */
import { useState, useRef } from "react"
import { Button } from "@base-ui/react/button"
import { Tooltip } from "@base-ui/react/tooltip"
import type { Montage } from "../types/montage"
import { generateMarkdown } from "../utils/markdown"
import { colors, spacing, radius, typography } from "../../theme"

interface ExportActionsProps {
  readonly montage: Montage
}

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

export const ExportActions = ({ montage }: ExportActionsProps): React.ReactElement => {
  const [showCopied, setShowCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const handleCopy = (): void => {
    const markdown = generateMarkdown(montage)
    copyToClipboard(markdown)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setShowCopied(true)
    timeoutRef.current = window.setTimeout(() => {
      setShowCopied(false)
    }, 2000)
  }

  const handleDownload = (): void => {
    const markdown = generateMarkdown(montage)
    const filename = montage.title
      ? `${montage.title.toLowerCase().replace(/\s+/g, "-")}.md`
      : "montage.md"
    downloadFile(markdown, filename)
  }

  return (
    <div css={{ display: "flex", gap: spacing.medium }}>
      <Tooltip.Provider>
        <Tooltip.Root open={showCopied}>
          <Tooltip.Trigger
            render={
              <Button onClick={handleCopy} css={buttonStyles}>
                Copy Montage Markdown to Clipboard
              </Button>
            }
          />
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={8}>
              <Tooltip.Popup
                css={{
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
                }}
              >
                Copied!
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <Button onClick={handleDownload} css={buttonStyles}>
        Download Montage Markdown as a File
      </Button>
    </div>
  )
}
