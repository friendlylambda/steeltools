import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Montage } from "../types/montage"
import { createDefaultDifficultyTable } from "../utilities/defaults"

// Rewrites every challenge in every persisted montage, for migrations that add
// or normalize a challenge field. Each migration names the old fields it reads.
const migrateChallenges = <PersistedChallenge extends object>(
  montages: Record<string, unknown>,
  migrateChallenge: (challenge: PersistedChallenge) => object,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(montages).map(([id, montage]) => {
      const typedMontage = montage as { challenges?: PersistedChallenge[] }
      return [
        id,
        { ...typedMontage, challenges: (typedMontage.challenges ?? []).map(migrateChallenge) },
      ]
    }),
  )

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
        | "difficulty"
        | "heroCount"
      >
    >,
  ) => void
  readonly deleteMontage: (id: string) => void
  readonly duplicateMontage: (id: string) => string | null
  readonly importMontage: (montage: Montage) => string
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
          difficulty: "medium",
          heroCount: "four",
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

      duplicateMontage: (id) => {
        const existing = get().montages[id]
        if (!existing) return null
        const newId = nanoid(8)
        const now = Date.now()
        const cloned = structuredClone(existing)
        const copy: Montage = {
          ...cloned,
          id: newId,
          title: `${cloned.title || "Untitled"} (Copy)`,
          challenges: cloned.challenges.map((challenge) => ({
            ...challenge,
            id: nanoid(8),
          })),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          montages: { ...state.montages, [newId]: copy },
        }))
        return newId
      },

      importMontage: (montage) => {
        const newId = nanoid(8)
        const now = Date.now()
        const imported: Montage = {
          ...montage,
          id: newId,
          challenges: montage.challenges.map((challenge) => ({
            ...challenge,
            id: nanoid(8),
          })),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          montages: { ...state.montages, [newId]: imported },
        }))
        return newId
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
      version: 6,
      migrate: (persistedState, version) => {
        let state = persistedState as { montages: Record<string, unknown> }

        if (version === 0) {
          // Normalize challenges: add timesCompletable if missing
          state = {
            ...state,
            montages: migrateChallenges(
              state.montages,
              (challenge: { timesCompletable?: number }) => ({
                ...challenge,
                timesCompletable: challenge.timesCompletable ?? 1,
              }),
            ),
          }
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

        if (version < 3) {
          // Add hidden field to challenges
          state = {
            ...state,
            montages: migrateChallenges(state.montages, (challenge: { hidden?: boolean }) => ({
              ...challenge,
              hidden: challenge.hidden ?? false,
            })),
          }
        }

        if (version < 4) {
          // Add difficulty and heroCount fields
          const migratedMontages = Object.fromEntries(
            Object.entries(state.montages).map(([id, montage]) => [
              id,
              {
                ...(montage as Record<string, unknown>),
                difficulty: null,
                heroCount: null,
              },
            ]),
          )
          state = { ...state, montages: migratedMontages }
        }

        if (version < 5) {
          state = {
            ...state,
            montages: migrateChallenges(
              state.montages,
              (challenge: { consequences?: string | null }) => ({
                ...challenge,
                consequences: challenge.consequences ?? null,
              }),
            ),
          }
        }

        if (version < 6) {
          // Add custom tier results to challenges
          state = {
            ...state,
            montages: migrateChallenges(state.montages, (challenge: { tierResults?: unknown }) => ({
              ...challenge,
              tierResults: challenge.tierResults ?? null,
            })),
          }
        }

        return state
      },
    },
  ),
)
