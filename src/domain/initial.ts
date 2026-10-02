import { exampleGrid } from './pathfinding'
import { emptyReflection } from './reflection'
import { STORAGE_VERSION, type AppState } from './types'

export function createInitialState(): AppState {
  return {
    version: STORAGE_VERSION,
    stage: 'find',
    interestField: '',
    coursework: '',
    wantToKnow: '',
    recommendedInterest: '',
    recommendations: [],
    selections: [],
    savedCourseIds: [],
    exploreStarted: false,
    exploreConfirmed: false,
    exploreCheckpoint: null,
    mazeDraft: {
      grid: exampleGrid(),
      prediction: '',
      observation: '',
      result: null,
    },
    experiments: [],
    experienceCheckpoint: null,
    reflection: emptyReflection(),
    prepareSaved: false,
    prepareCheckpoint: null,
    messages: [],
  }
}
