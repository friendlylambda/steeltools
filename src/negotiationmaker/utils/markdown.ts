import type { Negotiation, Trait } from "../types/negotiation"
import { RULES_REFERENCE_TEXT } from "../constants/negotiation"
import { htmlToMarkdown, htmlToWrappedMarkdown } from "../../utils/codexMarkdown"

const generateTrait = (trait: Trait): string => {
  const description = htmlToMarkdown(trait.description)
  if (description) {
    return `{**${trait.name}**}\n{\n${description}\n}`
  }
  return `{**${trait.name}**}\n{}`
}

const generateTraitsSection = (traits: readonly Trait[], sectionLabel: string): string => {
  if (traits.length === 0) {
    return ""
  }

  const traitBlocks = traits.map((trait) => generateTrait(trait)).join("\n\n")
  return `${sectionLabel}\n${traitBlocks}`
}

const generateOutcomesTable = (negotiation: Negotiation): string => {
  const rows = negotiation.outcomes
    .map((row) => `|Interest ${row.interestLevel} |${row.label} |${row.details}|`)
    .join("\n")

  return `{\n**Negotiation outcomes**\n\n\n${rows}\n\n\n[[/awardvp 1|Award Heroes 1 Victory]]\n\n\n}`
}

export const generateMarkdown = (negotiation: Negotiation): string => {
  const sections: string[] = [`# ${negotiation.title || "Negotiation"}`]

  sections.push("", "*(see Negotiation in [Draw Steel Heroes](pdf:Draw Steel Heroes:283))*")

  sections.push("", "##  Negotiation Stats ", "")

  // GM-only stats block
  const statsLines: string[] = []
  statsLines.push(`Impression: ${negotiation.impression}`)
  if (negotiation.nativeLanguage) {
    statsLines.push(`Native Language: ${negotiation.nativeLanguage}`)
  }
  sections.push(`{\n${statsLines.join("\n")}\n}`)

  // Visible trackers (always out of 5)
  const interestTracker =
    "#".repeat(negotiation.startingInterest) + "-".repeat(5 - negotiation.startingInterest)
  const patienceTracker =
    "#".repeat(negotiation.startingPatience) + "-".repeat(5 - negotiation.startingPatience)
  sections.push("", `INTEREST:  [[${interestTracker}]] `, `PATIENCE:  [[${patienceTracker}]]`)

  // Image placeholder
  sections.push("", "[[image]]")

  // Scene details
  if (negotiation.sceneDetails) {
    const sceneMarkdown = htmlToWrappedMarkdown(negotiation.sceneDetails)
    if (sceneMarkdown) {
      sections.push("", sceneMarkdown)
    }
  }

  // Motivations section
  const motivationsSection = generateTraitsSection(negotiation.motivations, "## Motivations")
  if (motivationsSection) {
    sections.push("", motivationsSection)
  }

  // Pitfalls section
  const pitfallsSection = generateTraitsSection(negotiation.pitfalls, "## Pitfalls")
  if (pitfallsSection) {
    sections.push("", pitfallsSection)
  }

  // Outcomes table
  sections.push("", "", generateOutcomesTable(negotiation))

  // Rules reference tables
  if (negotiation.includeRulesReference) {
    sections.push("", "", RULES_REFERENCE_TEXT)
  }

  return sections.join("\n")
}
