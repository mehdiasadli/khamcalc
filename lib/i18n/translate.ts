import type { TLocale } from "@/schemas/locale.schema"

import { messages } from "./messages"

type MessageTree = {
  [key: string]: string | MessageTree
}

function getNestedValue(source: MessageTree, path: string): string | undefined {
  const parts = path.split(".")
  let current: string | MessageTree | undefined = source

  for (const part of parts) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      return undefined
    }

    current = current[part]
  }

  return typeof current === "string" ? current : undefined
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

export type Translator = (
  key: string,
  params?: Record<string, string | number>
) => string

export function createTranslator(locale: TLocale): Translator {
  const catalog = messages[locale] as MessageTree

  return (key, params) => {
    const value =
      getNestedValue(catalog, key) ??
      getNestedValue(messages.en as MessageTree, key)

    if (!value) {
      return key
    }

    return interpolate(value, params)
  }
}
