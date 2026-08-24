export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

export function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function bump(
  record: Record<string, number>,
  id: string,
  delta: number,
): Record<string, number> {
  const current = record[id] ?? 0
  const next = { ...record }
  const value = current + delta
  if (value <= 0) {
    delete next[id]
  } else {
    next[id] = value
  }
  return next
}

export function countOf(record: Record<string, number>, id: string): number {
  return record[id] ?? 0
}

export function totalUnits(record: Record<string, number>): number {
  return Object.values(record).reduce((acc, v) => acc + v, 0)
}

export function flagNum(stateFlags: Record<string, number | boolean | string>, key: string): number {
  const v = stateFlags[key]
  return typeof v === 'number' ? v : 0
}
