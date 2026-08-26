import type { Metadata } from "next"

import {
  PWA_APP_DESCRIPTION,
  PWA_APP_NAME,
  PWA_ICONS,
  PWA_THEME_COLOR,
} from "@/lib/pwa/constants"

import {
  getOgImage,
  getSiteUrl,
  ROUTE_METADATA,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_TEMPLATE,
} from "./site"

type RouteMetadataKey = keyof typeof ROUTE_METADATA

export function createRootMetadata(): Metadata {
  const ogImage = getOgImage()

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: PWA_APP_NAME,
    title: {
      default: SITE_NAME,
      template: SITE_TITLE_TEMPLATE,
    },
    description: SITE_DESCRIPTION,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: PWA_APP_NAME,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: PWA_ICONS.favicon, sizes: "32x32" },
        { url: PWA_ICONS.icon192, sizes: "192x192", type: "image/png" },
        { url: PWA_ICONS.icon512, sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: PWA_ICONS.appleTouch, sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: PWA_APP_DESCRIPTION,
      images: [ogImage],
    },
    twitter: {
      card: "summary",
      title: SITE_NAME,
      description: PWA_APP_DESCRIPTION,
      images: [PWA_ICONS.icon512],
    },
  }
}

export function createPageMetadata(route: RouteMetadataKey): Metadata {
  const { title, description, path } = ROUTE_METADATA[route]
  const pageTitle = `${title} · ${SITE_NAME}`
  const ogImage = getOgImage()

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: path,
      images: [ogImage],
    },
    twitter: {
      title: pageTitle,
      description,
      images: [PWA_ICONS.icon512],
    },
  }
}

export const rootViewport = {
  themeColor: PWA_THEME_COLOR,
}
