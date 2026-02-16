import { nanoid } from "nanoid"
import type { DifficultyTable, Challenge } from "../types/montage"

export const createDefaultChallenge = (): Challenge => ({
  id: nanoid(8),
  name: "",
  description: "",
  suggestedCharacteristics: [],
  suggestedSkills: [],
  difficulty: "medium",
  extraDetails: null,
  timesCompletable: 1,
})

export const createDefaultDifficultyTable = (): DifficultyTable => ({
  three: {
    easy: { success: 3, failure: 3 },
    medium: { success: 4, failure: 2 },
    hard: { success: 5, failure: 2 },
  },
  four: {
    easy: { success: 4, failure: 4 },
    medium: { success: 5, failure: 3 },
    hard: { success: 6, failure: 2 },
  },
  five: {
    easy: { success: 5, failure: 5 },
    medium: { success: 6, failure: 4 },
    hard: { success: 7, failure: 3 },
  },
  six: {
    easy: { success: 6, failure: 6 },
    medium: { success: 7, failure: 5 },
    hard: { success: 8, failure: 4 },
  },
})
