import { isCheckpointStale } from './checkpoint'
import { reflectionHasContent } from './reflection'
import type { AppState, StageId, StageStatus } from './types'

export function getStageStatus(stage: StageId, state: AppState): StageStatus {
  switch (stage) {
    case 'find':
      return findStatus(state)
    case 'explore':
      return exploreStatus(state)
    case 'experience':
      return experienceStatus(state)
    case 'prepare':
      return prepareStatus(state)
  }
}

export function stageSummary(stage: StageId, state: AppState): string {
  switch (stage) {
    case 'find':
      if (state.selections.length > 0) return `관심 후보 ${state.selections.length}곳`
      if (state.recommendations.length > 0) return `추천 후보 ${state.recommendations.length}곳`
      if (state.interestField.trim()) return '관심 분야를 적는 중'
      return '관심 분야 입력 전'
    case 'explore':
      if (state.savedCourseIds.length > 0) return `관심 과목 ${state.savedCourseIds.length}개`
      if (state.exploreConfirmed) return '비교를 기록함'
      if (state.exploreStarted) return '비교하는 중'
      return '비교 전'
    case 'experience':
      if (state.experiments.length > 0) return `저장한 실험 ${state.experiments.length}회`
      if (experienceDraftActive(state)) return '실험 기록을 작성 중'
      return '실험 전'
    case 'prepare':
      if (state.prepareSaved && state.reflection.decision === 'explore-more') return '더 탐색하기로 기록함'
      if (state.prepareSaved && state.reflection.decision === 'choose-lab') return '관심 연구실을 메모함'
      if (state.prepareSaved) return '준비 계획을 저장함'
      if (reflectionHasContent(state.reflection)) return '정리를 작성 중'
      return '정리 전'
  }
}

function findStatus(state: AppState): StageStatus {
  if (state.selections.length === 0) {
    const typed = Boolean(
      state.interestField.trim() ||
        state.coursework.trim() ||
        state.wantToKnow.trim() ||
        state.recommendations.length > 0,
    )
    return typed ? 'in_progress' : 'not_started'
  }
  const interest = state.interestField.trim()
  const stale = state.selections.some((item) => item.interestAtSelection !== interest)
  return stale ? 'needs_review' : 'completed'
}

function exploreStatus(state: AppState): StageStatus {
  const active = state.exploreStarted || state.exploreConfirmed || state.savedCourseIds.length > 0
  if (!active) return 'not_started'
  if (isCheckpointStale(state.exploreCheckpoint, state)) return 'needs_review'
  return state.exploreConfirmed ? 'completed' : 'in_progress'
}

function experienceStatus(state: AppState): StageStatus {
  if (state.experiments.length === 0 && !experienceDraftActive(state)) return 'not_started'
  if (state.experiments.length > 0 && isCheckpointStale(state.experienceCheckpoint, state)) {
    return 'needs_review'
  }
  return state.experiments.length > 0 ? 'completed' : 'in_progress'
}

function prepareStatus(state: AppState): StageStatus {
  if (!state.prepareSaved && !reflectionHasContent(state.reflection)) return 'not_started'
  if (state.prepareSaved && isCheckpointStale(state.prepareCheckpoint, state)) return 'needs_review'
  return state.prepareSaved ? 'completed' : 'in_progress'
}

function experienceDraftActive(state: AppState): boolean {
  return Boolean(
    state.mazeDraft.prediction.trim() ||
      state.mazeDraft.observation.trim() ||
      state.mazeDraft.result,
  )
}
