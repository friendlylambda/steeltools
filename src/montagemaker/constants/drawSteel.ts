import type { Characteristic } from "../types/montage"

export const CHARACTERISTICS: readonly Characteristic[] = [
  "Might",
  "Agility",
  "Intuition",
  "Reason",
  "Presence",
]

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
