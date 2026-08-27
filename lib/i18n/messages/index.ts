import type { TLocale } from "@/schemas/locale.schema"

import { en } from "./en"
import { az } from "./az"
import { ru } from "./ru"

export const messages = {
  en,
  az,
  ru,
} satisfies Record<TLocale, typeof en>

export type Messages = typeof en
