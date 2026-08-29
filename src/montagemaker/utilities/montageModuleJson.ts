import type { Challenge, Difficulty, HeroCount, Montage } from "../types/montage"
import { htmlToPlainMarkdown } from "../../utilities/codexMarkdown"

// Verbatim from the Codex montage module's own template. The importer ignores
// keys starting with an underscore, so this rides along purely as documentation
// for anyone who opens the file by hand.
const README_LINES: readonly string[] = [
  "Paste one montage. Keys starting with _ are ignored.",
  "rules: baseline | to",
  "characteristics and skills: display names or ids. Unknown entries are skipped.",
  "difficulty: easy | medium | hard",
]

// Steel Tools models the core Draw Steel montage rules, which run over two
// montage test rounds with every challenge available from the first one. There
// is nothing in a montage to vary either value, so both are fixed here.
const RULES = "baseline"
const ROUND_LIMIT = 2
const AVAILABLE_FROM_ROUND = 1

// The module stores a single success/failure limit, while a montage carries the
// whole hero count by difficulty table. When the montage isn't locked to one
// cell, fall back to what a freshly created montage starts with.
const FALLBACK_HERO_COUNT: HeroCount = "four"
const FALLBACK_DIFFICULTY: Difficulty = "medium"

export interface MontageModuleSettings {
  readonly successLimit: number
  readonly failureLimit: number
  readonly roundLimit: number
}

export interface MontageModuleChallenge {
  readonly name: string
  readonly description: string
  readonly availableFromRound: number
  readonly repeatable: number
  readonly characteristics: readonly string[]
  readonly skills: readonly string[]
  readonly difficulty: Difficulty
}

export interface MontageModuleDocument {
  readonly _readme: readonly string[]
  readonly name: string
  readonly description: string
  readonly rules: typeof RULES
  readonly settings: MontageModuleSettings
  readonly challenges: readonly MontageModuleChallenge[]
}

// `repeatable` counts attempts beyond the first, so a challenge completable once
// exports as 0. Older persisted challenges can be missing timesCompletable.
const toRepeatable = (timesCompletable: number | undefined): number =>
  Math.max(0, Math.round(timesCompletable ?? 1) - 1)

const buildSettings = (montage: Montage): MontageModuleSettings => {
  const heroCount = montage.heroCount ?? FALLBACK_HERO_COUNT
  const difficulty = montage.difficulty ?? FALLBACK_DIFFICULTY
  const cell = montage.difficultyTable[heroCount][difficulty]

  return {
    successLimit: cell.success,
    failureLimit: cell.failure,
    roundLimit: ROUND_LIMIT,
  }
}

// Challenge text is already plain, unlike the montage's rich text details.
// Extra details, consequences, and the hidden flag have no slot in the module's
// format and are left out.
const buildChallenge = (challenge: Challenge): MontageModuleChallenge => ({
  name: challenge.name,
  description: challenge.description,
  availableFromRound: AVAILABLE_FROM_ROUND,
  repeatable: toRepeatable(challenge.timesCompletable),
  characteristics: challenge.suggestedCharacteristics,
  skills: challenge.suggestedSkills,
  difficulty: challenge.difficulty,
})

export const buildMontageModuleDocument = (montage: Montage): MontageModuleDocument => ({
  _readme: README_LINES,
  name: montage.title,
  description: htmlToPlainMarkdown(montage.details ?? ""),
  rules: RULES,
  settings: buildSettings(montage),
  challenges: montage.challenges.map(buildChallenge),
})

export const generateMontageModuleJson = (montage: Montage): string =>
  JSON.stringify(buildMontageModuleDocument(montage), null, 2)
