import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Montage } from "../types/montage"
import { createDefaultDifficultyTable } from "../utils/defaults"

interface MontageStore {
  readonly montages: Readonly<Record<string, Montage>>
  readonly currentId: string | null
  readonly currentMontage: () => Montage | undefined
  readonly createMontage: () => string
  readonly updateMontage: (
    id: string,
    updates: Partial<
      Pick<
        Montage,
        | "title"
        | "details"
        | "difficultyTable"
        | "challenges"
        | "includePlayerTracker"
        | "includeDetailedOutcomes"
        | "includeRollButtons"
        | "outcomesMode"
        | "customOutcomesHtml"
      >
    >,
  ) => void
  readonly deleteMontage: (id: string) => void
  readonly setCurrentId: (id: string | null) => void
}

export const useMontageStore = create<MontageStore>()(
  persist(
    (set, get) => ({
      montages: {},
      currentId: null,

      currentMontage: () => {
        const { montages, currentId } = get()
        return currentId ? montages[currentId] : undefined
      },

      createMontage: () => {
        const id = nanoid(8)
        const now = Date.now()
        const newMontage: Montage = {
          id,
          title: "",
          details:
            "<h2>The Scene</h2><ul><li>Add your description of the scene here</li><li>You can use bullets, bold/italic text, and additional headers if you like</li></ul>",
          difficultyTable: createDefaultDifficultyTable(),
          challenges: [],
          includePlayerTracker: true,
          includeDetailedOutcomes: false,
          includeRollButtons: false,
          outcomesMode: "minimal",
          customOutcomesHtml: "",
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          montages: { ...state.montages, [id]: newMontage },
        }))
        return id
      },

      updateMontage: (id, updates) => {
        set((state) => {
          const existing = state.montages[id]
          if (!existing) return state
          return {
            montages: {
              ...state.montages,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          }
        })
      },

      deleteMontage: (id) => {
        set((state) => {
          const { [id]: _, ...remaining } = state.montages
          return {
            montages: remaining,
            currentId: state.currentId === id ? null : state.currentId,
          }
        })
      },

      setCurrentId: (id) => {
        set({ currentId: id })
      },
    }),
    {
      name: "montagemaker-store",
      version: 2,
      migrate: (persistedState, version) => {
        let state = persistedState as { montages: Record<string, unknown> }

        if (version === 0) {
          // Normalize challenges: add timesCompletable if missing
          const normalizedMontages = Object.fromEntries(
            Object.entries(state.montages).map(([id, montage]) => {
              const typedMontage = montage as {
                challenges?: Array<{ timesCompletable?: number }>
              }
              return [
                id,
                {
                  ...typedMontage,
                  challenges: (typedMontage.challenges ?? []).map((challenge) => ({
                    ...challenge,
                    timesCompletable: challenge.timesCompletable ?? 1,
                  })),
                },
              ]
            }),
          )
          state = { ...state, montages: normalizedMontages }
        }

        if (version < 2) {
          // Migrate from includeDetailedOutcomes boolean to outcomesMode
          const migratedMontages = Object.fromEntries(
            Object.entries(state.montages).map(([id, montage]) => {
              const typedMontage = montage as { includeDetailedOutcomes?: boolean }
              return [
                id,
                {
                  ...typedMontage,
                  outcomesMode: typedMontage.includeDetailedOutcomes ? "default" : "minimal",
                  customOutcomesHtml: "",
                },
              ]
            }),
          )
          state = { ...state, montages: migratedMontages }
        }

        return state
      },
    },
  ),
)
