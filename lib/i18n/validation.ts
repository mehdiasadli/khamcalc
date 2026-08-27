import type { Translator } from "@/lib/i18n/translate"

export function validatePlayerName(
  name: string,
  t: Translator
): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: t("validation.nameRequired") }
  }

  if (trimmed.length < 2) {
    return { ok: false, error: t("validation.nameMin") }
  }

  if (trimmed.length > 20) {
    return { ok: false, error: t("validation.nameMax") }
  }

  return {
    ok: true,
    value: trimmed[0].toUpperCase() + trimmed.slice(1),
  }
}

export function mapValidationMessage(message: string, t: Translator): string {
  switch (message) {
    case "Name is required":
      return t("validation.nameRequired")
    case "Name must be at least 2 characters":
      return t("validation.nameMin")
    case "Name must be less than 20 characters":
      return t("validation.nameMax")
    case "A player with this name already exists":
      return t("validation.nameDuplicate")
    default:
      return message
  }
}
