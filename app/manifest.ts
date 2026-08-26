import type { MetadataRoute } from "next"

import {
  PWA_APP_DESCRIPTION,
  PWA_APP_NAME,
  PWA_APP_SHORT_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_ICONS,
  PWA_THEME_COLOR,
} from "@/lib/pwa/constants"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA_APP_NAME,
    short_name: PWA_APP_SHORT_NAME,
    description: PWA_APP_DESCRIPTION,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    categories: ["games", "utilities"],
    icons: [
      {
        src: PWA_ICONS.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: PWA_ICONS.icon512,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: PWA_ICONS.icon512Maskable,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
