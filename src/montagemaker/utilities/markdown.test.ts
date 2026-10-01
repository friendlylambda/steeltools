import { describe, expect, it } from "vitest"
import type { Challenge, Montage } from "../types/montage"
import { createDefaultChallenge, createDefaultDifficultyTable } from "./defaults"
import { generateMarkdown } from "./markdown"

const createChallenge = (overrides: Partial<Challenge> = {}): Challenge => ({
  ...createDefaultChallenge(),
  name: "Ford the River",
  description: "The current is fast and the water is cold.",
  suggestedCharacteristics: ["Might"],
  suggestedSkills: ["Swim"],
  ...overrides,
})

const createMontage = (challenge: Challenge): Montage => ({
  id: "montage-id",
  title: "Crossing",
  details: "",
  difficultyTable: createDefaultDifficultyTable(),
  challenges: [challenge],
  includePlayerTracker: false,
  includeDetailedOutcomes: false,
  includeRollButtons: true,
  outcomesMode: "minimal",
  customOutcomesHtml: "",
  difficulty: "medium",
  heroCount: "four",
  createdAt: 0,
  updatedAt: 0,
})

// The roll button block: every line from its header to the closing brace
const rollButtonOf = (challenge: Challenge): readonly string[] => {
  const lines = generateMarkdown(createMontage(challenge)).split("\n")
  const headerIndex = lines.findIndex((line) => line.startsWith(`|${challenge.name}`))
  if (headerIndex === -1) {
    return []
  } else {
    return lines.slice(headerIndex, lines.indexOf("}", headerIndex))
  }
}

describe("roll buttons", () => {
  it("names the difficulty preset when the results are standard", () => {
    expect(rollButtonOf(createChallenge({ difficulty: "hard" }))).toEqual([
      "|Ford the River: Might (Swim)",
      "|Hard",
    ])
  })

  it("spells out custom results, with the difficulty moved into the name", () => {
    const challenge = createChallenge({
      tierResults: {
        tier1: "Swept downstream.",
        tier2: "Across, but soaked.",
        tier3: "Across cleanly.",
        critical: "",
      },
    })

    expect(rollButtonOf(challenge)).toEqual([
      "|Ford the River (Medium): Might (Swim)",
      "|Swept downstream.",
      "|Across, but soaked.",
      "|Across cleanly.",
    ])
  })

  it("adds the critical as a fourth line when there is one", () => {
    const challenge = createChallenge({
      tierResults: { tier1: "One.", tier2: "Two.", tier3: "Three.", critical: "Crit." },
    })

    expect(rollButtonOf(challenge).at(-1)).toBe("|Crit.")
  })

  it("keeps a critical from reading as a rider", () => {
    const challenge = createChallenge({
      tierResults: {
        tier1: "One.",
        tier2: "Two.",
        tier3: "Three.",
        critical: "Edge: on the next test.",
      },
    })

    expect(rollButtonOf(challenge).at(-1)).toBe("|Edge - on the next test.")
  })

  it("falls back to the standard text for blank tiers", () => {
    const challenge = createChallenge({
      difficulty: "easy",
      tierResults: { tier1: "  ", tier2: "Two.", tier3: "", critical: "" },
    })

    expect(rollButtonOf(challenge).slice(1)).toEqual([
      "|You succeed on the task and incur a consequence.",
      "|Two.",
      "|You succeed on the task with a reward.",
    ])
  })

  it("strips pipes and line breaks, which would split the roll apart", () => {
    const challenge = createChallenge({
      tierResults: {
        tier1: "Wet | cold\nand tired.",
        tier2: "Two.",
        tier3: "Three.",
        critical: "",
      },
    })

    expect(rollButtonOf(challenge)[1]).toBe("|Wet cold and tired.")
  })

  it("rolls the skills alone when no characteristic is suggested", () => {
    expect(rollButtonOf(createChallenge({ suggestedCharacteristics: [] }))[0]).toBe(
      "|Ford the River: Swim",
    )
  })

  it("has no roll button when there is nothing to roll", () => {
    const challenge = createChallenge({ suggestedCharacteristics: [], suggestedSkills: [] })

    expect(rollButtonOf(challenge)).toEqual([])
  })
})
