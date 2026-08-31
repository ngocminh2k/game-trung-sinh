// T14 — System (Hệ Thống) interface helpers. Pure, deterministic.
// No rng, no Date, no state access. See contracts/story-canon.md §2 and tasks/T14-system-interface.md.

import {
  SYSTEM_MESSAGES,
  SYSTEM_HEADER_VI,
  SYSTEM_HEADER_EN,
  type SystemMessage,
} from '../content/system-messages'

export type SystemLocale = 'vi' | 'en'

const TOKEN_PATTERN = /\{([a-zA-Z0-9_]+)\}/g

function headerFor(locale: SystemLocale): string {
  return locale === 'vi' ? SYSTEM_HEADER_VI : SYSTEM_HEADER_EN
}

function templateOf(message: SystemMessage, locale: SystemLocale): string {
  return locale === 'vi' ? message.templateVi : message.templateEn
}

/**
 * Formats a System notification: header + template with {token}s replaced by vars.
 * Missing vars keep the literal {token} — this function never throws.
 * Unknown message id falls back to the header followed by the id.
 */
export function formatSystemMessage(
  id: string,
  vars: Record<string, string | number>,
  locale: SystemLocale,
): string {
  const header = headerFor(locale)
  const message = SYSTEM_MESSAGES.find((m) => m.id === id)
  if (!message) {
    return `${header} ${id}`
  }
  const body = templateOf(message, locale).replace(TOKEN_PATTERN, (raw, token: string) => {
    const value = vars[token]
    return value === undefined ? raw : String(value)
  })
  return `${header} ${body}`
}

export interface QueuedNotification {
  id: string
  vars: Record<string, string | number>
}

/** Pure append: returns a new queue with the notification at the end. */
export function queuePush(
  queue: QueuedNotification[],
  id: string,
  vars: Record<string, string | number> = {},
): QueuedNotification[] {
  return [...queue, { id, vars }]
}

/**
 * Drains up to `max` notifications from the end of the queue, newest first.
 * Returns the visible slice and the untouched remainder (front of the queue).
 */
export function queueDrain(
  queue: QueuedNotification[],
  max = 3,
): { visible: QueuedNotification[]; rest: QueuedNotification[] } {
  const cut = Math.max(0, queue.length - Math.max(0, max))
  return {
    visible: queue.slice(cut).reverse(),
    rest: queue.slice(0, cut),
  }
}
