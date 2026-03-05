import dedent from "dedent"
import type { Montage, HeroCount, Difficulty, Challenge } from "../types/montage"
import { DEFAULT_OUTCOMES_HTML } from "../constants/outcomes"

const VISIBLE_WRAPPER_OPEN = "{!"
const HIDDEN_WRAPPER_OPEN = "{"

/**
 * Convert a victory count to the appropriate markdown button syntax.
 */
const victoryCountToMarkdown = (count: number): string => {
  const label = count === 1 ? "Award Heroes 1 Victory" : `Award Heroes ${count} Victories`
  return `[[/awardvp ${count}|${label}]]`
}

/**
 * Convert HTML from the rich text editor to markdown.
 * Handles: headings (h2, h4), bold, italic, bullet lists, victory buttons. Strips other tags.
 */
const htmlToMarkdown = (html: string): string => {
  // Handle empty or minimal content
  if (!html || html === "<p></p>") {
    return ""
  }

  // Process the HTML step by step
  const result = html
    // Convert victory button spans to markdown syntax (before stripping tags)
    .replace(
      /<span[^>]*data-victory-button="true"[^>]*data-victory-count="(\d+)"[^>]*>[^<]*<\/span>/g,
      (_match, count: string) => victoryCountToMarkdown(parseInt(count, 10)),
    )
    // Also handle the reverse attribute order
    .replace(
      /<span[^>]*data-victory-count="(\d+)"[^>]*data-victory-button="true"[^>]*>[^<]*<\/span>/g,
      (_match, count: string) => victoryCountToMarkdown(parseInt(count, 10)),
    )
    // Convert h2 headings to ## headers
    .replace(/<h2>([\s\S]*?)<\/h2>/g, "## $1\n")
    // Convert h4 headings to #### subheaders
    .replace(/<h4>([\s\S]*?)<\/h4>/g, "#### $1\n")
    // Convert bullet lists (before stripping tags)
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
    // Convert bold
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/g, "**$1**")
    // Convert italic
    .replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
    .replace(/<i>([\s\S]*?)<\/i>/g, "*$1*")
    // Convert paragraphs to double newlines (for markdown paragraph breaks)
    .replace(/<\/p><p>/g, "\n\n")
    // Strip remaining p tags
    .replace(/<\/?p>/g, "")
    // Strip any other remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Clean up extra whitespace
    .trim()

  return result
}

interface ContentSection {
  readonly content: string
  readonly isHidden: boolean
}

/**
 * Split HTML into visible and hidden sections.
 * Hidden sections are wrapped in <div data-hidden="true">...</div>
 */
const splitIntoSections = (html: string): readonly ContentSection[] => {
  if (!html || html === "<p></p>") {
    return []
  }

  // Split by hidden blocks, capturing the inner content
  // Results in alternating [visible, hiddenContent, visible, hiddenContent, ...]
  const hiddenBlockRegex = /<div data-hidden="true">([\s\S]*?)<\/div>/g
  const segments = html.split(hiddenBlockRegex)

  return segments
    .map((segment, index) => ({
      content: htmlToMarkdown(segment),
      isHidden: index % 2 === 1, // Odd indices are captured hidden content
    }))
    .filter((section) => section.content !== "")
}

/**
 * Convert HTML with hidden blocks to wrapped markdown sections.
 * Visible content is wrapped in {! }, hidden content in { }.
 * The newlines must be present after the opening brace or Codex will display
 * it as censored spoiler text rather than actually hiding it.
 */
const htmlToWrappedMarkdown = (html: string): string => {
  const sections = splitIntoSections(html)

  if (sections.length === 0) {
    return ""
  }

  return sections
    .map((section) => {
      const opener = section.isHidden ? HIDDEN_WRAPPER_OPEN : VISIBLE_WRAPPER_OPEN
      return dedent`
        ${opener}
        ${section.content}
        }`
    })
    .join("\n")
}

const detailsToMarkdown = (html: string): string => htmlToWrappedMarkdown(html)

const heroCountOrder: readonly HeroCount[] = ["three", "four", "five", "six"]
const difficultyOrder: readonly Difficulty[] = ["easy", "medium", "hard"]

const heroCountLabels: Record<HeroCount, string> = {
  three: "Three",
  four: "Four",
  five: "Five",
  six: "Six",
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

const generateDashes = (count: number): string => "-".repeat(count)

const generateTable = (montage: Montage): string => {
  const { difficultyTable } = montage
  const difficulties = montage.difficulty ? [montage.difficulty] : difficultyOrder
  const heroCounts = montage.heroCount ? [montage.heroCount] : heroCountOrder

  // Build header row
  const difficultyHeaders = difficulties
    .map((currentDifficulty) => `**${difficultyLabels[currentDifficulty]}**||`)
    .join("")
  const difficultySubHeaders = difficulties.map(() => "**Success**|**Failure**|").join("")

  const lines: string[] = [
    "**Montage Test Difficulty**",
    `|**Heroes**|${difficultyHeaders}`,
    `|**Limits**|${difficultySubHeaders}`,
  ]

  for (const currentHeroCount of heroCounts) {
    const row = difficultyTable[currentHeroCount]
    const cells = difficulties
      .map(
        (currentDifficulty) =>
          `${row[currentDifficulty].success}|${row[currentDifficulty].failure}|`,
      )
      .join("")
    lines.push(`|**${heroCountLabels[currentHeroCount]}**|${cells}`)
  }

  return lines.join("\n")
}

const generateButtons = (montage: Montage): string => {
  const parts: string[] = []

  if (!montage.heroCount) {
    parts.push("||[[setting:Number of Heroes]]||")
  }

  if (!montage.difficulty) {
    parts.push(
      "||Difficulty:||:<>[[/setvar montage_difficulty 1|Easy]][[/setvar montage_difficulty 2|Medium]][[/setvar montage_difficulty 3|Hard]]||",
    )
  }

  return parts.join("\n")
}

const generateTracker = (successCount: number, failureCount: number): string => dedent`
  |Successes: |[[${generateDashes(successCount)}]]|
  |||
  |Failures: |[[${generateDashes(failureCount)}]]|
  |||`

const generateQueryBlock = (
  conditions: readonly string[],
  successCount: number,
  failureCount: number,
): string => {
  const tracker = generateTracker(successCount, failureCount)

  if (conditions.length === 0) {
    return tracker
  }

  const query =
    conditions.length === 1 ? conditions[0] : conditions.map((cond) => `(${cond})`).join(" and ")

  return dedent`
    ???query ${query}
    ${tracker}
    ???`
}

const generateQueryBlocks = (montage: Montage): string => {
  const { difficultyTable } = montage
  const difficultyNumMap: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }
  const heroConditionMap: Record<HeroCount, string> = {
    three: "numheroes < 4",
    four: "numheroes = 4",
    five: "numheroes = 5",
    six: "numheroes > 5",
  }

  const difficulties = montage.difficulty ? [montage.difficulty] : difficultyOrder
  const heroCounts = montage.heroCount ? [montage.heroCount] : heroCountOrder

  const blocks: string[] = []

  for (const currentDifficulty of difficulties) {
    for (const currentHeroCount of heroCounts) {
      const cell = difficultyTable[currentHeroCount][currentDifficulty]
      const conditions: string[] = []

      if (!montage.difficulty) {
        conditions.push(`montage_difficulty = ${difficultyNumMap[currentDifficulty]}`)
      }
      if (!montage.heroCount) {
        conditions.push(heroConditionMap[currentHeroCount])
      }

      blocks.push(generateQueryBlock(conditions, cell.success, cell.failure))
    }
  }

  return blocks.join("\n")
}

const generateChallenge = (challenge: Challenge, includeRollButtons: boolean): string => {
  const chars = challenge.suggestedCharacteristics.join(" or ")
  const skills = challenge.suggestedSkills.join(" or ")
  const extraDetails = challenge.extraDetails?.trim()
  const checkboxCount = challenge.timesCompletable ?? 1
  const checkboxes = Array(checkboxCount)
    .fill("[ ]")
    .reduce((checkboxes, currentCheckbox) => checkboxes + "||" + currentCheckbox, "")
    .concat("||")
    .trim()

  const baseLines = [
    `**${challenge.name}:** ${challenge.description}`,
    `*Suggested Characteristics*: ${chars}`,
    `*Suggested Skills*: ${skills}`,
  ]

  if (extraDetails) {
    baseLines.push(extraDetails)
  }

  baseLines.push(`${checkboxes}`)

  const base = baseLines.join("\n")

  if (!includeRollButtons) {
    return base
  }

  // Build roll button label: "{name}: {chars} ({skills})"
  const rollParts = [challenge.name]
  if (chars) {
    rollParts.push(`: ${chars}`)
  }
  const rollLabel = rollParts.join("")
  const skillsSuffix = skills ? ` (${skills})` : ""

  const difficultyKeyword = difficultyLabels[challenge.difficulty]

  return dedent`
    ${base}
    {
    |${rollLabel}${skillsSuffix}
    |${difficultyKeyword}
    }`
}

const generateChallenges = (montage: Montage): string => {
  if (montage.challenges.length === 0) {
    return ""
  }
  const includeRollButtons = montage.includeRollButtons ?? false
  return montage.challenges
    .map((challenge) => {
      const challengeMarkdown = generateChallenge(challenge, includeRollButtons)
      if (challenge.hidden) {
        return `${VISIBLE_WRAPPER_OPEN}\n${challengeMarkdown}\n}`
      }
      return challengeMarkdown
    })
    .join("\n\n")
}

const generatePlayerTracker = (): string => dedent`
  :<>[[Party:Available Players]]
  :<>[[Party:Current Player]]
  :<>[[Party:Acted Players]]`

const generateDetailedOutcomes = (): string => dedent`
  {
  ## Montage Outcomes

  #### Total Success

  If the heroes earn a total success, they achieve what they set out to do without complication.
  The heroes earn 1 Victory when they achieve total success on an easy or moderate montage test, and 2 Victories on a hard montage test.
  [[//awardvp 1 |Award Heroes 1 Victory]] or [[//awardvp 2|Award Heroes 2 Victories]]


  #### Partial Success

  If the heroes earn a partial success, they succeed at what they set out to do, but there is a complication or a cost involved.
  The heroes earn 1 Victory when they achieve partial success on a hard or moderate montage test.
  [[//awardvp 1 |Award Heroes 1 Victory]]


  ### Total Failure

  If the heroes suffer total failure, they don't achieve what they set out to do.
  }`

const generateSimpleOutcomes = (): string => dedent`
  {
  ## Montage Outcomes

  [[//awardvp 1 |Award Heroes 1 Victory]]   [[//awardvp 2|Award Heroes 2 Victories]]
  }`

const generateCustomOutcomes = (html: string): string =>
  htmlToWrappedMarkdown(html || DEFAULT_OUTCOMES_HTML)

const generateSceneSnippet = (): string => dedent`
  {
  Add a Scene here to show to your players while the montage is happening. Make sure to select **ShowBelow UI** so that they can still access their character panel and roll dice.
  :<>[[scene:image]]
  }`

export const generateMarkdown = (montage: Montage): string => {
  const sections: string[] = [`# ${montage.title}`]

  sections.push("", generateSceneSnippet())

  if (montage.details) {
    const detailsMarkdown = detailsToMarkdown(montage.details)
    if (detailsMarkdown) {
      sections.push("", detailsMarkdown)
    }
  }

  const bothLocked = montage.difficulty !== null && montage.heroCount !== null
  const buttons = generateButtons(montage)

  // Party section
  sections.push("", "## Party", "")

  if (bothLocked && !buttons) {
    // Both set: table in { } with no buttons, query blocks have no wrapper
    sections.push("{", generateTable(montage), "}", "", "{!", generateQueryBlocks(montage), "}")
  } else {
    sections.push("{", generateTable(montage), "")
    if (buttons) {
      sections.push("", buttons)
    }
    sections.push("}", "", "{!", generateQueryBlocks(montage), "}")
  }

  if (montage.includePlayerTracker) {
    sections.push("", generatePlayerTracker())
  }

  const challengesSection = generateChallenges(montage)
  if (challengesSection) {
    sections.push("", "## Challenges", "", challengesSection)
  }

  switch (montage.outcomesMode) {
    case "default":
      sections.push("", "", generateDetailedOutcomes())
      break
    case "minimal":
      sections.push("", "", generateSimpleOutcomes())
      break
    case "custom":
      sections.push("", "", generateCustomOutcomes(montage.customOutcomesHtml))
      break
  }

  return sections.join("\n")
}
