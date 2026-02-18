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

export interface Challenge {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly suggestedCharacteristics: readonly Characteristic[]
  readonly suggestedSkills: readonly string[]
  readonly difficulty: Difficulty
  readonly extraDetails: string | null
  readonly timesCompletable: number
  readonly hidden: boolean
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
  readonly createdAt: number
  readonly updatedAt: number
}
