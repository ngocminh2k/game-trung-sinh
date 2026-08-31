import { EN } from './en'
import { VI } from './vi'
import type { Locale } from '../engine/types'

export const DICTS = { vi: VI, en: EN } as const

export type Dict = typeof VI
export type DictKey = string

export function dict(locale: Locale): Dict {
  return DICTS[locale]
}

export function t(locale: Locale, key: DictKey, params: Record<string, string | number> = {}): string {
  const parts = key.split('.')
  let node: unknown = dict(locale)
  for (const part of parts) {
    if (typeof node !== 'object' || node === null) return key
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node !== 'string') return key
  return node.replace(/\{\{(\w+)\}\}/g, (match, name: string) => String(params[name] ?? match))
}

export function flattenDict(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return prefix.length > 0 ? [prefix] : []
  if (typeof value === 'object' && value !== null) {
    const keys: string[] = []
    for (const [k, v] of Object.entries(value)) {
      const nextPrefix = prefix.length > 0 ? `${prefix}.${k}` : k
      keys.push(...flattenDict(v, nextPrefix))
    }
    return keys
  }
  return prefix.length > 0 ? [prefix] : []
}

export function i18nParity(): { ok: boolean; missingInEn: string[]; missingInVi: string[] } {
  const viKeys = new Set(flattenDict(VI))
  const enKeys = new Set(flattenDict(EN))
  const missingInEn = [...viKeys].filter((k) => !enKeys.has(k)).sort()
  const missingInVi = [...enKeys].filter((k) => !viKeys.has(k)).sort()
  return { ok: missingInEn.length === 0 && missingInVi.length === 0, missingInEn, missingInVi }
}

export { EN, VI }
