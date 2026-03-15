import type { Montage } from "../types/montage"
import { generateMarkdown } from "../utils/markdown"
import { ExportActions as SharedExportActions } from "../../components/ExportActions"

interface MontageExportActionsProps {
  readonly montage: Montage
}

export const ExportActions = ({ montage }: MontageExportActionsProps): React.ReactElement => (
  <SharedExportActions
    generateMarkdown={() => generateMarkdown(montage)}
    copyLabel="Copy Montage Markdown to Clipboard"
    downloadLabel="Download Montage Markdown as a File"
    defaultFilename={
      montage.title
        ? `${montage.title.toLowerCase().replace(/\s+/g, "-")}.md`
        : "montage.md"
    }
  />
)
