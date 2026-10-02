import { exampleGrid } from './pathfinding'
import { createInitialState } from './initial'
import { emptyReflection } from './reflection'
import {
  STORAGE_VERSION,
  type AlgorithmOutcome,
  type AppState,
  type ChatMessage,
  type Checkpoint,
  type ExperimentRecord,
  type Grid,
  type MazeDraft,
  type Recommendation,
  type Reflection,
  type ReflectionDecision,
  type Selection,
  type StageId,
} from './types'

export const STORAGE_KEY = 'lab-explore-map:v1'

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface LoadResult {
  state: AppState
  notice: string | null
}

export function createMemoryStore(initial?: Record<string, string>): KeyValueStore {
  const map = new Map<string, string>(Object.entries(initial ?? {}))
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

export function browserStore(): KeyValueStore | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const probe = '__lab_map_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    return null
  }
}

export function loadAppState(store: KeyValueStore | null = browserStore()): LoadResult {
  if (!store) {
    return {
      state: createInitialState(),
      notice: '이 브라우저 저장소를 사용할 수 없습니다. 새로고침하면 기록이 사라집니다.',
    }
  }
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return { state: createInitialState(), notice: null }
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) {
      return {
        state: createInitialState(),
        notice: '저장된 탐색 기록의 형식이 달라 새 기록으로 시작했습니다.',
      }
    }
    return { state: sanitizeState(parsed), notice: null }
  } catch {
    return {
      state: createInitialState(),
      notice: '저장된 탐색 기록을 읽지 못해 새 기록으로 시작했습니다.',
    }
  }
}

export function saveAppState(state: AppState, store: KeyValueStore | null = browserStore()): boolean {
  if (!store) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }))
    return true
  } catch {
    return false
  }
}

function sanitizeState(value: Record<string, unknown>): AppState {
  const initial = createInitialState()
  const stage = stageOf(value.stage)
  return {
    version: STORAGE_VERSION,
    stage,
    interestField: stringOf(value.interestField),
    coursework: stringOf(value.coursework),
    wantToKnow: stringOf(value.wantToKnow),
    recommendedInterest: stringOf(value.recommendedInterest),
    recommendations: arrayOf(value.recommendations).map(recommendationOf).filter(isPresent),
    selections: arrayOf(value.selections).map(selectionOf).filter(isPresent),
    savedCourseIds: stringArray(value.savedCourseIds),
    exploreStarted: booleanOf(value.exploreStarted),
    exploreConfirmed: booleanOf(value.exploreConfirmed),
    exploreCheckpoint: checkpointOf(value.exploreCheckpoint),
    mazeDraft: mazeOf(value.mazeDraft, initial.mazeDraft),
    experiments: arrayOf(value.experiments).map(experimentOf).filter(isPresent),
    experienceCheckpoint: checkpointOf(value.experienceCheckpoint),
    reflection: reflectionOf(value.reflection),
    prepareSaved: booleanOf(value.prepareSaved),
    prepareCheckpoint: checkpointOf(value.prepareCheckpoint),
    messages: arrayOf(value.messages).map(messageOf).filter(isPresent),
  }
}

function recommendationOf(value: unknown): Recommendation | null {
  if (!isRecord(value) || typeof value.labId !== 'string' || typeof value.reason !== 'string') return null
  return {
    labId: value.labId,
    reason: value.reason,
    matchedTags: stringArray(value.matchedTags),
    matchedOptionalTags: stringArray(value.matchedOptionalTags),
  }
}

function selectionOf(value: unknown): Selection | null {
  if (!isRecord(value) || typeof value.labId !== 'string' || typeof value.reason !== 'string') return null
  return {
    labId: value.labId,
    reason: value.reason,
    interestAtSelection: stringOf(value.interestAtSelection),
  }
}

function checkpointOf(value: unknown): Checkpoint | null {
  if (!isRecord(value) || typeof value.interestField !== 'string' || !Array.isArray(value.labIds)) return null
  return { interestField: value.interestField, labIds: stringArray(value.labIds) }
}

function mazeOf(value: unknown, fallback: MazeDraft): MazeDraft {
  if (!isRecord(value)) return fallback
  const grid = gridOf(value.grid)
  return {
    grid: grid ?? exampleGrid(),
    prediction: stringOf(value.prediction),
    observation: stringOf(value.observation),
    result: pairOf(value.result),
  }
}

function experimentOf(value: unknown): ExperimentRecord | null {
  if (!isRecord(value)) return null
  const grid = gridOf(value.grid)
  const bfs = outcomeOf(value.bfs, 'bfs')
  const astar = outcomeOf(value.astar, 'astar')
  if (!grid || !bfs || !astar || typeof value.id !== 'string' || typeof value.experienceId !== 'string') {
    return null
  }
  return {
    id: value.id,
    experienceId: value.experienceId,
    savedAt: stringOf(value.savedAt),
    interestField: stringOf(value.interestField),
    labIds: stringArray(value.labIds),
    grid,
    prediction: stringOf(value.prediction),
    observation: stringOf(value.observation),
    bfs,
    astar,
  }
}

function pairOf(value: unknown): MazeDraft['result'] {
  if (!isRecord(value)) return null
  const bfs = outcomeOf(value.bfs, 'bfs')
  const astar = outcomeOf(value.astar, 'astar')
  if (!bfs || !astar) return null
  return { bfs, astar }
}

function outcomeOf(value: unknown, algorithm: 'bfs' | 'astar'): AlgorithmOutcome | null {
  if (!isRecord(value) || typeof value.found !== 'boolean') return null
  if (typeof value.exploredCount !== 'number') return null
  const pathLength = value.pathLength === null || typeof value.pathLength === 'number' ? value.pathLength : null
  return {
    algorithm,
    found: value.found,
    path: cellsOf(value.path),
    pathLength: value.found ? pathLength : null,
    explored: cellsOf(value.explored),
    exploredCount: value.exploredCount,
  }
}

function gridOf(value: unknown): Grid | null {
  if (!isRecord(value)) return null
  if (!isPositiveInt(value.rows) || !isPositiveInt(value.cols)) return null
  if (value.rows > 20 || value.cols > 20) return null
  const start = cellOf(value.start)
  const goal = cellOf(value.goal)
  if (!start || !goal || !Array.isArray(value.walls) || !value.walls.every((wall) => typeof wall === 'string')) {
    return null
  }
  return { rows: value.rows, cols: value.cols, walls: value.walls, start, goal }
}

function reflectionOf(value: unknown): Reflection {
  const empty = emptyReflection()
  if (!isRecord(value)) return empty
  const decision = decisionOf(value.decision)
  return {
    interesting: stringOf(value.interesting),
    difficult: stringOf(value.difficult),
    questions: stringOf(value.questions),
    decision,
    labId: stringOf(value.labId),
    labReason: stringOf(value.labReason),
    undecided: stringOf(value.undecided),
    nextActionIds: stringArray(value.nextActionIds),
    nextActionNote: stringOf(value.nextActionNote),
  }
}

function messageOf(value: unknown): ChatMessage | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.text !== 'string' || !value.text.trim()) {
    return null
  }
  const role = value.role === 'assistant' ? 'assistant' : value.role === 'user' ? 'user' : null
  if (!role) return null
  return {
    id: value.id,
    role,
    text: value.text,
    createdAt: stringOf(value.createdAt),
    stage: stageOf(value.stage),
    demo: role === 'assistant',
  }
}

function cellsOf(value: unknown): { r: number; c: number }[] {
  return arrayOf(value).map(cellOf).filter(isPresent)
}

function cellOf(value: unknown): { r: number; c: number } | null {
  if (!isRecord(value) || !Number.isInteger(value.r) || !Number.isInteger(value.c)) return null
  return { r: value.r as number, c: value.c as number }
}

function decisionOf(value: unknown): ReflectionDecision {
  if (value === 'explore-more' || value === 'choose-lab' || value === 'unset') return value
  return 'unset'
}

function stageOf(value: unknown): StageId {
  if (value === 'find' || value === 'explore' || value === 'experience' || value === 'prepare') return value
  return 'find'
}

function stringArray(value: unknown): string[] {
  return arrayOf(value).filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function arrayOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function stringOf(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function booleanOf(value: unknown): boolean {
  return value === true
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}
