# KhamCalc Roadmap

Frontend-only trivia score calculator. No backend, no database — all state in Zustand + `localStorage`.

**Scope locked from grill-me:**
- Stats cover the **current game only** (live + finished)
- Export via **copy summary** + **share sheet** (no JSON/CSV for now)
- Accuracy counts only questions where a player was marked correct **or** incorrect (idle = excluded)

**Explicitly out of scope:**
- Hardest-questions ranking
- MVP / standout auto-callouts (achievements cover flair instead)
- Keyboard shortcuts
- Multi-session game history archive
- Backend / database

---

## Status legend

| Symbol | Meaning        |
| ------ | -------------- |
| ⬜     | Not started    |
| 🔄     | In progress    |
| ✅     | Done           |

---

## Update 1 — Data foundation

> Everything else depends on richer, honest audit data and player lifecycle.

| # | Item | Status |
| - | ---- | ------ |
| 1.1 | **Skipped questions in audit log** — when host presses Next without answers, record `{ round, question, skipped: true }` (or equivalent flag) so stats don’t undercount | ✅ |
| 1.2 | **Soft-delete players** — `removedAt` (or `active: false`) on player; keep in list for historical stats; hide from live scoring unless restored | ✅ |
| 1.3 | **Player order in store** — explicit `playerOrder: string[]` or ordered array + `reorderPlayers(from, to)` action (prep for DnD) | ✅ |
| 1.4 | **Achievement schema** — `TAchievement` type, game-scoped earned list `{ playerId, type, count, earnedAtRound }` | ✅ |
| 1.5 | **Ace detection** — pure fn: player answered **all** questions in a round correctly (no wrong marks, one correct per question they won); increment Ace count on round completion / when derivable | ✅ |

**Files (expected):** `schemas/game.schema.ts`, `schemas/player.schema.ts`, `lib/game.ts`, `lib/achievements.ts`, `stores/app.store.ts`

**Notes:** Not in prod — schema changes can overwrite persist without migration for now.

---

## Update 2 — Analytics engine

> Pure derivation layer; no UI yet.

| # | Item | Status |
| - | ---- | ------ |
| 2.1 | **`lib/analytics.ts`** — all stats derived from `game.questions`, `players`, `scores`, `config` | ✅ |
| 2.2 | **Game overview metrics** — questions played, correct/incorrect totals, avg wrong per question, elapsed duration, progress vs limits, preset name | ✅ |
| 2.3 | **Per-player stats** — score, rank, correct/wrong counts, accuracy, points per round, participation rate | ✅ |
| 2.4 | **Extended stats** (from available data) — e.g. first correct in round, wrong-before-correct ratio, rounds led, idle question count, comeback delta (score change last 2 rounds) | ✅ |
| 2.5 | **Round breakdown** — cumulative score per player at end of each round | ✅ |
| 2.6 | **Question log** — ordered list of round:question with correct player + wrong players + skipped flag | ✅ |
| 2.7 | **Leaderboard timeline** — who held #1 after each round | ✅ |
| 2.8 | **Streak stats** — longest consecutive correct streak per player | ✅ |
| 2.9 | **`formatGameSummary()`** — plain-text block for clipboard / share | ✅ |

**Files (expected):** `lib/analytics.ts`, unit tests optional later

---

## Update 3 — Stats page shell

> Route, navigation, tabs — charts come next.

| # | Item | Status |
| - | ---- | ------ |
| 3.1 | **`/stats` route** — client page, redirects to setup if no active/finished game | ✅ |
| 3.2 | **nuqs tab state** — `?tab=overview` \| `?tab=players` (default `overview`) | ✅ |
| 3.3 | **Overview tab** — metric cards + placeholders for charts | ✅ |
| 3.4 | **Players tab** — per-player stat cards / table | ✅ |
| 3.5 | **Stats link in game header** — chart icon beside gear | ✅ |
| 3.6 | **Empty state** — no game → friendly message + link to setup | ✅ |
| 3.7 | **Live updates** — stats recompute as host marks answers (subscribe to store) | ✅ |

**Deps:** `nuqs`, shadcn `Tabs`

**Skill:** [nuqs](https://skills.sh/pproenca/dot-skills/nuqs) (1.4K installs) — `npx skills add pproenca/dot-skills@nuqs`

---

## Update 4 — Stats charts (shadcn)

> Visual layer on top of analytics engine.

| # | Item | Status |
| - | ---- | ------ |
| 4.1 | **Install shadcn `chart`** (+ recharts peer) | ⬜ |
| 4.2 | **Bar chart** — e.g. per-player correct vs wrong, or points per round | ⬜ |
| 4.3 | **Line chart** — round-by-round cumulative score; **multi-select players** (toggle chips), **default all selected** | ⬜ |
| 4.4 | **Round breakdown table** in Overview | ⬜ |
| 4.5 | **Question log** — expandable rows in Overview or Players | ⬜ |
| 4.6 | **Leaderboard timeline** — compact vertical list | ⬜ |
| 4.7 | **Streak display** — in Players tab | ⬜ |

**Skill:** local `shadcn` skill + `bunx shadcn@latest add chart`

---

## Update 5 — Share & export

| # | Item | Status |
| - | ---- | ------ |
| 5.1 | **Copy summary** button on stats page — uses `formatGameSummary()` + `navigator.clipboard` | ⬜ |
| 5.2 | **Share bottom sheet** — shadcn `Sheet` with targets: WhatsApp, Telegram, Discord, X (Twitter), + Copy | ⬜ |
| 5.3 | **Share URLs** — `https://wa.me/?text=`, `https://t.me/share/url?url=&text=`, etc. | ⬜ |

---

## Update 6 — Game flow polish

| # | Item | Status |
| - | ---- | ------ |
| 6.1 | **Finished-game CTA** — “View stats” on game page when `status === finished` | ⬜ |
| 6.2 | **Setup summary card** — when last game finished: final scores + “View full stats” | ⬜ |
| 6.3 | **New game** — `resetGame()` with confirm from finished state (and/or setup) | ⬜ |
| 6.4 | **Lock config during active game** — disable preset/inputs while `game.status === playing``, or warn dialog | ⬜ |

---

## Update 7 — Achievements

> Badges below player name on cards; persist until game ends.

| # | Item | Status |
| - | ---- | ------ |
| 7.1 | **Ace achievement** — all questions in a round answered correctly by same player (see 1.5 for rules) | ⬜ |
| 7.2 | **Badge UI on `PlayerCard`** — below name; emoji + color per type; stack `Ace ×2` | ⬜ |
| 7.3 | **Ace definition** — emoji 🎯 (or similar), distinct badge color | ⬜ |
| 7.4 | **Hook into game flow** — evaluate on round boundary / when round completes | ⬜ |

**Future achievements (backlog, not scheduled):** Hot streak, Comeback, Sweep, etc.

---

## Update 8 — Player reorder (DnD)

| # | Item | Status |
| - | ---- | ------ |
| 8.1 | **Install `@dnd-kit/core` + `@dnd-kit/sortable`** (lightweight) | ⬜ |
| 8.2 | **Drag handle on card** — grip icon only; card body not draggable | ⬜ |
| 8.3 | **Reorder on game page** — host sorts players for their screen (e.g. frequent buzzers to top) | ⬜ |
| 8.4 | **Persist order** — via store / localStorage | ⬜ |

**Scope:** Game page player list only (setup list optional later).

---

## Update 9 — PWA (high compatibility)

> Installable, offline-first host tool.

| # | Item | Status |
| - | ---- | ------ |
| 9.1 | **Web app manifest** — name, short_name, description, theme_color, background_color, display `standalone`, start_url | ⬜ |
| 9.2 | **App icons** — 192, 512, maskable, apple-touch-icon | ⬜ |
| 9.3 | **Service worker** — cache static assets + app shell; offline fallback | ⬜ |
| 9.4 | **Offline game/score** — Zustand persist already local; verify works without network after first load | ⬜ |
| 9.5 | **Install prompt UX** — optional subtle banner when `beforeinstallprompt` fires | ⬜ |

**Skill:** [pwa-development](https://skills.sh/alinaqi/maggy/pwa-development) (2.9K installs) — `npx skills add alinaqi/maggy@pwa-development`

**Next.js note:** use `@serwist/next` or built-in PWA pattern compatible with Next 16 — verify against `node_modules/next/dist/docs/`.

---

## Update 10 — SEO & page metadata

| # | Item | Status |
| - | ---- | ------ |
| 10.1 | **Per-route metadata** — `/`, `/game`, `/stats` titles + descriptions | ⬜ |
| 10.2 | **Open Graph + Twitter cards** — share previews when links posted | ⬜ |
| 10.3 | **Canonical URLs, theme-color meta** | ⬜ |
| 10.4 | **Icons wired for SEO + PWA** — same asset set as Update 9 | ⬜ |

---

## Update 11 — Host feedback (haptics & audio)

| # | Item | Status |
| - | ---- | ------ |
| 11.1 | **Haptic feedback** — short `navigator.vibrate()` on correct / incorrect (mobile) | ⬜ |
| 11.2 | **Optional sound cues** — subtle correct/wrong/undo sounds; mute toggle in setup or game header | ⬜ |
| 11.3 | **Respect reduced motion / silent mode** | ⬜ |

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

**Recommended next step:** Update 1 (data foundation) — unblocks analytics, achievements, and accurate skip tracking.

---

## Skills reference

| Need | Skill | Installs |
| ---- | ----- | -------- |
| shadcn charts & components | local `.claude/skills/shadcn` | — |
| URL tab state | `pproenca/dot-skills@nuqs` | 1.4K |
| PWA / service worker | `alinaqi/maggy@pwa-development` | 2.9K |
| UI polish | `anthropics/skills@frontend-design` | 822K |

Browse: [skills.sh](https://skills.sh/)

---

## Changelog

| Date | Change |
| ---- | ------ |
| 2026-08-27 | Initial roadmap from grill-me feedback session |
| 2026-08-27 | Update 1 complete — skipped questions, soft-delete, player order, Ace achievements |
| 2026-08-27 | Update 2 complete — analytics engine and formatGameSummary |
| 2026-08-27 | Update 3 complete — stats page shell with nuqs tabs |
