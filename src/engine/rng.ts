import { hashSeed } from './constants'

export function initialRng(seed: string): number {
  return hashSeed(seed)
}

export function nextFloat(state: number): [number, number] {
  const t = (state + 0x6d2b79f5) >>> 0
  let x = Math.imul(t ^ (t >>> 15), t | 1)
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, t]
}

export function nextInt(state: number, min: number, maxInclusive: number): [number, number] {
  const [f, s] = nextFloat(state)
  const span = maxInclusive - min + 1
  return [min + Math.floor(f * span), s]
}

export function pickFrom<T>(state: number, items: readonly T[]): [T | undefined, number] {
  if (items.length === 0) return [undefined, state]
  const [idx, s] = nextInt(state, 0, items.length - 1)
  return [items[idx], s]
}
