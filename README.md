# IMD Launchpad: idea in, ecosystem out

A one-page website for IMD Launchpad, the AI-powered Solana creation and launch platform built around IMD Swarm. Visitors describe an idea and get a project plan in the browser: Swarm deliverables to approve or send back, token settings with the 1% developer allocation, X and Telegram drafts, and the launch steps. The page also covers launching, trading (with a watchlist that links to DexScreener, Raydium and Solscan), the Swarm workforce, IMD NFT workers, the proposed revenue split with a calculator, buyback and burn, the Social Hub, community takeover, security and the two-chain model.

It is a static site: plans and the watchlist are saved in the visitor's browser (`localStorage`), and nothing is launched, signed or published from it.

Stack: Vite 5, React 18, TypeScript 5. No runtime dependencies beyond React.

## Install

```sh
npm ci          # or: npm install
```

Requires Node 18 or newer (built with Node 24).

## Preview

```sh
npm run dev       # development server with hot reload
npm run build     # typecheck + production build into dist/
npm run preview   # serve the built dist/ locally
```

The committed `dist/` is the deliverable and works from any static host or subpath (Vite `base: "./"`, all asset URLs relative, one page with `#` anchors). Serve it over HTTP: opening `dist/index.html` from disk (`file://`) won't run the module script.

## Rebuild

```sh
npm run typecheck   # tsc --noEmit
npm run build       # tsc --noEmit && vite build, writes dist/
```

Commit `dist/` together with the source after every change. Do not commit `node_modules/`.

## Layout

```
index.html              title, description, favicon, og:title, og:image
public/                 favicon.svg, og.png (1200x630 share image)
src/main.tsx            entry
src/App.tsx             page sections
src/components/         Header, Composer, Studio, Watchlist, Revenue
src/lib/                plan generation and validation, revenue split, Solana mint helpers
src/styles.css          design tokens and all styles
DESIGN.md               design system documentation
artifacts/validation.md full validation record
```

## Validation results (final build)

- `npm run build` and `npm run typecheck`: passed.
- Interaction tests (Playwright, Chromium, against `dist/` served under a subpath): 35/35 passed. They cover the composer in Easy and Pro modes with validation, the studio (approve, request changes, tabs with the keyboard, copy, download, persistence, clear), the watchlist, the revenue calculator, the mobile menu, the skip link, no horizontal scroll at 320, 390 and 1440, no console errors and no missing files.
- Design probe (`node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste`): 16/16 checks passed.
- Better Interface review of all six domains: 10 findings fixed (1 high, 3 medium, 6 low); none open.
- Not performed: WebKit/Safari, physical devices, screen reader, native 200% zoom, forced colors, RTL. Details in `artifacts/validation.md`.
