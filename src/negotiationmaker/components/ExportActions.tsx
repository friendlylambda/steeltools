/** @jsxImportSource @emotion/react */
import type { Negotiation } from "../types/negotiation"
import { generateMarkdown } from "../utilities/markdown"
import { generateNegotiationModuleJson } from "../utilities/negotiationModuleJson"
import { ExportActions as SharedExportActions } from "../../components/ExportActions"
import { colors } from "../../theme"

// Threads in the Codex Discord: the mod's own thread, and where bugs in this
// export go.
const MODULE_THREAD_URL = "https://discord.com/channels/751501320640528396/1545614905825296514"
const BUG_REPORT_THREAD_URL = "https://discord.com/channels/751501320640528396/1561604072350416896"

const linkStyles = {
  color: colors.primary,
  textDecoration: "underline",
  "&:hover": {
    color: colors.primaryLight,
  },
} as const

interface NegotiationExportActionsProps {
  readonly negotiation: Negotiation
}

const moduleNote = (
  <>
    Export to the{" "}
    <a href={MODULE_THREAD_URL} target="_blank" rel="noopener noreferrer" css={linkStyles}>
      thc1967-negotiation
    </a>{" "}
    Codex Mod format (experimental, report bugs{" "}
    <a href={BUG_REPORT_THREAD_URL} target="_blank" rel="noopener noreferrer" css={linkStyles}>
      here
    </a>
    )
  </>
)

export const ExportActions = ({
  negotiation,
}: NegotiationExportActionsProps): React.ReactElement => {
  const filenameStem = negotiation.title
    ? negotiation.title.toLowerCase().replace(/\s+/g, "-")
    : "negotiation"

  return (
    <SharedExportActions
      exports={[
        {
          generateContent: () => generateMarkdown(negotiation),
          mimeType: "text/markdown",
          copyLabel: "Copy Negotiation Markdown to Clipboard",
          downloadLabel: "Download Negotiation Markdown as a File",
          filename: `${filenameStem}.md`,
        },
        {
          generateContent: () => generateNegotiationModuleJson(negotiation),
          mimeType: "application/json",
          copyLabel: "Copy Negotiation Module JSON to Clipboard",
          downloadLabel: "Download Negotiation Module JSON as a File",
          filename: `${filenameStem}.json`,
          note: moduleNote,
        },
      ]}
    />
  )
}
