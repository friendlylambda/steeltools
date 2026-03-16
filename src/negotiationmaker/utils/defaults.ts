import { nanoid } from "nanoid"
import type { Trait, OutcomeRow } from "../types/negotiation"
import { DEFAULT_OUTCOMES } from "../constants/negotiation"

export const createDefaultTrait = (name: string = "", description: string = ""): Trait => ({
  id: nanoid(8),
  name,
  description,
})

export const createDefaultOutcomes = (): readonly OutcomeRow[] =>
  DEFAULT_OUTCOMES.map((row) => ({ ...row }))
