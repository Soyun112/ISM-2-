import type { AlgorithmOutcome, Cell, Grid } from './types'

/**
 * 탐색한 칸: 대기열에서 꺼내 이웃을 확인한 칸.
 * 시작 칸을 포함하고, 목적지를 꺼낸 경우에만 목적지를 포함한다.
 * 대기열에만 들어 있고 아직 꺼내지 않은 칸은 세지 않는다.
 * BFS와 A*에 같은 기준을 쓴다.
 *
 * 경로 길이: 시작부터 목적지까지의 이동 횟수.
 * 이동은 상하좌우만 가능하고 한 칸 비용은 1이다.
 * A* 휴리스틱은 맨해튼 거리다.
 */

const DIRS: Cell[] = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]

export function keyOf(cell: Cell): string {
  return `${cell.r},${cell.c}`
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.r === b.r && a.c === b.c
}

export function inBounds(grid: Grid, cell: Cell): boolean {
  return cell.r >= 0 && cell.c >= 0 && cell.r < grid.rows && cell.c < grid.cols
}

export function isWall(grid: Grid, cell: Cell): boolean {
  if (sameCell(cell, grid.start) || sameCell(cell, grid.goal)) return false
  return grid.walls.includes(keyOf(cell))
}

export function createGrid(rows: number, cols: number, walls: Cell[], start: Cell, goal: Cell): Grid {
  const gridStart = { r: start.r, c: start.c }
  const gridGoal = { r: goal.r, c: goal.c }
  const keys = new Set<string>()
  for (const wall of walls) {
    if (wall.r < 0 || wall.c < 0 || wall.r >= rows || wall.c >= cols) continue
    if (sameCell(wall, gridStart) || sameCell(wall, gridGoal)) continue
    keys.add(keyOf(wall))
  }
  return {
    rows,
    cols,
    walls: [...keys],
    start: gridStart,
    goal: gridGoal,
  }
}

export function emptyGrid(): Grid {
  return createGrid(8, 8, [], { r: 0, c: 0 }, { r: 7, c: 7 })
}

export function exampleGrid(): Grid {
  const walls: Cell[] = [
    { r: 1, c: 2 },
    { r: 1, c: 3 },
    { r: 1, c: 4 },
    { r: 3, c: 1 },
    { r: 3, c: 2 },
    { r: 3, c: 3 },
    { r: 4, c: 5 },
    { r: 5, c: 5 },
    { r: 6, c: 2 },
    { r: 6, c: 3 },
    { r: 6, c: 5 },
  ]
  return createGrid(8, 8, walls, { r: 0, c: 0 }, { r: 7, c: 7 })
}

export function blockedGrid(): Grid {
  const walls: Cell[] = []
  for (let c = 0; c < 8; c += 1) walls.push({ r: 3, c })
  return createGrid(8, 8, walls, { r: 0, c: 0 }, { r: 7, c: 7 })
}

export function toggleWall(grid: Grid, cell: Cell): Grid {
  if (!inBounds(grid, cell)) return grid
  if (sameCell(cell, grid.start) || sameCell(cell, grid.goal)) return grid
  const key = keyOf(cell)
  const walls = grid.walls.includes(key)
    ? grid.walls.filter((item) => item !== key)
    : [...grid.walls, key]
  return { ...grid, walls }
}

export function gridToAscii(grid: Grid): string {
  const lines: string[] = []
  for (let r = 0; r < grid.rows; r += 1) {
    let line = ''
    for (let c = 0; c < grid.cols; c += 1) {
      const cell = { r, c }
      if (sameCell(cell, grid.start)) line += 'S'
      else if (sameCell(cell, grid.goal)) line += 'G'
      else if (isWall(grid, cell)) line += '#'
      else line += '.'
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export function runBfs(grid: Grid): AlgorithmOutcome {
  return toOutcome('bfs', grid, search(grid, 'bfs'))
}

export function runAstar(grid: Grid): AlgorithmOutcome {
  return toOutcome('astar', grid, search(grid, 'astar'))
}

export function compareOnSameGrid(grid: Grid): { bfs: AlgorithmOutcome; astar: AlgorithmOutcome } {
  return { bfs: runBfs(grid), astar: runAstar(grid) }
}

interface SearchCore {
  found: boolean
  explored: Cell[]
  parent: Map<string, string>
}

function search(grid: Grid, algorithm: 'bfs' | 'astar'): SearchCore {
  const walls = wallSet(grid)
  const startKey = keyOf(grid.start)
  const goalKey = keyOf(grid.goal)
  const parent = new Map<string, string>()
  const explored: Cell[] = []

  if (algorithm === 'bfs') {
    const queue: Cell[] = [grid.start]
    const visited = new Set<string>([startKey])
    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) break
      explored.push(current)
      if (keyOf(current) === goalKey) return { found: true, explored, parent }
      for (const next of neighbors(grid, current, walls)) {
        const nextKey = keyOf(next)
        if (visited.has(nextKey)) continue
        visited.add(nextKey)
        parent.set(nextKey, keyOf(current))
        queue.push(next)
      }
    }
    return { found: false, explored, parent }
  }

  const gScore = new Map<string, number>([[startKey, 0]])
  const expanded = new Set<string>()
  let seq = 0
  const open: { key: string; f: number; h: number; seq: number }[] = [
    {
      key: startKey,
      f: manhattan(grid.start, grid.goal),
      h: manhattan(grid.start, grid.goal),
      seq: seq++,
    },
  ]

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f || a.h - b.h || a.seq - b.seq)
    const current = open.shift()
    if (!current || expanded.has(current.key)) continue
    expanded.add(current.key)
    const cell = parseKey(current.key)
    explored.push(cell)
    if (current.key === goalKey) return { found: true, explored, parent }
    for (const next of neighbors(grid, cell, walls)) {
      const nextKey = keyOf(next)
      if (expanded.has(nextKey)) continue
      const tentative = (gScore.get(current.key) ?? Number.POSITIVE_INFINITY) + 1
      if (tentative < (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
        gScore.set(nextKey, tentative)
        parent.set(nextKey, current.key)
        const h = manhattan(next, grid.goal)
        open.push({ key: nextKey, f: tentative + h, h, seq: seq++ })
      }
    }
  }

  return { found: false, explored, parent }
}

function toOutcome(algorithm: 'bfs' | 'astar', grid: Grid, core: SearchCore): AlgorithmOutcome {
  const base = {
    algorithm,
    explored: core.explored,
    exploredCount: core.explored.length,
  }
  if (!core.found) {
    return { ...base, found: false, path: [], pathLength: null }
  }
  const path = reconstruct(core.parent, grid.goal, grid.start)
  if (path.length === 0) {
    return { ...base, found: false, path: [], pathLength: null }
  }
  return { ...base, found: true, path, pathLength: path.length - 1 }
}

function reconstruct(parent: Map<string, string>, goal: Cell, start: Cell): Cell[] {
  if (sameCell(goal, start)) return [{ r: start.r, c: start.c }]
  const path: Cell[] = []
  let current: string | undefined = keyOf(goal)
  const seen = new Set<string>()
  while (current) {
    if (seen.has(current)) return []
    seen.add(current)
    path.push(parseKey(current))
    if (current === keyOf(start)) {
      path.reverse()
      return path
    }
    current = parent.get(current)
  }
  return []
}

function neighbors(grid: Grid, cell: Cell, walls: Set<string>): Cell[] {
  const list: Cell[] = []
  for (const dir of DIRS) {
    const next = { r: cell.r + dir.r, c: cell.c + dir.c }
    if (!inBounds(grid, next)) continue
    if (walls.has(keyOf(next))) continue
    list.push(next)
  }
  return list
}

function wallSet(grid: Grid): Set<string> {
  const set = new Set(grid.walls)
  set.delete(keyOf(grid.start))
  set.delete(keyOf(grid.goal))
  return set
}

function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c)
}

function parseKey(key: string): Cell {
  const [r, c] = key.split(',').map(Number)
  return { r, c }
}
