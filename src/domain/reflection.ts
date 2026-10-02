import type { Reflection } from './types'

export function emptyReflection(): Reflection {
  return {
    interesting: '',
    difficult: '',
    questions: '',
    decision: 'unset',
    labId: '',
    labReason: '',
    undecided: '',
    nextActionIds: [],
    nextActionNote: '',
  }
}

export function reflectionHasContent(reflection: Reflection): boolean {
  return Boolean(
    reflection.interesting.trim() ||
      reflection.difficult.trim() ||
      reflection.questions.trim() ||
      reflection.labReason.trim() ||
      reflection.undecided.trim() ||
      reflection.nextActionNote.trim() ||
      reflection.nextActionIds.length > 0 ||
      reflection.decision !== 'unset',
  )
}
