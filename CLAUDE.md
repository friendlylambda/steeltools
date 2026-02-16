# Steel Tools

A collection of tools for the Draw Steel TTRPG. Each tool lives in its own directory under `src/` and is kept isolated with its own store, types, and components.

## Tech Stack

- **Build**: Vite + React + TypeScript
- **UI Components**: `@base-ui/react` (headless components)
- **Styling**: Emotion.js with `css` prop
- **State**: Zustand with persist middleware (localStorage) — one store per tool
- **Animation**: Motion (framer-motion) for layout animations
- **Utilities**: react-use for hooks like `useDebounce`

## Code Style

- Strict functional programming: `const` only (no `let`), pure functions, immutable data
- Styling: Emotion `css` prop with theme constants from `src/theme.ts`
- Components: Function components with explicit return types
- Prefer editing existing files over creating new ones
- Never use single-letter variable names (use descriptive names like `challenge` not `c`)

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

## Testing & Verification

- Dev server runs perpetually (user manages it). Use Chrome DevTools MCP for browser-based verification.
- Run `yarn typecheck` for type checking.
