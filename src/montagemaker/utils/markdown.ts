import dedent from "dedent"
import type { Montage, HeroCount, Difficulty, Challenge } from "../types/montage"
import { DEFAULT_OUTCOMES_HTML } from "../constants/outcomes"
import { htmlToWrappedMarkdown } from "../../utils/codexMarkdown"

const VISIBLE_WRAPPER_OPEN = "{!"

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
