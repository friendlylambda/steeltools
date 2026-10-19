import type { Negotiation, OutcomeRow, Trait } from "../types/negotiation"
import { MOTIVATION_NAMES, STARTING_ATTITUDES } from "../constants/negotiation"
import { htmlToPlainMarkdown, htmlToVisibleMarkdown } from "../../utilities/codexMarkdown"

// The module refuses a negotiation with no name, so an unnamed one still needs
// something. Matches the heading the markdown export falls back to.
const FALLBACK_NAME = "Negotiation"

export interface NegotiationModuleTrait {
  readonly trait: string
  readonly note: string
}

// Starting interest, patience, and impression go out as they are: the module
// clamps each to its own range on import.
export interface NegotiationModuleDocument {
  readonly name: string
  readonly npc: string
  readonly language: string
  readonly attitude: string
  readonly interest: number
  readonly patience: number
  readonly impression: number
  readonly summary: string
  readonly motivations: readonly NegotiationModuleTrait[]
  readonly pitfalls: readonly NegotiationModuleTrait[]
  readonly offers: Readonly<Record<string, string>>
}

// The module names traits by a lowercase id with no spaces, so "Higher
// Authority" becomes "higherauthority".
const toTraitId = (name: string): string => name.toLowerCase().replace(/[^a-z]/g, "")

const STANDARD_TRAIT_IDS: ReadonlySet<string> = new Set(MOTIVATION_NAMES.map(toTraitId))

// A negotiation stores starting interest and patience rather than the attitude
// that set them, and they can be stepped to pairs no attitude has. Pick the
// attitude whose pair is closest, with the earlier (less friendly) one winning
// a tie. The module keeps the interest and patience it is given either way.
const toAttitude = (interest: number, patience: number): string => {
  const candidates = Object.entries(STARTING_ATTITUDES).map(([name, attitude]) => ({
    name,
    distance: Math.abs(attitude.interest - interest) + Math.abs(attitude.patience - patience),
  }))
  const closest = candidates.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  )
  return closest.name.toLowerCase()
}

// Standard traits go out by id. The module only knows the twelve standard ones,
// but custom traits still go out by name so its import summary lists each one
// it skipped; a trait with no name has nothing to list and is left out.
const toTraitReference = (name: string): string => {
  const traitId = toTraitId(name)
  if (STANDARD_TRAIT_IDS.has(traitId)) {
    return traitId
  } else {
    return name.trim()
  }
}

const buildTraits = (traits: readonly Trait[]): readonly NegotiationModuleTrait[] =>
  traits
    .filter((trait) => trait.name.trim() !== "")
    .map((trait) => ({
      trait: toTraitReference(trait.name),
      note: htmlToPlainMarkdown(trait.description),
    }))

// Keyed by interest level. The module shows each level's label ("Yes, but...")
// on its own and fills a blank offer with the rulebook's text for that level,
// so only written details go out.
const buildOffers = (outcomes: readonly OutcomeRow[]): Readonly<Record<string, string>> =>
  Object.fromEntries(
    outcomes.map((outcome) => [String(outcome.interestLevel), outcome.details.trim()]),
  )

// The negotiation's one name field is the NPC's name, so it fills both the
// negotiation name and the NPC.
export const buildNegotiationModuleDocument = (
  negotiation: Negotiation,
): NegotiationModuleDocument => ({
  name: negotiation.title.trim() || FALLBACK_NAME,
  npc: negotiation.title,
  language: negotiation.nativeLanguage,
  attitude: toAttitude(negotiation.startingInterest, negotiation.startingPatience),
  interest: negotiation.startingInterest,
  patience: negotiation.startingPatience,
  impression: negotiation.impression,
  // The module shows the summary to the players, so hidden blocks stay out.
  summary: htmlToVisibleMarkdown(negotiation.sceneDetails ?? ""),
  motivations: buildTraits(negotiation.motivations),
  pitfalls: buildTraits(negotiation.pitfalls),
  offers: buildOffers(negotiation.outcomes),
})

export const generateNegotiationModuleJson = (negotiation: Negotiation): string =>
  JSON.stringify(buildNegotiationModuleDocument(negotiation), null, 2)
