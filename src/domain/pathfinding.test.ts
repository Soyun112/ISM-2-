import { describe, expect, it } from 'vitest'
import {
  blockedGrid,
  createGrid,
  exampleGrid,
  isWall,
  runAstar,
  runBfs,
  toggleWall,
} from './pathfinding'
import type { Cell } from './types'

describe('pathfinding', () => {
  it('counts only dequeued cells and reports move length on a 2x2 map', () => {
    const grid = createGrid(2, 2, [], { r: 0, c: 0 }, { r: 1, c: 1 })
    const bfs = runBfs(grid)
    const astar = runAstar(grid)

    expect(bfs.found).toBe(true)
    expect(astar.found).toBe(true)
    expect(bfs.pathLength).toBe(2)
    expect(astar.pathLength).toBe(2)
    expect(bfs.exploredCount).toBe(bfs.explored.length)
    expect(astar.exploredCount).toBe(astar.explored.length)
    expect(bfs.explored[0]).toEqual({ r: 0, c: 0 })
    expect(astar.explored[0]).toEqual({ r: 0, c: 0 })
    expect(bfs.explored.at(-1)).toEqual({ r: 1, c: 1 })
    expect(astar.explored.at(-1)).toEqual({ r: 1, c: 1 })
    // BFS는 먼저 넣은 (0,1)을 목적지보다 먼저 꺼내므로 그 칸도 센다.
    // A*는 휴리스틱 때문에 목적지를 먼저 꺼내 (0,1)을 대기열에 남긴다.
    expect(bfs.exploredCount).toBe(4)
    expect(containsCell(bfs.explored, { r: 0, c: 1 })).toBe(true)
    expect(astar.exploredCount).toBe(3)
    expect(containsCell(astar.explored, { r: 0, c: 1 })).toBe(false)
    expect(uniqueCount(bfs.explored)).toBe(bfs.explored.length)
    expect(uniqueCount(astar.explored)).toBe(astar.explored.length)
  })

  it('returns the same shortest move count for BFS and A* when obstacles remain passable', () => {
    const grid = createGrid(3, 3, [{ r: 0, c: 2 }, { r: 1, c: 1 }], { r: 0, c: 0 }, { r: 2, c: 2 })
    const bfs = runBfs(grid)
    const astar = runAstar(grid)
    expect(bfs.pathLength).toBe(4)
    expect(astar.pathLength).toBe(bfs.pathLength)
    expect(exampleGrid().walls.length).toBeGreaterThan(0)
    const sampleBfs = runBfs(exampleGrid())
    const sampleAstar = runAstar(exampleGrid())
    expect(sampleBfs.found).toBe(true)
    expect(sampleAstar.found).toBe(true)
    expect(sampleAstar.pathLength).toBe(sampleBfs.pathLength)
    for (const cell of [...sampleBfs.explored, ...sampleAstar.explored]) {
      expect(isWall(exampleGrid(), cell)).toBe(false)
    }
  })

  it('explores fewer cells with A* than BFS on an open map and keeps the Manhattan length', () => {
    const grid = createGrid(6, 6, [], { r: 0, c: 0 }, { r: 5, c: 5 })
    const bfs = runBfs(grid)
    const astar = runAstar(grid)
    expect(bfs.pathLength).toBe(10)
    expect(astar.pathLength).toBe(10)
    expect(astar.exploredCount).toBeLessThan(bfs.exploredCount)
    expect(astar.explored.at(-1)).toEqual(grid.goal)
  })

  it('reports no path without inventing a length', () => {
    const grid = createGrid(
      3,
      3,
      [
        { r: 1, c: 0 },
        { r: 1, c: 1 },
        { r: 1, c: 2 },
      ],
      { r: 0, c: 0 },
      { r: 2, c: 2 },
    )
    const bfs = runBfs(grid)
    const astar = runAstar(grid)
    const blocked = runBfs(blockedGrid())
    expect(bfs.found).toBe(false)
    expect(astar.found).toBe(false)
    expect(bfs.pathLength).toBeNull()
    expect(astar.pathLength).toBeNull()
    expect(bfs.path).toEqual([])
    expect(astar.path).toEqual([])
    expect(bfs.exploredCount).toBeGreaterThan(0)
    expect(containsCell(bfs.explored, grid.goal)).toBe(false)
    expect(containsCell(astar.explored, grid.goal)).toBe(false)
    expect(blocked.found).toBe(false)
    expect(runAstar(blockedGrid()).found).toBe(false)
  })

  it('does not place a wall on the start and ignores a wall written onto the start', () => {
    const grid = createGrid(3, 3, [{ r: 0, c: 0 }, { r: 1, c: 1 }], { r: 0, c: 0 }, { r: 2, c: 2 })
    expect(grid.walls).not.toContain('0,0')
    const unchanged = toggleWall(grid, grid.start)
    expect(unchanged).toBe(grid)
    const changed = toggleWall(grid, { r: 0, c: 1 })
    expect(changed).not.toBe(grid)
    expect(changed.walls).toContain('0,1')
  })
})

function containsCell(cells: Cell[], target: Cell): boolean {
  return cells.some((cell) => cell.r === target.r && cell.c === target.c)
}

function uniqueCount(cells: Cell[]): number {
  return new Set(cells.map((cell) => `${cell.r},${cell.c}`)).size
}
