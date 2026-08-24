import { CELLS, cellAt, isPassable } from '../content'
import type { CellDef } from './content-types'
import type { Direction } from './types'

const DELTAS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
}

export function targetCell(x: number, y: number, dir: Direction): CellDef | undefined {
  const d = DELTAS[dir]
  return cellAt(x + d.dx, y + d.dy)
}

export interface MoveCheck {
  ok: boolean
  reason: 'out_of_bounds' | 'blocked' | undefined
  cell: CellDef | undefined
}

export function checkMoveFrom(x: number, y: number, dir: Direction): MoveCheck {
  const cell = targetCell(x, y, dir)
  if (cell === undefined) return { ok: false, reason: 'out_of_bounds', cell: undefined }
  if (!isPassable(cell)) return { ok: false, reason: 'blocked', cell }
  return { ok: true, reason: undefined, cell }
}

export function playerPosition(locationId: string): { x: number; y: number } {
  for (const c of CELLS) {
    if (c.locationId === locationId) return { x: c.x, y: c.y }
  }
  return { x: 3, y: 3 }
}

const keyOf = (x: number, y: number): string => `${x},${y}`

export function findPath(
  fromX: number,
  fromY: number,
  toLocationId: string,
): Direction[] | null {
  const startKey = keyOf(fromX, fromY)
  const prev = new Map<string, { x: number; y: number; dir: Direction }>()
  const queue: Array<{ x: number; y: number }> = [{ x: fromX, y: fromY }]
  const seen = new Set<string>([startKey])
  let goal: { x: number; y: number } | undefined
  while (queue.length > 0) {
    const cur = queue.shift()
    if (cur === undefined) break
    const here = cellAt(cur.x, cur.y)
    if (here?.locationId === toLocationId) {
      goal = cur
      break
    }
    for (const dir of Object.keys(DELTAS) as Direction[]) {
      const next = targetCell(cur.x, cur.y, dir)
      if (next === undefined || !isPassable(next)) continue
      const k = keyOf(next.x, next.y)
      if (seen.has(k)) continue
      seen.add(k)
      prev.set(k, { x: cur.x, y: cur.y, dir })
      queue.push({ x: next.x, y: next.y })
    }
  }
  if (goal === undefined) return null
  const path: Direction[] = []
  let cursor = goal
  while (keyOf(cursor.x, cursor.y) !== startKey) {
    const step = prev.get(keyOf(cursor.x, cursor.y))
    if (step === undefined) return null
    path.unshift(step.dir)
    cursor = { x: step.x, y: step.y }
  }
  return path
}
