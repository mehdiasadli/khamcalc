import {
  PWA_APP_DESCRIPTION,
  PWA_APP_NAME,
  PWA_ICONS,
} from "@/lib/pwa/constants"

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, "")
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return normalizeSiteUrl(configured)
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    return normalizeSiteUrl(`https://${vercelUrl}`)
  }

  return "http://localhost:3999"
}

export const SITE_NAME = PWA_APP_NAME
export const SITE_DESCRIPTION = PWA_APP_DESCRIPTION
export const SITE_TITLE_TEMPLATE = `%s · ${SITE_NAME}`

export const ROUTE_METADATA = {
  setup: {
    title: "Setup",
    description:
      "Add players, choose round settings, and start a trivia scoring session.",
    path: "/",
  },
  game: {
    title: "Game",
    description:
      "Track live trivia scores with correct and incorrect marks, round navigation, and player achievements.",
    path: "/game",
  },
  stats: {
    title: "Stats",
    description:
      "Review scores, charts, streaks, and question history for the current game.",
    path: "/stats",
  },
} as const

export function getOgImage() {
  return {
    url: PWA_ICONS.icon512,
    width: 512,
    height: 512,
    alt: `${SITE_NAME} icon`,
  }
}
