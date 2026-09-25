# portfolio-os

React + Vite + Tailwind CSS project: interactive portfolio styled as an operating
system with macOS and Windows 11 themes.

## Development Server

Start the dev server with `npm run dev` (defaults to `http://localhost:8443`).
Changes to source files hot-reload immediately.

## Project Structure

Canonical structure. Start with task-relevant files below; only follow imports
when required, when a documented path is missing, or when the repository
contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` - Root component: theme state, desktop layout, and dock/taskbar switch
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `src/types.ts` - Shared types (`Theme`, `WinId`, `WinState`, `ChatMsg`, `Project`)
- `src/data/index.ts` - Centralized content/config: dock & desktop icons, window
  config, chat answers, quick questions, start menu items
- `src/lib/supabase.ts` - Supabase client factory + `isSupabaseConfigured()`
- `src/hooks/` - Reusable logic: `useWindowManager` (window open/close/focus/move/maximize),
  `useProjects` (fetch projects from Supabase), `useDrag` (pointer-based drag),
  `useClock` (live clock)
- `src/components/` - UI grouped by scope:
  - `desktop/` - desktop elements shared by both themes (`DesktopHero`, `DesktopIcons`, `StickyNote`)
  - `shell/` - windowing chrome shared by both themes (`WindowShell`)
  - `apps/` - window content panes (`FileExplorerContent`, `AboutContent`, `ChatContent`,
    `MusicContent`) and `index.ts` with the `WIN_CONTENT` registry
  - `macos/` - macOS-specific UI (`MacDock`)
  - `win11/` - Windows 11-specific UI (`Win11Taskbar`)
- `supabase/schema.sql` - SQL schema and seed for the `projects` table
- `index.html` - Vite HTML shell containing `#root` and loading `src/main.tsx`
- `package.json` - Scripts and dependencies
- `vite.config.ts` - Vite config (React, Tailwind v4, `@` alias to `src`, dev port)
- `.mise.toml` - Toolchain version for Node.js

## Dependencies

- Runtime: React 19 and React DOM 19
- Data: `@supabase/supabase-js` (optional, only when `VITE_SUPABASE_*` env vars are set)
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Icons: Font Awesome 6 via CDN in `index.html`
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview the production build
- `npm run typecheck` - run TypeScript without emitting
- `npm run format` - format source with oxfmt

## Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin configured in `vite.config.ts`.
`src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind
utility classes directly in JSX and put global CSS or Tailwind v4 theme
customization in `src/index.css`. No Tailwind config or PostCSS config needed.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in
`src/index.css`. Keep CSS `@import` statements first, then add any `@font-face`
rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`),
  or escape them in single-quoted strings. An unescaped apostrophe in a
  single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
- Run `npm run typecheck` before finishing changes.