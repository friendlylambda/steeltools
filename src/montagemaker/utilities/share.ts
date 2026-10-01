import { z } from "zod"
import { nanoid } from "nanoid"
import type { Challenge, DifficultyCell, HeroCount, Montage } from "../types/montage"
import { createDefaultChallenge, createDefaultDifficultyTable } from "./defaults"
import { CHARACTERISTICS, DIFFICULTIES, HERO_COUNTS } from "../constants/drawSteel"
import { OUTCOMES_MODES } from "../constants/outcomes"

// Bump when the payload shape changes in a way the schema's fallbacks can't absorb.
export const SHARE_VERSION = 1
const SHARE_ENDPOINT = "/api/montage/share"
const SHARE_PARAM = "share"

// Share payloads are untrusted. The schemas are deliberately lenient: only
// title + challenges are required (their absence rejects the payload);
// every other field falls back to its default via .catch(), so links keep
// working across schema changes. Arrays filter invalid elements instead of
// failing wholesale.
const filteredArray = <ElementOutput>(
  elementSchema: z.ZodType<ElementOutput>,
): z.ZodType<ElementOutput[]> =>
  z
    .array(z.unknown())
    .catch([])
    .transform((items) =>
      items.flatMap((item) => {
        const parsed = elementSchema.safeParse(item)
        return parsed.success ? [parsed.data] : []
      }),
    )

const challengeFallback = createDefaultChallenge()

const challengeSchema: z.ZodType<Challenge> = z
  .object({
    name: z.string().catch(challengeFallback.name),
    description: z.string().catch(challengeFallback.description),
    suggestedCharacteristics: filteredArray(z.enum(CHARACTERISTICS)),
    suggestedSkills: filteredArray(z.string()),
    difficulty: z.enum(DIFFICULTIES).catch(challengeFallback.difficulty),
    extraDetails: z.string().nullable().catch(null),
    consequences: z.string().nullable().catch(null),
    timesCompletable: z
      .number()
      .transform((value) => Math.max(1, Math.round(value)))
      .catch(challengeFallback.timesCompletable),
    hidden: z.boolean().catch(challengeFallback.hidden),
    tierResults: z
      .object({
        tier1: z.string(),
        tier2: z.string(),
        tier3: z.string(),
        critical: z.string().catch(""),
      })
      .nullable()
      .catch(null),
  })
  .transform((challenge) => ({ ...challenge, id: nanoid(8) }))

const defaultTable = createDefaultDifficultyTable()

const cellSchema = (fallback: DifficultyCell): z.ZodType<DifficultyCell> =>
  z
    .object({
      success: z.number().catch(fallback.success),
      failure: z.number().catch(fallback.failure),
    })
    .catch(fallback)

const rowSchema = (heroCount: HeroCount) =>
  z
    .object({
      easy: cellSchema(defaultTable[heroCount].easy),
      medium: cellSchema(defaultTable[heroCount].medium),
      hard: cellSchema(defaultTable[heroCount].hard),
    })
    .catch(defaultTable[heroCount])

const difficultyTableSchema = z
  .object({
    three: rowSchema("three"),
    four: rowSchema("four"),
    five: rowSchema("five"),
    six: rowSchema("six"),
  })
  .catch(defaultTable)

const sharedMontageSchema: z.ZodType<Montage> = z
  .object({
    title: z.string(),
    details: z.string().catch(""),
    difficultyTable: difficultyTableSchema,
    challenges: filteredArray(challengeSchema),
    includePlayerTracker: z.boolean().catch(true),
    includeRollButtons: z.boolean().catch(false),
    outcomesMode: z.enum(OUTCOMES_MODES).catch("minimal"),
    customOutcomesHtml: z.string().catch(""),
    difficulty: z.enum(DIFFICULTIES).nullable().catch(null),
    heroCount: z.enum(HERO_COUNTS).nullable().catch(null),
  })
  .transform((montage) => {
    const now = Date.now()
    return {
      ...montage,
      id: nanoid(8),
      includeDetailedOutcomes: false,
      createdAt: now,
      updatedAt: now,
    }
  })

export const sharePayloadSchema = z.object({
  steeltools: z.literal("montage"),
  version: z.number().max(SHARE_VERSION),
  montage: sharedMontageSchema,
})

const shareCreatedSchema = z.object({ id: z.string() })

// Stores the montage by storing it and generating a publicly accessible share shortlink.
// Throws on network or server failure.
export const createMontageShareLink = async (montage: Montage): Promise<string> => {
  const response = await fetch(SHARE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ steeltools: "montage", version: SHARE_VERSION, montage }),
  })
  if (response.ok) {
    const { id } = shareCreatedSchema.parse(await response.json())
    return `${window.location.origin}/montagemaker?${SHARE_PARAM}=${id}`
  } else {
    throw new Error(`Share upload failed with status ${response.status}`)
  }
}

export const fetchSharedMontage = async (shareId: string): Promise<Montage | null> => {
  try {
    const response = await fetch(`${SHARE_ENDPOINT}?id=${encodeURIComponent(shareId)}`)
    if (response.ok) {
      const parsed = sharePayloadSchema.safeParse(await response.json())
      return parsed.success ? parsed.data.montage : null
    } else {
      return null
    }
  } catch {
    return null
  }
}

export const readShareIdFromLocation = (): string | null =>
  new URLSearchParams(window.location.search).get(SHARE_PARAM)

export const clearShareFromLocation = (): void => {
  const url = new URL(window.location.href)
  if (url.searchParams.has(SHARE_PARAM)) {
    url.searchParams.delete(SHARE_PARAM)
    history.replaceState(null, "", url)
  }
}
