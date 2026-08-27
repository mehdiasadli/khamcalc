# TriviScore

Frontend-only trivia scorekeeper for hosts. Built with Next.js, Zustand, and local storage — no backend required.

**Production site:** [https://triviscore.netlify.app](https://triviscore.netlify.app)

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:3999](http://localhost:3999).

Other scripts: `bun run build`, `bun run typecheck`, `bun run lint`.

## Environment variables

Copy `.env.example` to `.env.local` for local development:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for SEO/OG tags. Use `https://triviscore.netlify.app` in production. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`). Omit to disable analytics entirely. |

## Google Analytics (GA4)

TriviScore uses **Google Analytics 4** for anonymous product usage telemetry (not game stats). Analytics load only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

### What is tracked

- **Page views** — `/`, `/game`, `/stats` (including query tabs)
- **Custom events** (no player names or other PII):
  - `game_started` — `preset_key`, `player_count`
  - `game_finished` — `preset_key`, `player_count`, `questions_played`
  - `share_opened` — `source` (`stats`)
  - `export_used` — `export_type` (`heatmap_png`)

### Set up GA4 in Google Analytics (step by step)

1. **Open Google Analytics**  
   Go to [https://analytics.google.com/](https://analytics.google.com/) and sign in with the Google account you want to own the property.

2. **Create an account** (skip if you already have one)  
   - Admin (gear, bottom-left) → **Account** column → **Create account**  
   - Account name: e.g. `TriviScore`  
   - Configure data-sharing settings as you prefer → **Next**

3. **Create a GA4 property**  
   - Property name: `TriviScore`  
   - Reporting time zone: your timezone  
   - Currency: your choice → **Next**  
   - Business details → **Create** → Accept terms if prompted

4. **Add a Web data stream**  
   - Choose **Web**  
   - Website URL: `https://triviscore.netlify.app`  
   - Stream name: e.g. `TriviScore Netlify`  
   - **Create stream**

5. **Copy the Measurement ID**  
   On the stream details page, copy **Measurement ID** (format `G-XXXXXXXXXX`). This is your `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

6. **Configure Netlify**  
   - Netlify dashboard → your site → **Site configuration** → **Environment variables**  
   - Add:
     - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX` (your ID)
     - `NEXT_PUBLIC_SITE_URL` = `https://triviscore.netlify.app`  
   - Scope: **All scopes** (or at least Production)  
   - **Save** → **Deploys** → **Trigger deploy** → **Deploy site** (env vars apply on the next build)

7. **Local testing (optional)**  
   In `.env.local`:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_SITE_URL=http://localhost:3999
   ```
   Restart `bun run dev`. Use GA4 **Admin → Data display → DebugView** while testing, or install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension.

8. **Verify data**  
   - Browse the live site, start/finish a game, open share, export a heatmap  
   - In GA4: **Reports → Realtime** (events appear within seconds to a few minutes)  
   - Custom events: **Admin → Events** (may take 24h to appear in standard reports; Realtime/DebugView is immediate)

### Privacy notes

- No player names, scores, or free-text content are sent to GA.
- Omit `NEXT_PUBLIC_GA_MEASUREMENT_ID` to disable all Google Analytics loading.
- If you have significant EU traffic, you may need a cookie/consent banner before loading GA — not included in v1; consult your privacy policy requirements.

## Deploy (Netlify)

Build command: `bun run build`  
Publish directory: `.next` (or your Netlify Next.js plugin output — follow Netlify’s Next.js setup if using their adapter)

Set environment variables as described above before production deploy.
