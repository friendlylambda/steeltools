export type HeroCount = "three" | "four" | "five" | "six"
export type Difficulty = "easy" | "medium" | "hard"
export type Characteristic = "Might" | "Agility" | "Reason" | "Intuition" | "Presence"
export type OutcomesMode = "default" | "minimal" | "custom"

export interface DifficultyCell {
  readonly success: number
  readonly failure: number
}

export type DifficultyTable = Readonly<
  Record<HeroCount, Readonly<Record<Difficulty, DifficultyCell>>>
>

// What each tier of a challenge's roll button says. The critical (natural 19 or
// 20) is optional: an empty string leaves it out of the roll.
export interface TierResults {
  readonly tier1: string
  readonly tier2: string
  readonly tier3: string
  readonly critical: string
}

export interface Challenge {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly suggestedCharacteristics: readonly Characteristic[]
  readonly suggestedSkills: readonly string[]
  readonly difficulty: Difficulty
  readonly extraDetails: string | null
  readonly consequences: string | null
  readonly timesCompletable: number
  readonly hidden: boolean
  // null uses the Codex's stock results for the challenge's difficulty
  readonly tierResults: TierResults | null
}

export interface Montage {
  readonly id: string
  readonly title: string
  readonly details: string
  readonly difficultyTable: DifficultyTable
  readonly challenges: readonly Challenge[]
  readonly includePlayerTracker: boolean
  readonly includeDetailedOutcomes: boolean // Deprecated: kept for migration compatibility
  readonly includeRollButtons: boolean
  readonly outcomesMode: OutcomesMode
  readonly customOutcomesHtml: string
  readonly difficulty: Difficulty | null
  readonly heroCount: HeroCount | null
  readonly createdAt: number
  readonly updatedAt: number
}
