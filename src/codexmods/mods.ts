import type { CodexMod } from "./types"
import startBreak from "./images/break-time/1.png"
import countdown from "./images/break-time/2.png"
import directorView from "./images/break-time/3.png"
import timersList from "./images/countdown-timers/1.png"
import timerEdit from "./images/countdown-timers/2.png"
import timerRunning from "./images/countdown-timers/3.png"
import safetyCards1 from "./images/safety-cards/1.png"
import safetyCards2 from "./images/safety-cards/2.png"
import safetyCards3 from "./images/safety-cards/3.png"

/**
 * Add your Codex Mods here. Each entry automatically gets its own
 * page at /codex-mods/<slug> and an entry on the home page nav.
 * The slug is derived from the name (lowercased, spaces → hyphens).
 */
export const codexMods: readonly CodexMod[] = [
  {
    name: "Break Time",
    description:
      "Allows the Director to initiate a break in the session. During the break, a countdown clock shows the remaining break time, and a button for each player lets them toggle back/away so the Director can see when everyone's back and ready to continue the adventure.",
    images: [startBreak, countdown, directorView],
  },
  {
    name: "Countdown Timers",
    description:
      "This module allows you to create simple countdown timers that you can then trigger/clear with a click.",
    images: [timersList, timerEdit, timerRunning],
  },
  {
    name: "Safety Cards",
    description:
      "Allows players to play red/yellow/green safety cards to flag sensitive content. This can be used for a pure X Card style system as well as a Traffic Light style safety system. Includes settings each player can control to set their card to anonymous (off by default) and to be shown to all players instead of just the Director (off by default).",
    images: [safetyCards1, safetyCards2, safetyCards3],
  },
]

export const modSlug = (mod: CodexMod): string =>
  mod.name.toLowerCase().replace(/\s+/g, "-")
