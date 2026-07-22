# Steel Tools

A collection of tools for the Draw Steel TTRPG. Each tool lives in its own directory under `src/` and is kept isolated with its own store, types, and components.

## Tech Stack

- **Build**: Vite + React + TypeScript
- **UI Components**: `@base-ui/react` (headless components)
- **Styling**: Emotion.js with `css` prop
- **State**: Zustand with persist middleware (localStorage) — one store per tool
- **Animation**: Motion (framer-motion) for layout animations
- **Utilities**: react-use for hooks like `useDebounce`

## Dependency Notes

Build scripts are disabled by default (Yarn 4.14+ `enableScripts: false`); packages that need them are allowlisted via `dependenciesMeta.<name>.built: true` in package.json (JSON can't hold comments, hence this note).

- **unix-dgram is deliberately NOT allowlisted.** It's a native (node-gyp) module for sending datagrams over unix domain sockets, pulled in as an _optional_ dependency of `hot-shots` — the StatsD metrics client inside `netlify-cli` → `@netlify/build`, used only for Netlify's own internal build telemetry. `hot-shots` degrades gracefully without it and nothing in this project sends StatsD metrics, so skipping its compile is intentional. The `YN0004` warning for it during `yarn install` is expected and harmless — do not "fix" it by allowlisting.

## Code Style

- Strict functional programming: `const` only (no `let`), pure functions, immutable data
- Styling: Emotion `css` prop with theme constants from `src/theme.ts`
- Components: Function components with explicit return types
- Prefer editing existing files over creating new ones
- Never use single-letter variable names (use descriptive names like `challenge` not `c`)
- Use whole words in all names — `utilities` not `utils`, no abbreviations
- Always brace `if` statements and write full if/else blocks — never single-line `if (condition) return` guards
- Affirm the success case in conditionals (`if (response.ok) { ... } else { ... }`) rather than guarding on the error case with an early return

## Architecture

- **Tool Isolation**: Each tool gets its own directory with its own store, types, and components. Tools should not import from each other. Shared code (theme, common UI primitives) lives at the `src/` root level.
- **Store Pattern**: Each tool has its own Zustand store with persist middleware. Components receive values as props and call onChange handlers (controlled component pattern).
- **Debouncing**: For frequently-updated text inputs, use local state for immediate UI response, then `useDebounce` to propagate changes to the store.
- **Layout Animations**: Use `motion.div` with `layout` prop for smooth reorder animations.

## Base UI Gotchas

- **Combobox must be fully controlled**: Always provide `open`, `onOpenChange`, `value`, `onValueChange`, `inputValue`, and `onInputValueChange`. Partial control causes scroll locking bugs where `overflow: hidden` gets stuck on body.
- **Dialog modal prop**: Controls scroll locking. Default is `modal={true}` which locks scroll.
- **Portals**: Combobox and Dialog use portals. When styling dropdowns, anchor to a ref'd container for proper width.

## Tools

### Montage Maker

Generates montage test configurations. Outputs specialized markdown with query blocks, difficulty tables, and challenge definitions for the Draw Steel VTT system.

Montages consist of:

- A difficulty table (success/failure limits by hero count and difficulty level)
- A list of challenges (name, description, suggested characteristics, suggested skills, default difficulty)

### Negotiation Maker

Generates negotiation documents for Draw Steel NPC negotiations. Outputs Codex VTT markdown with NPC stats, motivations/pitfalls (as revealable GM-only blocks), outcomes tables, and optional rules reference tables.

Negotiations consist of:

- NPC stats (impression, native language, starting interest/patience)
- Motivations (from 12 standard presets or custom, each in a separate hidden block)
- Pitfalls (same structure as motivations)
- Outcomes table (6 fixed rows: Interest 5 "Yes, and..." through Interest 0 "No, and...")

## Shared Components

Generic UI components live in `src/components/` and are imported by multiple tools:

- `TitleInput` — debounced text input with configurable label/placeholder
- `Stepper` — +/- number input with optional min/max
- `RichTextEditor` — Tiptap WYSIWYG with hidden blocks, bold/italic/lists, optional victory buttons
- `ExportActions` — copy-to-clipboard and download-as-file with configurable labels

## Testing & Verification

- Dev server runs perpetually (user manages it). Use Chrome DevTools MCP for browser-based verification.
- Run `yarn typecheck` for type checking.
- Always run prettier on the codebase after a batch of changes is complete.
