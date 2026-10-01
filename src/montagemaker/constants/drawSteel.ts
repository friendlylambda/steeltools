import type { Characteristic, Difficulty, HeroCount, TierResults } from "../types/montage"

export const CHARACTERISTICS = [
  "Might",
  "Agility",
  "Intuition",
  "Reason",
  "Presence",
] as const satisfies readonly Characteristic[]

export const HERO_COUNTS = ["three", "four", "five", "six"] as const satisfies readonly HeroCount[]

export const DIFFICULTIES = ["easy", "medium", "hard"] as const satisfies readonly Difficulty[]

// Verbatim from the Codex's hardwired power tables (g_hardwiredPowerTableList in
// DocumentSystem/MarkdownDocument.lua), which a roll button gets when it names a
// difficulty instead of spelling out its tiers.
export const DEFAULT_TIER_RESULTS: Readonly<Record<Difficulty, TierResults>> = {
  easy: {
    tier1: "You succeed on the task and incur a consequence.",
    tier2: "You succeed on the task.",
    tier3: "You succeed on the task with a reward.",
    critical: "",
  },
  medium: {
    tier1: "You fail the task.",
    tier2: "You succeed on the task and incur a consequence.",
    tier3: "You succeed on the task.",
    critical: "",
  },
  hard: {
    tier1: "You fail the task and incur a consequence.",
    tier2: "You fail the task.",
    tier3: "You succeed on the task.",
    critical: "",
  },
}

export const SKILL_CATEGORIES = {
  Crafting: [
    "Alchemy",
    "Architecture",
    "Blacksmithing",
    "Carpentry",
    "Cooking",
    "Fletching",
    "Forgery",
    "Jewelry",
    "Mechanics",
    "Tailoring",
  ],
  Exploration: [
    "Climb",
    "Drive",
    "Endurance",
    "Gymnastics",
    "Heal",
    "Jump",
    "Lift",
    "Navigate",
    "Ride",
    "Swim",
  ],
  Interpersonal: [
    "Brag",
    "Empathize",
    "Flirt",
    "Gamble",
    "Handle Animals",
    "Interrogate",
    "Intimidate",
    "Lead",
    "Lie",
    "Music",
    "Perform",
    "Persuade",
    "Read Person",
  ],
  Intrigue: [
    "Alertness",
    "Conceal Object",
    "Disguise",
    "Eavesdrop",
    "Escape Artist",
    "Hide",
    "Pick Lock",
    "Pick Pocket",
    "Sabotage",
    "Search",
    "Sneak",
    "Track",
  ],
  Lore: [
    "Criminal Underworld",
    "Culture",
    "History",
    "Magic",
    "Monsters",
    "Nature",
    "Psionics",
    "Religion",
    "Rumors",
    "Society",
    "Strategy",
    "Timescape",
  ],
} as const

export type SkillCategory = keyof typeof SKILL_CATEGORIES

// Flattened array of all skills for easy reference when you just need to list them all
export const SKILLS: readonly string[] = Object.values(SKILL_CATEGORIES).flat()

const skillToCategoryMap: ReadonlyMap<string, SkillCategory> = new Map(
  (Object.entries(SKILL_CATEGORIES) as [SkillCategory, readonly string[]][]).flatMap(
    ([category, skills]) => skills.map((skill) => [skill, category] as const),
  ),
)

export const getSkillCategory = (skill: string): SkillCategory | undefined =>
  skillToCategoryMap.get(skill)
