import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Negotiation } from "../types/negotiation"
import { createDefaultOutcomes } from "../utils/defaults"

interface NegotiationStore {
  readonly negotiations: Readonly<Record<string, Negotiation>>
  readonly currentId: string | null
  readonly currentNegotiation: () => Negotiation | undefined
  readonly createNegotiation: () => string
  readonly updateNegotiation: (
    id: string,
    updates: Partial<
      Pick<
        Negotiation,
        | "title"
        | "impression"
        | "nativeLanguage"
        | "startingInterest"
        | "startingPatience"
        | "motivations"
        | "pitfalls"
        | "outcomes"
        | "sceneDetails"
        | "includeRulesReference"
      >
    >,
  ) => void
  readonly deleteNegotiation: (id: string) => void
  readonly setCurrentId: (id: string | null) => void
}

export const useNegotiationStore = create<NegotiationStore>()(
  persist(
    (set, get) => ({
      negotiations: {},
      currentId: null,

      currentNegotiation: () => {
        const { negotiations, currentId } = get()
        return currentId ? negotiations[currentId] : undefined
      },

      createNegotiation: () => {
        const id = nanoid(8)
        const now = Date.now()
        const newNegotiation: Negotiation = {
          id,
          title: "",
          impression: 3,
          nativeLanguage: "",
          startingInterest: 2,
          startingPatience: 3,
          motivations: [],
          pitfalls: [],
          outcomes: createDefaultOutcomes(),
          sceneDetails: "",
          includeRulesReference: true,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          negotiations: { ...state.negotiations, [id]: newNegotiation },
        }))
        return id
      },

      updateNegotiation: (id, updates) => {
        set((state) => {
          const existing = state.negotiations[id]
          if (!existing) return state
          return {
            negotiations: {
              ...state.negotiations,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          }
        })
      },

      deleteNegotiation: (id) => {
        set((state) => {
          const { [id]: _, ...remaining } = state.negotiations
          return {
            negotiations: remaining,
            currentId: state.currentId === id ? null : state.currentId,
          }
        })
      },

      setCurrentId: (id) => {
        set({ currentId: id })
      },
    }),
    {
      name: "negotiationmaker-store",
      version: 1,
    },
  ),
)
