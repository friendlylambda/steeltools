import { describe, expect, it } from "vitest"
import type { Challenge, Montage } from "../types/montage"
import { createDefaultChallenge, createDefaultDifficultyTable } from "./defaults"
import { buildMontageModuleDocument, generateMontageModuleJson } from "./montageModuleJson"

const createMontage = (overrides: Partial<Montage> = {}): Montage => ({
  id: "montage-id",
  title: "Crossing the Desert",
  details: "",
  difficultyTable: createDefaultDifficultyTable(),
  challenges: [],
  includePlayerTracker: true,
  includeDetailedOutcomes: false,
  includeRollButtons: false,
  outcomesMode: "minimal",
  customOutcomesHtml: "",
  difficulty: "medium",
  heroCount: "four",
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
})

const createChallenge = (overrides: Partial<Challenge> = {}): Challenge => ({
  ...createDefaultChallenge(),
  name: "Ford the River",
  description: "The current is fast and the water is cold.",
  ...overrides,
})

describe("buildMontageModuleDocument", () => {
  it("carries the module's readme verbatim", () => {
    const document = buildMontageModuleDocument(createMontage())

    expect(document._readme).toEqual([
      "Paste one montage. Keys starting with _ are ignored.",
      "rules: baseline | to",
      "characteristics and skills: display names or ids. Unknown entries are skipped.",
      "successLadder: total_success | partial_success | total_failure",
      "successLadderShown: whether the table reads the ladder.",
      "difficulty: easy | medium | hard",
    ])
  })

  it("exports the baseline rules with a two round limit", () => {
    const document = buildMontageModuleDocument(createMontage())

    expect(document.rules).toBe("baseline")
    expect(document.settings.roundLimit).toBe(2)
  })

  it("uses the montage title as the name", () => {
    const document = buildMontageModuleDocument(createMontage({ title: "Storm the Gate" }))

    expect(document.name).toBe("Storm the Gate")
  })

  describe("settings", () => {
    it("reads the limits from the locked hero count and difficulty", () => {
      const document = buildMontageModuleDocument(
        createMontage({ heroCount: "six", difficulty: "hard" }),
      )

      expect(document.settings).toEqual({ successLimit: 8, failureLimit: 4, roundLimit: 2 })
    })

    it("falls back to four heroes when the hero count is unlocked", () => {
      const document = buildMontageModuleDocument(
        createMontage({ heroCount: null, difficulty: "easy" }),
      )

      expect(document.settings).toEqual({ successLimit: 4, failureLimit: 4, roundLimit: 2 })
    })

    it("falls back to medium when the difficulty is unlocked", () => {
      const document = buildMontageModuleDocument(
        createMontage({ heroCount: "five", difficulty: null }),
      )

      expect(document.settings).toEqual({ successLimit: 6, failureLimit: 4, roundLimit: 2 })
    })

    it("falls back to four heroes at medium when neither is locked", () => {
      const document = buildMontageModuleDocument(
        createMontage({ heroCount: null, difficulty: null }),
      )

      expect(document.settings).toEqual({ successLimit: 5, failureLimit: 3, roundLimit: 2 })
    })

    it("reads edited limits rather than the default table", () => {
      const defaultTable = createDefaultDifficultyTable()
      const document = buildMontageModuleDocument(
        createMontage({
          heroCount: "three",
          difficulty: "easy",
          difficultyTable: {
            ...defaultTable,
            three: { ...defaultTable.three, easy: { success: 9, failure: 1 } },
          },
        }),
      )

      expect(document.settings).toEqual({ successLimit: 9, failureLimit: 1, roundLimit: 2 })
    })
  })

  describe("description", () => {
    it("is empty when the montage has no details", () => {
      expect(buildMontageModuleDocument(createMontage({ details: "" })).description).toBe("")
      expect(buildMontageModuleDocument(createMontage({ details: "<p></p>" })).description).toBe("")
    })

    it("converts rich text details to markdown", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          details: "<p>The sand is <strong>hot</strong> and the wind is <em>brutal</em>.</p>",
        }),
      )

      expect(document.description).toBe("The sand is **hot** and the wind is *brutal*.")
    })

    it("converts headings and bullet lists", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          details: "<h2>The Scene</h2><ul><li>Blazing heat</li><li>No water</li></ul>",
        }),
      )

      expect(document.description).toBe("## The Scene\n\n* Blazing heat\n* No water")
    })

    it("keeps the text of hidden blocks, since the module has nowhere to hide it", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          details: '<p>Visible.</p><div data-hidden="true"><p>Director only.</p></div>',
        }),
      )

      expect(document.description).toBe("Visible.\n\nDirector only.")
    })
  })

  describe("challenges", () => {
    it("is empty when the montage has none", () => {
      expect(buildMontageModuleDocument(createMontage()).challenges).toEqual([])
    })

    it("maps every challenge field the module accepts", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          challenges: [
            createChallenge({
              name: "Ford the River",
              description: "The current is fast and the water is cold.",
              suggestedCharacteristics: ["Might", "Agility"],
              suggestedSkills: ["Swim", "Climb"],
              difficulty: "hard",
              timesCompletable: 1,
            }),
          ],
        }),
      )

      expect(document.challenges).toEqual([
        {
          name: "Ford the River",
          description: "The current is fast and the water is cold.",
          availableFromRound: 1,
          repeatable: 0,
          characteristics: ["Might", "Agility"],
          skills: ["Swim", "Climb"],
          difficulty: "hard",
        },
      ])
    })

    it("keeps challenges in order", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          challenges: [
            createChallenge({ name: "First" }),
            createChallenge({ name: "Second" }),
            createChallenge({ name: "Third" }),
          ],
        }),
      )

      expect(document.challenges.map((challenge) => challenge.name)).toEqual([
        "First",
        "Second",
        "Third",
      ])
    })

    it("exports hidden challenges too, since the import is Director side", () => {
      const document = buildMontageModuleDocument(
        createMontage({ challenges: [createChallenge({ name: "Secret Door", hidden: true })] }),
      )

      expect(document.challenges.map((challenge) => challenge.name)).toEqual(["Secret Door"])
    })

    it("drops fields the module has no slot for", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          challenges: [
            createChallenge({
              extraDetails: "Costs an hour of daylight.",
              consequences: "The raiders arrive early.",
              hidden: true,
              tierResults: {
                tier1: "Swept downstream.",
                tier2: "Across, but soaked.",
                tier3: "Across cleanly.",
                critical: "",
              },
            }),
          ],
        }),
      )

      expect(Object.keys(document.challenges[0] ?? {}).sort()).toEqual([
        "availableFromRound",
        "characteristics",
        "description",
        "difficulty",
        "name",
        "repeatable",
        "skills",
      ])
    })

    it("leaves markup-like challenge text alone, since it is already plain", () => {
      const document = buildMontageModuleDocument(
        createMontage({
          challenges: [createChallenge({ description: "Use **rope** & <gear> if you have it." })],
        }),
      )

      expect(document.challenges[0]?.description).toBe("Use **rope** & <gear> if you have it.")
    })

    describe("repeatable", () => {
      const repeatableFor = (timesCompletable: number | undefined): number | undefined => {
        // Challenges persisted before timesCompletable existed still lack it,
        // so undefined is a real input the export has to survive.
        const challenge = { ...createChallenge(), timesCompletable } as Challenge
        const document = buildMontageModuleDocument(createMontage({ challenges: [challenge] }))
        return document.challenges[0]?.repeatable
      }

      it("counts attempts beyond the first", () => {
        expect(repeatableFor(1)).toBe(0)
        expect(repeatableFor(2)).toBe(1)
        expect(repeatableFor(3)).toBe(2)
      })

      it("never goes negative", () => {
        expect(repeatableFor(0)).toBe(0)
        expect(repeatableFor(-4)).toBe(0)
      })

      it("treats a missing count as completable once", () => {
        expect(repeatableFor(undefined)).toBe(0)
      })

      it("rounds fractional counts", () => {
        expect(repeatableFor(2.4)).toBe(1)
        expect(repeatableFor(2.6)).toBe(2)
      })
    })
  })
})

describe("generateMontageModuleJson", () => {
  const montage = createMontage({
    title: "Crossing the Desert",
    details: "<p>Reach the city before the army does.</p>",
    heroCount: "four",
    difficulty: "hard",
    challenges: [
      createChallenge({
        name: "Read the Dunes",
        description: "Pick a path the sand won't swallow.",
        suggestedCharacteristics: ["Intuition"],
        suggestedSkills: ["Navigate"],
        difficulty: "easy",
        timesCompletable: 2,
      }),
    ],
  })

  it("pretty prints with two space indentation", () => {
    const lines = generateMontageModuleJson(montage).split("\n")

    expect(lines[0]).toBe("{")
    expect(lines[1]).toBe('  "_readme": [')
  })

  it("matches the module's document shape", () => {
    expect(JSON.parse(generateMontageModuleJson(montage))).toEqual({
      _readme: [
        "Paste one montage. Keys starting with _ are ignored.",
        "rules: baseline | to",
        "characteristics and skills: display names or ids. Unknown entries are skipped.",
        "successLadder: total_success | partial_success | total_failure",
        "successLadderShown: whether the table reads the ladder.",
        "difficulty: easy | medium | hard",
      ],
      name: "Crossing the Desert",
      description: "Reach the city before the army does.",
      rules: "baseline",
      settings: { successLimit: 6, failureLimit: 2, roundLimit: 2 },
      challenges: [
        {
          name: "Read the Dunes",
          description: "Pick a path the sand won't swallow.",
          availableFromRound: 1,
          repeatable: 1,
          characteristics: ["Intuition"],
          skills: ["Navigate"],
          difficulty: "easy",
        },
      ],
    })
  })
})
