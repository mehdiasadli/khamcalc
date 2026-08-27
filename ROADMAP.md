# TriviScore Roadmap

Frontend-only trivia score calculator. No backend, no database — all state in Zustand + `localStorage`.

**Scope locked from grill-me:**

- Stats cover the **current game only** (live + finished)
- Export via **copy summary** + **share sheet** (no JSON/CSV for now) — **Update 14** will add JSON portability
- Accuracy counts only questions where a player was marked correct **or** incorrect (idle = excluded)

**Scope locked from grill-me (Updates 12+, 2026-08-27):**

- **Rebrand:** **TriviScore** (display name); keep `khamcalc` persist key unless migration added
- **i18n phase 1:** EN + AZ + RU first; FR, TR, DE, ES, IT, PT, JA, ZH, KO in phase 2
- **Export/import v1:** **JSON only** (full game snapshot); no CSV in first ship
- **Custom preset share:** **Copy JSON string** → paste to import (no backend)
- **App analytics:** **Google Analytics (GA4)** — not Vercel Analytics; no PII, document in README; consider consent banner if required
- **Scoring randomize:** third setup path — **randomize scoring config** (not live scores); alongside preset pick or manual edit
- **Heatmap overflow:** always show; **scrollable container** when grid is large
- **Persist key:** **keep `khamcalc`** — no migration (recommended; zero breakage for existing hosts)

**Explicitly out of scope:**

- Hardest-questions ranking
- MVP / standout auto-callouts (achievements cover flair instead)
- Keyboard shortcuts
- Multi-session game history archive
- Backend / database

---

## Status legend

| Symbol | Meaning     |
| ------ | ----------- |
| ⬜     | Not started |
| 🔄     | In progress |
| ✅     | Done        |

---

## Update 1 — Data foundation

> Everything else depends on richer, honest audit data and player lifecycle.

| #   | Item                                                                                                                                                                                              | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1.1 | **Skipped questions in audit log** — when host presses Next without answers, record `{ round, question, skipped: true }` (or equivalent flag) so stats don’t undercount                           | ✅     |
| 1.2 | **Soft-delete players** — `removedAt` (or `active: false`) on player; keep in list for historical stats; hide from live scoring unless restored                                                   | ✅     |
| 1.3 | **Player order in store** — explicit `playerOrder: string[]` or ordered array + `reorderPlayers(from, to)` action (prep for DnD)                                                                  | ✅     |
| 1.4 | **Achievement schema** — `TAchievement` type, game-scoped earned list `{ playerId, type, count, earnedAtRound }`                                                                                  | ✅     |
| 1.5 | **Ace detection** — pure fn: player answered **all** questions in a round correctly (no wrong marks, one correct per question they won); increment Ace count on round completion / when derivable | ✅     |

**Files (expected):** `schemas/game.schema.ts`, `schemas/player.schema.ts`, `lib/game.ts`, `lib/achievements.ts`, `stores/app.store.ts`

**Notes:** Not in prod — schema changes can overwrite persist without migration for now.

---

## Update 2 — Analytics engine

> Pure derivation layer; no UI yet.

| #   | Item                                                                                                                                                                             | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2.1 | **`lib/analytics.ts`** — all stats derived from `game.questions`, `players`, `scores`, `config`                                                                                  | ✅     |
| 2.2 | **Game overview metrics** — questions played, correct/incorrect totals, avg wrong per question, elapsed duration, progress vs limits, preset name                                | ✅     |
| 2.3 | **Per-player stats** — score, rank, correct/wrong counts, accuracy, points per round, participation rate                                                                         | ✅     |
| 2.4 | **Extended stats** (from available data) — e.g. first correct in round, wrong-before-correct ratio, rounds led, idle question count, comeback delta (score change last 2 rounds) | ✅     |
| 2.5 | **Round breakdown** — cumulative score per player at end of each round                                                                                                           | ✅     |
| 2.6 | **Question log** — ordered list of round:question with correct player + wrong players + skipped flag                                                                             | ✅     |
| 2.7 | **Leaderboard timeline** — who held #1 after each round                                                                                                                          | ✅     |
| 2.8 | **Streak stats** — longest consecutive correct streak per player                                                                                                                 | ✅     |
| 2.9 | **`formatGameSummary()`** — plain-text block for clipboard / share                                                                                                               | ✅     |

**Files (expected):** `lib/analytics.ts`, unit tests optional later

---

## Update 3 — Stats page shell

> Route, navigation, tabs — charts come next.

| #   | Item                                                                            | Status |
| --- | ------------------------------------------------------------------------------- | ------ |
| 3.1 | **`/stats` route** — client page, redirects to setup if no active/finished game | ✅     |
| 3.2 | **nuqs tab state** — `?tab=overview` \| `?tab=players` (default `overview`)     | ✅     |
| 3.3 | **Overview tab** — metric cards + placeholders for charts                       | ✅     |
| 3.4 | **Players tab** — per-player stat cards / table                                 | ✅     |
| 3.5 | **Stats link in game header** — chart icon beside gear                          | ✅     |
| 3.6 | **Empty state** — no game → friendly message + link to setup                    | ✅     |
| 3.7 | **Live updates** — stats recompute as host marks answers (subscribe to store)   | ✅     |

**Deps:** `nuqs`, shadcn `Tabs`

**Skill:** [nuqs](https://skills.sh/pproenca/dot-skills/nuqs) (1.4K installs) — `npx skills add pproenca/dot-skills@nuqs`

---

## Update 4 — Stats charts (shadcn)

> Visual layer on top of analytics engine.

| #   | Item                                                                                                                | Status |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| 4.1 | **Install shadcn `chart`** (+ recharts peer)                                                                        | ✅     |
| 4.2 | **Bar chart** — e.g. per-player correct vs wrong, or points per round                                               | ✅     |
| 4.3 | **Line chart** — round-by-round cumulative score; **multi-select players** (toggle chips), **default all selected** | ✅     |
| 4.4 | **Round breakdown table** in Overview                                                                               | ✅     |
| 4.5 | **Question log** — expandable rows in Overview or Players                                                           | ✅     |
| 4.6 | **Leaderboard timeline** — compact vertical list                                                                    | ✅     |
| 4.7 | **Streak display** — in Players tab                                                                                 | ✅     |

**Skill:** local `shadcn` skill + `bunx shadcn@latest add chart`

---

## Update 5 — Share & export

| #   | Item                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------ | ------ |
| 5.1 | **Copy summary** button on stats page — uses `formatGameSummary()` + `navigator.clipboard`             | ✅     |
| 5.2 | **Share bottom sheet** — shadcn `Sheet` with targets: WhatsApp, Telegram, Discord, X (Twitter), + Copy | ✅     |
| 5.3 | **Share URLs** — `https://wa.me/?text=`, `https://t.me/share/url?url=&text=`, etc.                     | ✅     |

---

## Update 6 — Game flow polish

| #   | Item                                                                                                        | Status |
| --- | ----------------------------------------------------------------------------------------------------------- | ------ |
| 6.1 | **Finished-game CTA** — “View stats” on game page when `status === finished`                                | ✅     |
| 6.2 | **Setup summary card** — when last game finished: final scores + “View full stats”                          | ✅     |
| 6.3 | **New game** — `resetGame()` with confirm from finished state (and/or setup)                                | ✅     |
| 6.4 | **Lock config during active game** — disable preset/inputs while `game.status === playing``, or warn dialog | ✅     |

---

## Update 7 — Achievements

> Badges below player name on cards; persist until game ends.

| #   | Item                                                                                                 | Status |
| --- | ---------------------------------------------------------------------------------------------------- | ------ |
| 7.1 | **Ace achievement** — all questions in a round answered correctly by same player (see 1.5 for rules) | ✅     |
| 7.2 | **Badge UI on `PlayerCard`** — below name; emoji + color per type; stack `Ace ×2`                    | ✅     |
| 7.3 | **Ace definition** — emoji 🎯 (or similar), distinct badge color                                     | ✅     |
| 7.4 | **Hook into game flow** — evaluate on round boundary / when round completes                          | ✅     |

**Future achievements (backlog, not scheduled):** Hot streak, Comeback, Sweep, etc.

---

## Update 8 — Player reorder (DnD)

| #   | Item                                                                                          | Status |
| --- | --------------------------------------------------------------------------------------------- | ------ |
| 8.1 | **Install `@dnd-kit/core` + `@dnd-kit/sortable`** (lightweight)                               | ✅     |
| 8.2 | **Drag handle on card** — grip icon only; card body not draggable                             | ✅     |
| 8.3 | **Reorder on game page** — host sorts players for their screen (e.g. frequent buzzers to top) | ✅     |
| 8.4 | **Persist order** — via store / localStorage                                                  | ✅     |

**Scope:** Game page player list only (setup list optional later).

---

## Update 9 — PWA (high compatibility)

> Installable, offline-first host tool.

| #   | Item                                                                                                                 | Status |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| 9.1 | **Web app manifest** — name, short_name, description, theme_color, background_color, display `standalone`, start_url | ✅     |
| 9.2 | **App icons** — 192, 512, maskable, apple-touch-icon                                                                 | ✅     |
| 9.3 | **Service worker** — cache static assets + app shell; offline fallback                                               | ✅     |
| 9.4 | **Offline game/score** — Zustand persist already local; verify works without network after first load                | ✅     |
| 9.5 | **Install prompt UX** — optional subtle banner when `beforeinstallprompt` fires                                      | ✅     |

**Skill:** [pwa-development](https://skills.sh/alinaqi/maggy/pwa-development) (2.9K installs) — `npx skills add alinaqi/maggy@pwa-development`

**Next.js note:** use `@serwist/next` or built-in PWA pattern compatible with Next 16 — verify against `node_modules/next/dist/docs/`.

---

## Update 10 — SEO & page metadata

| #    | Item                                                                  | Status |
| ---- | --------------------------------------------------------------------- | ------ |
| 10.1 | **Per-route metadata** — `/`, `/game`, `/stats` titles + descriptions | ✅     |
| 10.2 | **Open Graph + Twitter cards** — share previews when links posted     | ✅     |
| 10.3 | **Canonical URLs, theme-color meta**                                  | ✅     |
| 10.4 | **Icons wired for SEO + PWA** — same asset set as Update 9            | ✅     |

---

## Update 11 — Host feedback (haptics & audio)

| #    | Item                                                                                            | Status |
| ---- | ----------------------------------------------------------------------------------------------- | ------ |
| 11.1 | **Haptic feedback** — short `navigator.vibrate()` on correct / incorrect (mobile)               | ✅     |
| 11.2 | **Optional sound cues** — subtle correct/wrong/undo sounds; mute toggle in setup or game header | ✅     |
| 11.3 | **Respect reduced motion / silent mode**                                                        | ✅     |

---

## Suggested implementation order

```
Update 1  →  Update 2  →  Update 3  →  Update 4
                ↓
         Update 5 (share)
                ↓
         Update 6 (flow)
                ↓
    Update 7 (achievements) ← depends on 1.4, 1.5
                ↓
         Update 8 (DnD) ← depends on 1.3
                ↓
    Update 9 + 10 (PWA + SEO) — can parallelize
                ↓
         Update 11 (haptics/audio)
```

**Recommended next step (Updates 1–11):** Complete — see changelog. Continue with **Update 12+** below.

---

## Post–Update 11 (shipped, not in original batches)

| Item | Status |
| ---- | ------ |
| Flexible scoring config (ladder, wrong deductions, presets) | ✅ |
| Seven game/scoring presets (Khamsa, Brain Ring, Jeopardy!, etc.) | ✅ |
| Early end game from header | ✅ |
| Expanded achievements + live streak on cards | ✅ |
| Round progress sticks on player cards | ✅ |
| Game-wide correct/wrong/accuracy on player cards | ✅ |
| Mobile theme toggle + `D` hotkey (desktop) | ✅ |
| Share sheet cleanup (removed Discord duplicate) | ✅ |

---

## Update 12 — Rebrand

> Generic trivia scorekeeper identity (was KhamCalc-specific).

| #    | Item                                                                                              | Status |
| ---- | ------------------------------------------------------------------------------------------------- | ------ |
| 12.1 | **App name → TriviScore** — locked; update display name everywhere                         | ✅     |
| 12.2 | **Manifest + PWA** — `name`, `short_name`, icons alt text, install prompt copy                    | ✅     |
| 12.3 | **SEO metadata** — titles, descriptions, OG/Twitter, `site.ts` constants                          | ✅     |
| 12.4 | **In-app copy** — setup header, empty states, share summary prefix, achievement strings if branded | ✅     |
| 12.5 | **Repo / deploy** — optional rename of domain, GitHub repo; **keep persist key `khamcalc`** (locked) | ✅     |

**Notes:** Display name TriviScore only; internal storage key stays `khamcalc`.

---

## Update 13 — Internationalization (i18n)

> Host-facing UI in multiple languages; stats/share strings included.

| #    | Item                                                                                    | Status |
| ---- | --------------------------------------------------------------------------------------- | ------ |
| 13.1 | **i18n foundation** — lightweight dictionary + `I18nProvider` + locale in store | ✅     |
| 13.2 | **Language picker** — setup (and persist preference in localStorage)                    | ✅     |
| 13.3 | **Phase 1 locales** — **EN + AZ + RU** (locked)                                           | ✅     |
| 13.4 | **Phase 2 locales** — FR, TR, DE, ES, IT, PT, JA, ZH, KO — deferred                       | —      |
| 13.5 | **Format helpers** — dates via `date-fns`, numbers/`%` via `Intl`; share summary localized | ✅     |
| 13.6 | **RTL / plural rules** — deferred (no Arabic in phase 1)                                  | —      |

**Deps:** `next-intl` (or agreed lib), extract all user-visible strings.

---

## Update 14 — Export & import (portability)

> Continue a game on another device/browser. **Expands** original “no JSON/CSV” scope lock.

| #    | Item                                                                                         | Status |
| ---- | -------------------------------------------------------------------------------------------- | ------ |
| 14.1 | **Export schema** — versioned snapshot: `config`, `players`, `playerOrder`, `game`, prefs    | ⬜     |
| 14.2 | **Export JSON** — download or copy from stats/setup; includes checksum or schema version     | ⬜     |
| 14.3 | **Import JSON** — validate (Zod), merge or replace; warn if active game exists             | ⬜     |
| 14.4 | **Continue elsewhere UX** — “Import game” on setup + success toast → `/game` or `/stats`     | ⬜     |
| 14.5 | ~~CSV export~~ — **out of v1** (JSON only per grill-me)                                    | —      |

**Grill-me:** JSON-only for v1; no CSV.

---

## Update 15 — Custom presets & scoring extras

| #    | Item                                                                                                    | Status |
| ---- | ------------------------------------------------------------------------------------------------------- | ------ |
| 15.1 | **Save custom preset** — name + full `TGameConfig`; store in localStorage alongside built-ins         | ⬜     |
| 15.2 | **Edit / delete** custom presets; built-in presets remain read-only                                     | ⬜     |
| 15.3 | **Share preset** — **copy JSON string** → paste to import on another device (locked)                      | ⬜     |
| 15.4 | **Preset picker UI** — custom section in game config; active preset detection includes custom             | ⬜     |
| 15.5 | **Randomize scoring config** — setup button (3rd path: preset \| manual \| random); generates valid `TGameConfig`, not live score shuffle | ⬜     |

---

## Update 16 — Themes

> Beyond light / dark / system.

| #    | Item                                                                                    | Status |
| ---- | --------------------------------------------------------------------------------------- | ------ |
| 16.1 | **Theme catalog** — e.g. Light, Dark, Midnight, High contrast (pick 2–4 for v1)         | ⬜     |
| 16.2 | **Theme picker** — setup or header; persist choice; respect `prefers-color-scheme` for System | ⬜     |
| 16.3 | **CSS tokens** — map themes to existing shadcn variables without one-off overrides      | ⬜     |

---

## Update 17 — Player heatmaps (stats)

> GitHub-style grid: rows = questions, columns = rounds.

| #    | Item                                                                                          | Status |
| ---- | --------------------------------------------------------------------------------------------- | ------ |
| 17.1 | **Heatmap model** — per player, cell = correct / wrong / skipped / not reached                | ✅     |
| 17.2 | **UI on `/stats?tab=players`** — under each player card                                       | ✅     |
| 17.3 | **Legend** — green correct, red wrong, gray skipped, empty/faint not reached                  | ✅     |
| 17.4 | **Export PNG** — share single player heatmap (canvas or `html-to-image`)                      | ✅     |
| 17.5 | **Large grids** — always render; **scrollable container** when questions × rounds is large (locked) | ✅     |

---

## Update 18 — In-game player stats modal

> Host stays on game screen.

| #    | Item                                                                                       | Status |
| ---- | ------------------------------------------------------------------------------------------ | ------ |
| 18.1 | **“See stats” in player card menu** — beside rename / remove                               | ⬜     |
| 18.2 | **Player stats modal** — subset of Players tab: score, accuracy, streak, round points, heatmap (if 17 done) | ⬜     |
| 18.3 | **Live updates** — modal recomputes from store while game is playing                       | ⬜     |

---

## Update 19 — App analytics

> Usage telemetry for product decisions (not game stats).

| #    | Item                                                                                    | Status |
| ---- | --------------------------------------------------------------------------------------- | ------ |
| 19.1 | **Google Analytics 4** — page views + optional custom events (locked; not Vercel)       | ⬜     |
| 19.2 | **Privacy** — no PII in events; GA measurement ID via env; README + consent if needed   | ⬜     |
| 19.3 | **Key events (optional)** — `game_started`, `game_finished`, `share_opened`, `export_used` | ⬜     |

**Note:** Use `@next/third-parties/google` or gtag snippet; respect ad blockers; EU hosts may need consent UI — confirm at implementation time.

---

## Suggested implementation order (Updates 12+)

```
Update 14 (export/import)  ← high host value, unlocks cross-device
        ↓
Update 15 (custom presets + randomize)
        ↓
Update 18 (in-game player stats modal)  ← quick win, uses existing analytics
        ↓
Update 17 (heatmaps)  ← feeds modal + stats tab
        ↓
Update 12 (rebrand)  ← do before public launch / marketing
        ↓
Update 13 (i18n phase 1 → 2)
        ↓
Update 16 (extra themes)
        ↓
Update 19 (app analytics)
```

**Recommended next step:** Update 14 (JSON export/import) or Update 18 (player stats modal) for fastest visible value.

---

## Skills reference

| Need                       | Skill                               | Installs |
| -------------------------- | ----------------------------------- | -------- |
| shadcn charts & components | local `.claude/skills/shadcn`       | —        |
| URL tab state              | `pproenca/dot-skills@nuqs`          | 1.4K     |
| PWA / service worker       | `alinaqi/maggy@pwa-development`     | 2.9K     |
| UI polish                  | `anthropics/skills@frontend-design` | 822K     |

Browse: [skills.sh](https://skills.sh/)

---

## Changelog

| Date       | Change                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| 2026-08-27 | Initial roadmap from grill-me feedback session                                     |
| 2026-08-27 | Update 1 complete — skipped questions, soft-delete, player order, Ace achievements |
| 2026-08-27 | Update 2 complete — analytics engine and formatGameSummary                         |
| 2026-08-27 | Update 3 complete — stats page shell with nuqs tabs                                |
| 2026-08-27 | Update 4 complete — shadcn charts and enhanced stats views                         |
| 2026-08-27 | Update 5 complete — copy summary and share sheet                                   |
| 2026-08-27 | Update 6 complete — finished flow, new game, config lock                           |
| 2026-08-27 | Update 7 complete — Ace badge UI on player cards                                   |
| 2026-08-27 | Update 8 complete — drag-to-reorder players on game page                           |
| 2026-08-27 | Update 9 complete — PWA manifest, icons, Serwist SW, install prompt                |
| 2026-08-27 | Update 10 complete — per-route SEO, OG/Twitter, canonical URLs                     |
| 2026-08-27 | Update 11 complete — host-configurable sounds and haptics                          |
| 2026-08-27 | Post-roadmap — flexible scoring, presets, sticks, player stats, theme toggle       |
| 2026-08-27 | Updates 12–19 drafted from next-items list (rebrand, i18n, export, heatmaps, etc.) |
| 2026-08-27 | Grill-me locked: TriviScore, EN/AZ/RU, JSON-only, GA4, config randomize, scroll heatmaps, keep persist key |
| 2026-08-27 | Update 12 complete — TriviScore rebrand, PWA icons regenerated, metadata and share copy updated |
| 2026-08-27 | Update 13 complete — custom i18n (EN/AZ/RU), language picker, date-fns duration formatting |
| 2026-08-27 | Update 17 complete — player answer heatmaps on stats tab, legend, scroll grids, canvas PNG export |

---

<!-- Removed: "Next things draft" — absorbed into Updates 12–19 above -->
