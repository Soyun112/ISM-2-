import type { Cell, Grid } from '../domain/types'
import { isWall, keyOf, sameCell } from '../domain/pathfinding'

interface GridViewProps {
  grid: Grid
  explored?: Cell[]
  path?: Cell[]
  onToggle?: (cell: Cell) => void
  label: string
}

export function GridView({ grid, explored = [], path = [], onToggle, label }: GridViewProps) {
  const exploredKeys = new Set(explored.map(keyOf))
  const pathKeys = new Set(path.map(keyOf))
  return (
    <div
      className="maze"
      style={{ gridTemplateColumns: `repeat(${grid.cols}, 2rem)` }}
      role={onToggle ? 'group' : undefined}
      aria-label={label}
      aria-hidden={onToggle ? undefined : true}
    >
      {Array.from({ length: grid.rows }, (_, r) =>
        Array.from({ length: grid.cols }, (_, c) => {
          const cell = { r, c }
          const key = keyOf(cell)
          const start = sameCell(cell, grid.start)
          const goal = sameCell(cell, grid.goal)
          const wall = isWall(grid, cell)
          const onPath = pathKeys.has(key)
          const seen = exploredKeys.has(key)
          const className = [
            'cell',
            start ? 'start' : '',
            goal ? 'goal' : '',
            wall ? 'wall' : '',
            onPath ? 'path' : '',
            seen && !onPath ? 'explored' : '',
          ]
            .filter(Boolean)
            .join(' ')
          const name = start
            ? `${r + 1}행 ${c + 1}열 출발`
            : goal
              ? `${r + 1}행 ${c + 1}열 도착`
              : wall
                ? `${r + 1}행 ${c + 1}열 장애물`
                : `${r + 1}행 ${c + 1}열 빈 칸`
          const mark = start ? '출' : goal ? '도' : ''
          if (!onToggle) {
            return (
              <div key={key} className={className}>
                {mark}
              </div>
            )
          }
          return (
            <button
              key={key}
              type="button"
              className={className}
              aria-label={name}
              aria-pressed={wall}
              disabled={start || goal}
              onClick={() => onToggle(cell)}
            >
              {mark}
            </button>
          )
        }),
      )}
    </div>
  )
}

export function formatPath(path: Cell[]): string {
  if (path.length === 0) return '경로 없음'
  return path.map((cell) => `(${cell.r + 1},${cell.c + 1})`).join(' → ')
}
