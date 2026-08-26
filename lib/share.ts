export async function copyShareText(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function buildTelegramShareUrl(text: string): string {
  return `https://t.me/share/url?${new URLSearchParams({ text }).toString()}`
}

export function buildTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({ text }).toString()}`
}

export type TShareTargetId =
  | "whatsapp"
  | "telegram"
  | "twitter"
  | "discord"
  | "copy"

export interface TShareTarget {
  id: TShareTargetId
  label: string
  description: string
  href?: (text: string) => string
  copiesOnly?: boolean
}

export const SHARE_TARGETS: TShareTarget[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Open WhatsApp with the summary prefilled",
    href: buildWhatsAppShareUrl,
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Share via Telegram",
    href: buildTelegramShareUrl,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    description: "Post the summary on X",
    href: buildTwitterShareUrl,
  },
  {
    id: "discord",
    label: "Discord",
    description: "Copy summary, then paste in Discord",
    copiesOnly: true,
  },
  {
    id: "copy",
    label: "Copy summary",
    description: "Copy plain text to clipboard",
    copiesOnly: true,
  },
]

export function getShareHref(target: TShareTarget, text: string): string | null {
  if (!target.href) return null
  return target.href(text)
}
