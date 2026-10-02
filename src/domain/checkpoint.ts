import type { AppState, Checkpoint } from './types'

export function labIdsOf(state: AppState): string[] {
  return state.selections.map((item) => item.labId)
}

export function makeCheckpoint(state: AppState): Checkpoint {
  return {
    interestField: state.interestField.trim(),
    labIds: labIdsOf(state),
  }
}

export function sameLabIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false
  const a = [...left].sort()
  const b = [...right].sort()
  return a.every((id, index) => id === b[index])
}

export function isCheckpointStale(checkpoint: Checkpoint | null, state: AppState): boolean {
  if (!checkpoint) return false
  return (
    checkpoint.interestField !== state.interestField.trim() ||
    !sameLabIds(checkpoint.labIds, labIdsOf(state))
  )
}
