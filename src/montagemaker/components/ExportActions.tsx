import type { Montage } from "../types/montage"
import { generateMarkdown } from "../utilities/markdown"
import { generateMontageModuleJson } from "../utilities/montageModuleJson"
import { ExportActions as SharedExportActions } from "../../components/ExportActions"

interface MontageExportActionsProps {
  readonly montage: Montage
}

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
        },
      ]}
    />
  )
}
