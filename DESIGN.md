# IMD Launchpad design system

Extracted from the final source: `src/styles.css` (tokens and all component styles), `src/App.tsx` and `src/components/*.tsx`. There is no CSS framework, no CSS-in-JS and no component library; every value below comes from those files.

## Overview

IMD Launchpad is a one-page product site for people who want to turn an idea into a Solana project, from first-time creators to developers. The page leads with the product itself: the "Describe your idea" composer sits on the first screen at every width, and the project studio it produces follows directly below it. Information sections (launch, trade, Swarm, NFT workers, revenue, community, security, chains) follow in reading order.

The visual character is a dark, flat, quiet interface with one loud colour. Near-black surfaces, a single lime accent reserved for the primary action, links and focus, one system sans-serif family and generous spacing. Hierarchy comes from size and weight, not from decoration: no gradients, no shadows for depth, no badges or kicker labels.

System-wide rules: one primary (filled lime) action per view; everything interactive has a shape (border or fill); numbers that change use tabular figures; critical strings (mint addresses, tickers, amounts) wrap instead of truncating. The two-column hero and `split` layouts are page arrangements, not mandatory patterns.

## Colors

Defined in `src/styles.css:2-34` as hex primitives (named by hue) and semantic role tokens. Components only use the semantic tokens.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `--gray-950` `#0c0f14` | Page background, input fill, segmented-control track |
| `--color-surface` | `--gray-900` `#141922` | Cards (`.card`), worker tiles |
| `--color-surface-raised` | `--gray-850` `#1c2230` | Secondary buttons, selected segment, nav hover |
| `--color-border` | `--gray-700` `#2e3646` | Card and control borders, dividers, empty progress and bar tracks |
| `--color-text` | `--gray-50` `#eef1f6` | Headings, body text, button labels |
| `--color-text-secondary` | `--gray-400` `#a1abbc` | Supporting copy, hints, metadata, placeholders, revenue bars |
| `--color-accent` | `--lime-400` `#b8f25c` | Primary button fill, links and link-buttons, selected tab underline, text selection |
| `--color-accent-hover` | `--lime-300` `#cdf78a` | Primary button hover |
| `--color-on-accent` | `--gray-950` `#0c0f14` | Text on the accent fill |
| `--color-focus` | `--lime-400` `#b8f25c` | `:focus-visible` outline |
| `--color-error` | `--coral-300` `#ff9e92` | Field errors and invalid input borders |
| `--color-warning` | `--amber-300` `#f5c86b` | "Changes requested" status, fee total not equal to 100% |
| `--color-success` | `--teal-300` `#7fd9c0` | "Approved" status, studio progress bar |

The accent means "interactive or primary". Do not use it on static text. Status colours always come with a text label (and a symbol for task status).

Contrast was computed from these declared token pairs with the WCAG formula (see `artifacts/validation.md`): text on surface 15.56:1; secondary text on surface 7.61:1 and on surface-raised 6.86:1; on-accent on accent 14.53:1; error, warning and success on surface 8.86, 11.21 and 10.56:1. The taste@1 probe also measured all rendered text as passing 4.5:1.

There is one theme (dark, `color-scheme: dark`). There is no light theme; do not add `prefers-color-scheme` overrides piecemeal.

## Typography

- **Family:** `--font-sans`: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No web font is loaded, so the face is the platform's UI font. `--font-mono` (`ui-monospace, "SF Mono", …`) is used only for Solana mint addresses (`.mint`, `.mono-input`).
- **Weights:** 400 (body), 600 (labels, buttons, h3, data), 700 (h1, h2, brand, footer title). Three weights; do not add more.
- **Scale** (`src/styles.css:29-35`), six sizes per width:

| Token | Size | Role |
| --- | --- | --- |
| `--text-sm` | 14px | Labels, hints, errors, small buttons, tabs, table text, metadata |
| `--text-base` | 16px | Body, buttons, all inputs (keeps iOS from zooming) |
| `--text-lg` | 18px | h3, hero lede |
| `--text-xl` | 24px | h2 below 60rem, studio title, footer title |
| `--text-2xl` | 32px | h2 from 60rem |
| `--text-display` | 40px, 56px from 60rem | h1 only |

- **Line height:** h1 1.05, h2 1.2, h3 1.3, body 1.55, inputs 1.5.
- **Letter spacing:** h1 -0.035em, h2 -0.01em, everything else natural. No uppercase transforms anywhere.
- **Wrapping:** headings `text-wrap: balance`, paragraphs `text-wrap: pretty`; long values (`.mint`, `.facts dd`, studio title, drafts, revenue amounts) use `overflow-wrap: anywhere`. Social drafts cap at `65ch`. Section intros cap at `42rem`, the lede at `36rem`.
- **Numbers:** `.num` sets `font-variant-numeric: tabular-nums` on counters, supplies, percentages and amounts.

## Layout

- **Container:** `.wrap` (`src/styles.css:110`): `max-inline-size: 72rem`, centred, inline padding `--gutter` = 16px, 24px from 40rem, 32px from 60rem.
- **Spacing steps:** `--space-1` 4px, `-2` 8px, `-3` 12px, `-4` 16px, `-6` 24px, `-8` 32px, `-12` 48px, `-20` 80px. Inside a group use 4-12px; between groups 16-24px; between sections 48px (mobile) or 80px (from 60rem) via `.section`.
- **Breakpoints** (content-driven, in rem): 30rem (pro fields go to two columns), 40rem (card padding 24px, chain cards side by side, token facts become label/value rows), 48rem (task actions move into a right-hand column; watchlist form goes on one row), 60rem (header nav replaces the Menu button, hero and `.split` become two columns, display size steps up).
- **Grids:** `.hero-grid` (5fr / 6fr), `.split` (5fr / 7fr, intro then content), `.split-wide-first` (7fr / 5fr, used when the first child is the wide one), `.worker-grid` (`auto-fill, minmax(15rem, 1fr)`), `.grid-2`, `.grid-3` (`auto-fit, minmax(7rem, 1fr)`). Grid children get `min-inline-size: 0` so wide content cannot push the page sideways.
- **Mobile:** single column; the primary button fills its row; tabs and action rows wrap. Measured with no horizontal scroll at 320, 390 and 1440 wide (see validation).
- Logical properties (`inline-size`, `padding-inline`, `border-block-end`, `inset-inline-start`) are used throughout.

## Elevation & Depth

Deliberately flat. There are no box shadows on surfaces. Depth is tonal: `--color-bg` page, `--color-surface` cards, `--color-surface-raised` controls, each separated by a 1px `--color-border`. The only inset shadow is the 1px ring on the selected segment. Cards are never nested: inside a card, rows are separated by `border-block-end` dividers with no fill or radius (tasks, facts, watchlist items, table rows).

## Shapes

- `--radius-control` 8px: buttons, inputs, nav links.
- `--radius-card` 14px: `.card`, worker tiles.
- Segmented control: 10px track with 4px padding around 6px segments (concentric: 6 + 4 = 10).
- Step counters are 32px circles; progress and revenue bars are 4-6px with half-height radius.

## Components

| Component | Source | Use and states |
| --- | --- | --- |
| Button | `.button` in `src/styles.css:129` | Variants: default (raised surface), `.button-primary` (accent fill, one per view), `.button-quiet` (transparent with border), `.button-small` (36px tall, 14px text). 44px minimum height. Hover changes the border only under `(hover: hover)`; `:active` scales to 0.96, turned off under reduced motion. Transitions name their properties (150ms, `--ease-out`). Also used on `<a>` for external links. |
| Link button | `.link-button` | Text action inside forms ("Use an example", "Fill in wrapped SOL"): accent, underlined. |
| Field | `.field` + `label` + `input`/`textarea`, `.hint`, `.error` | Every control has a `<label for>`. Errors appear on submit: `aria-invalid`, `aria-describedby` to the error text, focus moves to the first invalid field, and the error clears when that field is edited. |
| Segmented control | `.segmented` / `.segment` in `Composer.tsx` | Native radio group in a fieldset with a hidden legend; checked state gets the raised fill. Used for Easy / Pro mode. |
| Composer | `src/components/Composer.tsx` | The main action. Easy mode needs only the idea; Pro mode reveals name, ticker, supply, initial purchase and a fee split that must total 100%. |
| Project studio | `src/components/Studio.tsx` | Empty state (heading, sentence, button that focuses the idea box) or a plan: title with ticker, approval count and progress bar, Download plan / Clear plan, and ARIA tabs (Tasks, Token, Social, Launch) with arrow, Home and End keys and roving tabindex. Saved to `localStorage`. Copy and download results are announced in a `role="status"` region. |
| Task row | `TaskRow` in `Studio.tsx` | Deliverable, worker, summary, status (symbol plus text), Approve / Undo approval / Request changes. "Request changes" opens an inline form; Escape cancels. |
| Steps | `.steps` (`ol`) | Numbered counters sit at the inline start of each item, never above the heading. |
| Watchlist | `src/components/Watchlist.tsx` | Mint address form with base58 validation and duplicate check; rows link to DexScreener, Raydium and Solscan; empty state; saved in `localStorage`. |
| Revenue table | `src/components/Revenue.tsx` | Amount input and a table of the proposed split: row header with bar and detail, then share and amount columns aligned to the end. |
| Header | `src/components/Header.tsx` | Brand at the left edge, section nav on the right from 60rem; below that a Menu disclosure button (`aria-expanded`, Escape closes and returns focus). Not sticky. |
| Card | `.card` | Surface fill, 1px border, 14px radius, 16px padding (24px from 40rem). Top-level only. |

Focus: every focusable element gets the global `:focus-visible` 2px lime outline with a 2px offset (`src/styles.css:94`); the segment input forwards it to its visible span. A "Skip to content" link is the first tab stop.

## Do's and Don'ts

- Do build new sections as `<section class="section">` > `.wrap` > `.section-intro` (h2 + one paragraph), then a `.card`, `.steps`, `.worker-grid` or `.split`.
- Do use only the six `--text-*` sizes and the three weights; h2 is the section title, h3 is the item title.
- Do keep one `.button-primary` per view; use the default or quiet button for everything else.
- Do label every field, validate on submit, and put the error text beside the field.
- Do wrap critical values (addresses, amounts) with `overflow-wrap: anywhere`; never ellipsize them.
- Don't nest a `.card` (or anything with a fill, radius and padding) inside another card; separate rows with dividers.
- Don't add uppercase or tracked labels above headings, shadows on bordered surfaces, gradient text, or `transition: all`.
- Don't use the accent on static text, or a status colour without a text label.
- Don't show market prices, balances or burn totals unless the page actually reads them from a source; say where data comes from.

**Recipe: adding a page section.** Add an `id` and an entry in `LINKS` in `Header.tsx`, write the section in `App.tsx` with the structure above, reuse `.card` and `.button` variants, then run `npm run build` and the checks in the README.
