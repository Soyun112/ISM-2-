import { makeCheckpoint } from './checkpoint'
import { cloneData } from './clone'
import { createId } from './id'
import { createInitialState } from './initial'
import { compareOnSameGrid } from './pathfinding'
import { reflectionHasContent } from './reflection'
import type {
  AppState,
  ChatMessage,
  ExperimentRecord,
  Grid,
  Recommendation,
  Reflection,
  StageId,
} from './types'

export type Action =
  | { type: 'set-interest'; value: string }
  | { type: 'set-coursework'; value: string }
  | { type: 'set-want'; value: string }
  | { type: 'recommend'; recommendations: Recommendation[] }
  | { type: 'toggle-lab'; labId: string; reason: string }
  | { type: 'toggle-course'; courseId: string }
  | { type: 'start-explore' }
  | { type: 'confirm-explore' }
  | { type: 'ack-stage'; stage: StageId }
  | { type: 'set-maze-grid'; grid: Grid }
  | { type: 'set-maze-notes'; prediction?: string; observation?: string }
  | { type: 'set-maze-result'; result: AppState['mazeDraft']['result'] }
  | { type: 'save-maze' }
  | { type: 'patch-reflection'; patch: Partial<Reflection> }
  | { type: 'save-reflection' }
  | { type: 'goto'; stage: StageId }
  | { type: 'append-chat'; messages: ChatMessage[] }
  | { type: 'reset' }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set-interest':
      return { ...state, interestField: action.value }
    case 'set-coursework':
      return { ...state, coursework: action.value }
    case 'set-want':
      return { ...state, wantToKnow: action.value }
    case 'recommend':
      return applyRecommendations(state, action.recommendations)
    case 'toggle-lab':
      return toggleLab(state, action.labId, action.reason)
    case 'toggle-course':
      return toggleCourse(state, action.courseId)
    case 'start-explore':
      if (state.exploreStarted) return state
      return {
        ...state,
        exploreStarted: true,
        exploreCheckpoint: state.exploreCheckpoint ?? makeCheckpoint(state),
      }
    case 'confirm-explore':
      if (state.selections.length === 0) return state
      return {
        ...state,
        exploreStarted: true,
        exploreConfirmed: true,
        exploreCheckpoint: makeCheckpoint(state),
      }
    case 'ack-stage':
      return acknowledge(state, action.stage)
    case 'set-maze-grid':
      return { ...state, mazeDraft: { ...state.mazeDraft, grid: action.grid, result: null } }
    case 'set-maze-notes':
      return {
        ...state,
        mazeDraft: {
          ...state.mazeDraft,
          prediction: action.prediction ?? state.mazeDraft.prediction,
          observation: action.observation ?? state.mazeDraft.observation,
        },
      }
    case 'set-maze-result':
      return { ...state, mazeDraft: { ...state.mazeDraft, result: action.result } }
    case 'save-maze':
      return saveMaze(state)
    case 'patch-reflection':
      return { ...state, reflection: { ...state.reflection, ...action.patch } }
    case 'save-reflection':
      if (!reflectionHasContent(state.reflection)) return state
      return {
        ...state,
        prepareSaved: true,
        prepareCheckpoint: makeCheckpoint(state),
      }
    case 'goto':
      return { ...state, stage: action.stage }
    case 'append-chat':
      return { ...state, messages: [...state.messages, ...action.messages] }
    case 'reset':
      return createInitialState()
    default:
      return state
  }
}

function applyRecommendations(state: AppState, recommendations: Recommendation[]): AppState {
  const interest = state.interestField.trim()
  if (!interest) return state
  const selections = state.selections.map((selection) => {
    const found = recommendations.find((item) => item.labId === selection.labId)
    if (!found) return selection
    return { ...selection, reason: found.reason, interestAtSelection: interest }
  })
  return {
    ...state,
    recommendations,
    recommendedInterest: interest,
    selections,
  }
}

function toggleLab(state: AppState, labId: string, reason: string): AppState {
  const exists = state.selections.some((item) => item.labId === labId)
  const selections = exists
    ? state.selections.filter((item) => item.labId !== labId)
    : [
        ...state.selections,
        { labId, reason, interestAtSelection: state.interestField.trim() },
      ]
  return { ...state, selections }
}

function toggleCourse(state: AppState, courseId: string): AppState {
  const exists = state.savedCourseIds.includes(courseId)
  const savedCourseIds = exists
    ? state.savedCourseIds.filter((id) => id !== courseId)
    : [...state.savedCourseIds, courseId]
  return {
    ...state,
    savedCourseIds,
    exploreStarted: true,
    exploreCheckpoint: state.exploreCheckpoint ?? makeCheckpoint(state),
  }
}

function acknowledge(state: AppState, stage: StageId): AppState {
  if (stage === 'explore' && (state.exploreStarted || state.savedCourseIds.length > 0)) {
    return { ...state, exploreCheckpoint: makeCheckpoint(state) }
  }
  if (stage === 'experience' && state.experiments.length > 0) {
    return { ...state, experienceCheckpoint: makeCheckpoint(state) }
  }
  if (stage === 'prepare' && state.prepareSaved) {
    return { ...state, prepareCheckpoint: makeCheckpoint(state) }
  }
  return state
}

function saveMaze(state: AppState): AppState {
  if (!state.mazeDraft.result) return state
  const outcome = compareOnSameGrid(state.mazeDraft.grid)
  const record: ExperimentRecord = {
    id: createId('exp'),
    experienceId: 'maze-compare',
    savedAt: new Date().toISOString(),
    interestField: state.interestField.trim(),
    labIds: state.selections.map((item) => item.labId),
    grid: cloneData(state.mazeDraft.grid),
    prediction: state.mazeDraft.prediction,
    observation: state.mazeDraft.observation,
    bfs: outcome.bfs,
    astar: outcome.astar,
  }
  return {
    ...state,
    mazeDraft: { ...state.mazeDraft, result: outcome },
    experiments: [...state.experiments, record],
    experienceCheckpoint: makeCheckpoint(state),
  }
}
