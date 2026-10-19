import { describe, expect, it } from "vitest"
import type { Negotiation, Trait } from "../types/negotiation"
import { createDefaultOutcomes, createDefaultTrait } from "./defaults"
import {
  buildNegotiationModuleDocument,
  generateNegotiationModuleJson,
} from "./negotiationModuleJson"

const createNegotiation = (overrides: Partial<Negotiation> = {}): Negotiation => ({
  id: "negotiation-id",
  title: "Zola Honeycut",
  impression: 3,
  nativeLanguage: "Hyrallic",
  startingInterest: 2,
  startingPatience: 3,
  motivations: [],
  pitfalls: [],
  outcomes: createDefaultOutcomes(),
  sceneDetails: "",
  includeRulesReference: true,
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
})

const createTrait = (name: string, description: string = "<p>A note.</p>"): Trait =>
  createDefaultTrait(name, description)

describe("buildNegotiationModuleDocument", () => {
  it("uses the NPC name for both the negotiation name and the NPC", () => {
    const document = buildNegotiationModuleDocument(createNegotiation({ title: "Zola Honeycut" }))

    expect(document.name).toBe("Zola Honeycut")
    expect(document.npc).toBe("Zola Honeycut")
  })

  it("still names an unnamed negotiation, since the module refuses one without", () => {
    expect(buildNegotiationModuleDocument(createNegotiation({ title: "" }))).toMatchObject({
      name: "Negotiation",
      npc: "",
    })
    expect(buildNegotiationModuleDocument(createNegotiation({ title: "   " })).name).toBe(
      "Negotiation",
    )
  })

  it("passes the native language through", () => {
    const document = buildNegotiationModuleDocument(
      createNegotiation({ nativeLanguage: "Caelian" }),
    )

    expect(document.language).toBe("Caelian")
  })

  it("drops fields the module has no slot for", () => {
    const document = buildNegotiationModuleDocument(createNegotiation())

    expect(Object.keys(document).sort()).toEqual([
      "attitude",
      "impression",
      "interest",
      "language",
      "motivations",
      "name",
      "npc",
      "offers",
      "patience",
      "pitfalls",
      "summary",
    ])
  })

  it("passes starting values through unclamped, since the module clamps on import", () => {
    const document = buildNegotiationModuleDocument(
      createNegotiation({ startingInterest: 0, startingPatience: 0, impression: 12 }),
    )

    expect(document).toMatchObject({ interest: 0, patience: 0, impression: 12 })
  })

  describe("attitude", () => {
    const attitudeFor = (startingInterest: number, startingPatience: number): string =>
      buildNegotiationModuleDocument(createNegotiation({ startingInterest, startingPatience }))
        .attitude

    it("names the attitude whose starting values match exactly", () => {
      expect(attitudeFor(1, 2)).toBe("hostile")
      expect(attitudeFor(2, 2)).toBe("suspicious")
      expect(attitudeFor(2, 3)).toBe("neutral")
      expect(attitudeFor(3, 3)).toBe("open")
      expect(attitudeFor(3, 4)).toBe("friendly")
      expect(attitudeFor(3, 5)).toBe("trusting")
    })

    it("picks the closest attitude when none matches", () => {
      expect(attitudeFor(4, 3)).toBe("open")
      expect(attitudeFor(2, 1)).toBe("suspicious")
    })

    it("picks the closest attitude at the ends of the scales", () => {
      expect(attitudeFor(0, 0)).toBe("hostile")
      expect(attitudeFor(5, 5)).toBe("trusting")
    })

    it("prefers the less friendly attitude on a tie", () => {
      // Interest 2, patience 4 is one step from both neutral and friendly.
      expect(attitudeFor(2, 4)).toBe("neutral")
    })
  })

  describe("summary", () => {
    it("is empty when there are no scene details", () => {
      expect(buildNegotiationModuleDocument(createNegotiation({ sceneDetails: "" })).summary).toBe(
        "",
      )
      expect(
        buildNegotiationModuleDocument(createNegotiation({ sceneDetails: "<p></p>" })).summary,
      ).toBe("")
    })

    it("converts rich text scene details to markdown", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          sceneDetails: "<p>The heroes need the <strong>clock</strong> back.</p>",
        }),
      )

      expect(document.summary).toBe("The heroes need the **clock** back.")
    })

    it("leaves out hidden blocks, since the module shows the summary to the players", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          sceneDetails:
            '<p>Visible.</p><div data-hidden="true"><p>Director only.</p></div><p>Also visible.</p>',
        }),
      )

      expect(document.summary).toBe("Visible.\n\nAlso visible.")
    })

    it("is empty when every block is hidden", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({ sceneDetails: '<div data-hidden="true"><p>Director only.</p></div>' }),
      )

      expect(document.summary).toBe("")
    })
  })

  describe("motivations and pitfalls", () => {
    it("are empty when there are none", () => {
      const document = buildNegotiationModuleDocument(createNegotiation())

      expect(document.motivations).toEqual([])
      expect(document.pitfalls).toEqual([])
    })

    it("names each trait by its module id", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          motivations: [createTrait("Benevolence"), createTrait("Higher Authority")],
          pitfalls: [createTrait("Revelry")],
        }),
      )

      expect(document.motivations.map((motivation) => motivation.trait)).toEqual([
        "benevolence",
        "higherauthority",
      ])
      expect(document.pitfalls.map((pitfall) => pitfall.trait)).toEqual(["revelry"])
    })

    it("recognizes standard trait names typed loosely", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          motivations: [createTrait("  higher-authority "), createTrait("GREED")],
        }),
      )

      expect(document.motivations.map((motivation) => motivation.trait)).toEqual([
        "higherauthority",
        "greed",
      ])
    })

    it("converts the rich text description to a markdown note", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          motivations: [createTrait("Legacy", "<p>Wants a <em>statue</em>.</p><p>A big one.</p>")],
        }),
      )

      expect(document.motivations).toEqual([
        { trait: "legacy", note: "Wants a *statue*.\n\nA big one." },
      ])
    })

    it("sends custom traits by name, so the module's import summary lists them as skipped", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          motivations: [createTrait("  Love "), createTrait("Peace")],
          pitfalls: [createTrait("Spiders")],
        }),
      )

      expect(document.motivations.map((motivation) => motivation.trait)).toEqual(["Love", "peace"])
      expect(document.pitfalls.map((pitfall) => pitfall.trait)).toEqual(["Spiders"])
    })

    it("leaves out traits with no name", () => {
      const document = buildNegotiationModuleDocument(
        createNegotiation({
          motivations: [createTrait(""), createTrait("   "), createTrait("Power")],
        }),
      )

      expect(document.motivations.map((motivation) => motivation.trait)).toEqual(["power"])
    })
  })

  describe("offers", () => {
    it("are blank when no details are written, so the module uses the rulebook's text", () => {
      const document = buildNegotiationModuleDocument(createNegotiation())

      expect(document.offers).toEqual({ "0": "", "1": "", "2": "", "3": "", "4": "", "5": "" })
    })

    it("carry the written details, trimmed", () => {
      const outcomes = createDefaultOutcomes().map((outcome) =>
        outcome.interestLevel === 3
          ? { ...outcome, details: "  She lends the clock for one night.  " }
          : outcome,
      )
      const document = buildNegotiationModuleDocument(createNegotiation({ outcomes }))

      expect(document.offers["3"]).toBe("She lends the clock for one night.")
      expect(document.offers["4"]).toBe("")
    })

    it("treat whitespace-only details as unwritten", () => {
      const outcomes = createDefaultOutcomes().map((outcome) => ({ ...outcome, details: "   " }))
      const document = buildNegotiationModuleDocument(createNegotiation({ outcomes }))

      expect(document.offers["1"]).toBe("")
    })
  })
})

describe("generateNegotiationModuleJson", () => {
  const negotiation = createNegotiation({
    title: "Zola Honeycut",
    nativeLanguage: "Hyrallic",
    startingInterest: 2,
    startingPatience: 2,
    impression: 3,
    sceneDetails: "<p>What the heroes want, and why the NPC is torn.</p>",
    motivations: [createTrait("Benevolence", "<p>She feeds the street kids.</p>")],
    pitfalls: [createTrait("Higher Authority", "<p>She answers to no one.</p>")],
  })

  it("pretty prints with two space indentation", () => {
    const lines = generateNegotiationModuleJson(negotiation).split("\n")

    expect(lines[0]).toBe("{")
    expect(lines[1]).toBe('  "name": "Zola Honeycut",')
  })

  it("lists offers from interest 0 up, like the module's template", () => {
    const parsed = JSON.parse(generateNegotiationModuleJson(negotiation)) as {
      readonly offers: Record<string, string>
    }

    expect(Object.keys(parsed.offers)).toEqual(["0", "1", "2", "3", "4", "5"])
  })

  it("matches the module's document shape", () => {
    expect(JSON.parse(generateNegotiationModuleJson(negotiation))).toEqual({
      name: "Zola Honeycut",
      npc: "Zola Honeycut",
      language: "Hyrallic",
      attitude: "suspicious",
      interest: 2,
      patience: 2,
      impression: 3,
      summary: "What the heroes want, and why the NPC is torn.",
      motivations: [{ trait: "benevolence", note: "She feeds the street kids." }],
      pitfalls: [{ trait: "higherauthority", note: "She answers to no one." }],
      offers: { "0": "", "1": "", "2": "", "3": "", "4": "", "5": "" },
    })
  })
})
