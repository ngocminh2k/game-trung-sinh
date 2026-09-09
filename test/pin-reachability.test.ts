import { describe, expect, it } from 'vitest'
import { REGION_MAPS } from '../src/content'
import { checkMoveFrom } from '../src/engine/map'
import type { Direction } from '../src/engine/types'

function pathToCell(locationId: string, fromX: number, fromY: number, toX: number, toY: number): Direction[] | null {
  const key = (x: number, y: number): string => `${String(x)},${String(y)}`
  const queue: Array<{ x: number; y: number; path: Direction[] }> = [{ x: fromX, y: fromY, path: [] }]
  const seen = new Set<string>([key(fromX, fromY)])
  while (queue.length > 0) {
    const cur = queue.shift()
    if (cur === undefined) break
    if (cur.x === toX && cur.y === toY) return cur.path
    for (const dir of ['north', 'south', 'east', 'west'] as Direction[]) {
      const step = checkMoveFrom(locationId, cur.x, cur.y, dir)
      if (!step.ok || step.cell === undefined) continue
      const isExit = step.destinationId !== undefined
      const isTarget = step.cell.x === toX && step.cell.y === toY
      if (isExit && !isTarget) continue
      const k = key(step.cell.x, step.cell.y)
      if (seen.has(k)) continue
      seen.add(k)
      queue.push({ x: step.cell.x, y: step.cell.y, path: [...cur.path, dir] })
    }
  }
  return null
}

describe('Full BFS Reachability Audit', () => {
  it('reaches every node from every entry point in its region', () => {
    const isolated: Array<{ region: string; from: [number, number]; node: [number, number]; name: string }> = []
    for (const map of REGION_MAPS) {
      // Collect all entry points (default entry + arrivals from neighbors)
      const entries = [map.entry, ...Object.values(map.arrivals)]
      for (const cell of map.cells) {
        if (!cell.node) continue
        for (const entry of entries) {
          if (cell.x === entry.x && cell.y === entry.y) continue
          if (pathToCell(map.locationId, entry.x, entry.y, cell.x, cell.y) === null) {
            isolated.push({ region: map.locationId, from: [entry.x, entry.y], node: [cell.x, cell.y], name: cell.node.nameVi })
          }
        }
      }
    }
    expect(isolated, `unreachable nodes: ${JSON.stringify(isolated)}`).toEqual([])
  })
})
