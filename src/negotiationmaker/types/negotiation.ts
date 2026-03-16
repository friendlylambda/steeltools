export type MotivationName =
  | "Benevolence"
  | "Discovery"
  | "Freedom"
  | "Greed"
  | "Higher Authority"
  | "Justice"
  | "Legacy"
  | "Peace"
  | "Power"
  | "Protection"
  | "Revelry"
  | "Vengeance"

export interface Trait {
  readonly id: string
  readonly name: string
  readonly description: string
}

export interface OutcomeRow {
  readonly interestLevel: number
  readonly label: string
  readonly details: string
}

export interface Negotiation {
  readonly id: string
  readonly title: string
  readonly impression: number
  readonly nativeLanguage: string
  readonly startingInterest: number
  readonly startingPatience: number
  readonly motivations: readonly Trait[]
  readonly pitfalls: readonly Trait[]
  readonly outcomes: readonly OutcomeRow[]
  readonly sceneDetails: string
  readonly includeRulesReference: boolean
  readonly createdAt: number
  readonly updatedAt: number
}
