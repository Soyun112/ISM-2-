export const STORAGE_VERSION = 1

export type StageId = 'find' | 'explore' | 'experience' | 'prepare'

export type StageStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review'

export type CourseKind = 'professor' | 'related'

export type CourseTerm = 'current' | 'past' | 'unknown'

export type ReflectionDecision = 'unset' | 'explore-more' | 'choose-lab'

export interface Cell {
  r: number
  c: number
}

export interface Grid {
  rows: number
  cols: number
  walls: string[]
  start: Cell
  goal: Cell
}

export interface AlgorithmOutcome {
  algorithm: 'bfs' | 'astar'
  found: boolean
  path: Cell[]
  pathLength: number | null
  explored: Cell[]
  exploredCount: number
}

export interface Lab {
  id: string
  name: string
  professor: string
  fields: string[]
  tags: string[]
  summary: string
  problem: string
  methods: string[]
  projects: { id: string; title: string; summary: string }[]
  differenceNote: string
  experienceId: string | null
  professorCourseIds: string[]
  relatedCourseIds: string[]
  sourceLabel: string
  verifiedAt: string
}

export interface Course {
  id: string
  title: string
  kind: CourseKind
  labId: string | null
  term: CourseTerm
  termLabel: string
  learnings: string
  researchConnection: string
  connectionAssumed: boolean
}

export interface ExperienceMeta {
  id: string
  title: string
  question: string
  availability: 'ready' | 'preparing'
  summary: string
}

export interface Recommendation {
  labId: string
  reason: string
  matchedTags: string[]
  matchedOptionalTags: string[]
}

export interface Selection {
  labId: string
  reason: string
  interestAtSelection: string
}

export interface Checkpoint {
  interestField: string
  labIds: string[]
}

export interface MazeDraft {
  grid: Grid
  prediction: string
  observation: string
  result: {
    bfs: AlgorithmOutcome
    astar: AlgorithmOutcome
  } | null
}

export interface ExperimentRecord {
  id: string
  experienceId: string
  savedAt: string
  interestField: string
  labIds: string[]
  grid: Grid
  prediction: string
  observation: string
  bfs: AlgorithmOutcome
  astar: AlgorithmOutcome
}

export interface Reflection {
  interesting: string
  difficult: string
  questions: string
  decision: ReflectionDecision
  labId: string
  labReason: string
  undecided: string
  nextActionIds: string[]
  nextActionNote: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  stage: StageId
  demo: boolean
}

export interface AppState {
  version: number
  stage: StageId
  interestField: string
  coursework: string
  wantToKnow: string
  recommendedInterest: string
  recommendations: Recommendation[]
  selections: Selection[]
  savedCourseIds: string[]
  exploreStarted: boolean
  exploreConfirmed: boolean
  exploreCheckpoint: Checkpoint | null
  mazeDraft: MazeDraft
  experiments: ExperimentRecord[]
  experienceCheckpoint: Checkpoint | null
  reflection: Reflection
  prepareSaved: boolean
  prepareCheckpoint: Checkpoint | null
  messages: ChatMessage[]
}
