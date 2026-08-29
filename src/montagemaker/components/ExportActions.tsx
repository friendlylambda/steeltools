/** @jsxImportSource @emotion/react */
import type { Montage } from "../types/montage"
import { generateMarkdown } from "../utilities/markdown"
import { generateMontageModuleJson } from "../utilities/montageModuleJson"
import { ExportActions as SharedExportActions } from "../../components/ExportActions"
import { colors } from "../../theme"

// Threads in the Codex Discord: the mod's own thread, and where its bugs go.
const MODULE_THREAD_URL =
  "https://discord.com/channels/751501320640528396/1540915689483669524/1540915689483669524"
const BUG_REPORT_THREAD_URL =
  "https://discord.com/channels/751501320640528396/1478590608867070135/1478590608867070135"

const linkStyles = {
  color: colors.primary,
  textDecoration: "underline",
  "&:hover": {
    color: colors.primaryLight,
  },
} as const

interface MontageExportActionsProps {
  readonly montage: Montage
}

const moduleNote = (
  <>
    Export to the{" "}
    <a href={MODULE_THREAD_URL} target="_blank" rel="noopener noreferrer" css={linkStyles}>
      thc1967-montage
    </a>{" "}
    Codex Mod format (experimental, report bugs{" "}
    <a href={BUG_REPORT_THREAD_URL} target="_blank" rel="noopener noreferrer" css={linkStyles}>
      here
    </a>
    )
  </>
)

export const ExportActions = ({ montage }: MontageExportActionsProps): React.ReactElement => {
  const filenameStem = montage.title ? montage.title.toLowerCase().replace(/\s+/g, "-") : "montage"

  return (
    <SharedExportActions
      exports={[
        {
          generateContent: () => generateMarkdown(montage),
          mimeType: "text/markdown",
          copyLabel: "Copy Montage Markdown to Clipboard",
          downloadLabel: "Download Montage Markdown as a File",
          filename: `${filenameStem}.md`,
        },
        {
          generateContent: () => generateMontageModuleJson(montage),
          mimeType: "application/json",
          copyLabel: "Copy Montage Module JSON to Clipboard",
          downloadLabel: "Download Montage Module JSON as a File",
          filename: `${filenameStem}.json`,
          note: moduleNote,
        },
      ]}
    />
  )
}
