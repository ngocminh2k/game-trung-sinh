import { entryPositionFor, getRegionMap, isPassable, regionCellAt } from '../content'
import type { RegionCellDef } from './content-types'
import type { Direction } from './types'

const DELTAS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
}

export function targetCell(locationId: string, x: number, y: number, dir: Direction): RegionCellDef | undefined {
  const d = DELTAS[dir]
  return regionCellAt(locationId, x + d.dx, y + d.dy)
}

export interface MoveCheck {
  ok: boolean
  reason: 'out_of_bounds' | 'blocked' | undefined
  cell: RegionCellDef | undefined
  /** Present only when the target is a real exit to another local map. */
  destinationId: string | undefined
}

/** Checks movement inside the current local map; global overview coordinates
 * deliberately have no authority over walking anymore. */
export function checkMoveFrom(locationId: string, x: number, y: number, dir: Direction): MoveCheck {
  const cell = targetCell(locationId, x, y, dir)
  if (cell === undefined) return { ok: false, reason: 'out_of_bounds', cell: undefined, destinationId: undefined }
  if (!isPassable(cell)) return { ok: false, reason: 'blocked', cell, destinationId: undefined }
  if (cell.exitTo !== undefined && getRegionMap(cell.exitTo) === undefined) {
    return { ok: false, reason: 'blocked', cell, destinationId: undefined }
  }
  return { ok: true, reason: undefined, cell, destinationId: cell.exitTo }
}

export function playerPosition(locationId: string): { x: number; y: number } {
  return entryPositionFor(locationId)
}

const keyOf = (locationId: string, x: number, y: number): string => `${locationId}:${x},${y}`

interface SearchNode {
  locationId: string
  x: number
  y: number
}

/**
 * Breadth-first route finder over every authored local map and its exits.
 * `fromLocationId` is optional only for backwards-compatible test helpers;
 * production movement always supplies the current region.
 */
export function findPath(
  fromX: number,
  fromY: number,
  toLocationId: string,
  fromLocationId = 'village',
): Direction[] | null {
  const start: SearchNode = { locationId: fromLocationId, x: fromX, y: fromY }
  if (getRegionMap(start.locationId) === undefined || regionCellAt(start.locationId, start.x, start.y) === undefined) return null
  const startKey = keyOf(start.locationId, start.x, start.y)
  const prev = new Map<string, { previous: SearchNode; dir: Direction }>()
  const queue: SearchNode[] = [start]
  const seen = new Set<string>([startKey])
  let goal: SearchNode | undefined

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined) break
    if (current.locationId === toLocationId) {
      goal = current
      break
    }
    for (const dir of Object.keys(DELTAS) as Direction[]) {
      const move = checkMoveFrom(current.locationId, current.x, current.y, dir)
      if (!move.ok || move.cell === undefined) continue
      const next = move.destinationId === undefined
        ? { locationId: current.locationId, x: move.cell.x, y: move.cell.y }
        : { locationId: move.destinationId, ...entryPositionFor(move.destinationId, current.locationId) }
      const nextKey = keyOf(next.locationId, next.x, next.y)
      if (seen.has(nextKey)) continue
      seen.add(nextKey)
      prev.set(nextKey, { previous: current, dir })
      queue.push(next)
    }
  }

  if (goal === undefined) return null
  const path: Direction[] = []
  let cursor = goal
  while (keyOf(cursor.locationId, cursor.x, cursor.y) !== startKey) {
    const step = prev.get(keyOf(cursor.locationId, cursor.x, cursor.y))
    if (step === undefined) return null
    path.unshift(step.dir)
    cursor = step.previous
  }
  return path
}
