import type { Negotiation, Trait } from "../types/negotiation"
import { MOTIVATION_NAMES, RULES_REFERENCE_TEXT } from "../constants/negotiation"

const htmlToMarkdown = (html: string): string => {
  if (!html || html === "<p></p>") {
    return ""
  }

  return html
    .replace(/<h2>([\s\S]*?)<\/h2>/g, "## $1\n")
    .replace(/<h4>([\s\S]*?)<\/h4>/g, "#### $1\n")
    .replace(/<ul>([\s\S]*?)<\/ul>/g, (_match, content: string) => {
      const items = content.match(/<li>([\s\S]*?)<\/li>/g) ?? []
      const listItems = items
        .map((item) => {
          const text = item.replace(/<\/?li>/g, "").trim()
          return `* ${text}`
        })
        .join("\n")
      return `\n${listItems}`
    })
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/g, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
    .replace(/<i>([\s\S]*?)<\/i>/g, "*$1*")
    .replace(/<\/p><p>/g, "\n\n")
    .replace(/<\/?p>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

const generateTrait = (trait: Trait): string => {
  const description = htmlToMarkdown(trait.description)
  if (description) {
    return `{**${trait.name}**}\n{${description}}`
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

const generateAllMotivationsLine = (): string => {
  const names = MOTIVATION_NAMES.join(", ")
  return `All Motivations & Pitfalls:\n*${names}*`
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

  // Visible trackers (always 5 dashes)
  sections.push("", "INTEREST:  [[-----]] ", "PATIENCE:  [[-----]]")

  // Image placeholder
  sections.push("", "[[image]]")

  // All motivations & pitfalls reference line
  sections.push("", generateAllMotivationsLine())

  // Scene details
  if (negotiation.sceneDetails) {
    const sceneMarkdown = htmlToMarkdown(negotiation.sceneDetails)
    if (sceneMarkdown) {
      sections.push("", sceneMarkdown)
    }
  }

  // Motivations section
  const motivationsSection = generateTraitsSection(negotiation.motivations, "\nMotivations")
  if (motivationsSection) {
    sections.push("", motivationsSection)
  }

  // Pitfalls section
  const pitfallsSection = generateTraitsSection(negotiation.pitfalls, "\n& Pitfalls ")
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
