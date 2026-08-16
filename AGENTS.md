# AGENTS.md

Discogs collection browser + Last.fm now-playing kiosk: Vite + React 19 + TypeScript SPA, Tailwind CSS 4, shadcn/ui, TanStack Query. Single package, no monorepo, no tests, no CI. Runs as a LAN-served kiosk display (e.g. HP Stream 7 browser pointed at the serving machine).

## Commands

- `bun dev` / `bun build` / `bun preview` — dev server / production build / preview
- `bun start` — serves the production build on the LAN (this is the kiosk serving mode; kiosk device opens `http://<server-lan-ip>:4173`)
- `bun lint` — Biome check (lint + format + import order); `bun lint:fix` — auto-fix
- There is **no typecheck script and no test script**. Typechecking only happens via `bun build` (`tsc -b && vite build`). Run `bun lint:fix && bun build` to verify changes.
- Package manager: Bun (`bun.lock`).

## Conventions

- **Biome is the only linter/formatter** (no ESLint/Prettier). Tabs, double quotes, organize-imports on save. Run `bun lint:fix` after editing rather than formatting by hand.
- Path alias `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`; keep them in sync if changed).
- shadcn/ui ("new-york" style, lucide icons, config in `components.json`): add components with `bunx shadcn add <name>` into `src/components/ui/`; don't hand-create files there.
- Tailwind 4 via `@tailwindcss/vite` plugin — there is no `tailwind.config.*`; theme/config lives in `src/index.css` using CSS-first syntax.
- Strict TS (`strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`): no enums or other non-erasable syntax; use `import type` (verbatimModuleSyntax).

## Architecture notes

- Entry: `src/main.tsx` → `src/App.tsx`. `App` is a view shell: **NowPlaying (home, Last.fm kiosk display)** or **CollectionBrowser** (the original Discogs UI, extracted to `src/components/CollectionBrowser.tsx`), switched via a floating button. Data flows through React Query hooks in `src/api/queries/`.
- **Config/secrets model**: all `VITE_*` env vars are read in `src/config.ts` (only this file touches `import.meta.env`). Real values live in `.env.local` (gitignored — never commit); `.env.example` documents the keys. The app is served LAN-only (`bun start`), so keys baked into the bundle never leave the local network — **never publish `dist/` or a prebuilt image anywhere public**. If runtime (boot-time) config is ever needed for self-hosting, `src/config.ts` is the seam.
- **All Last.fm API calls must go through `src/api/lastfm/`** (`client.ts` axios instance + `index.ts` normalized methods). Currently read-only (`user.getrecenttracks`, no auth needed beyond the API key). A future vinyl-scrobbler feature needs signed write calls (API secret); signing will be implemented locally in this module — do not add the secret to env until that work starts.
- **All Discogs API calls must go through `src/api/discogsClient.ts`** (never raw axios/fetch): it implements a request queue that pauses when `x-discogs-ratelimit-remaining` drops to 2 (see thresholds in `src/api/constants.ts`). There is no retry logic — errors are just rejected.
- `getCollectionItemsByFolder` (`src/api/discogs.ts`) auto-paginates and returns all pages of a folder at once — expect slow loads for large collections.
- `ThemeProvider` (wrapping `next-themes`) lives in `src/components/ModeToggle.tsx`, not a separate provider file.
