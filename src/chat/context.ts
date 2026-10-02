import { stageMeta } from '../content/copy'
import { getExperience } from '../content/experiences'
import type { AppState } from '../domain/types'
import { buildSummaryMarkdown } from '../domain/summary'
import { getCourse } from '../content/courses'
import { getLab } from '../content/labs'
import type { Course, ExperimentRecord, Lab, Recommendation, Reflection, Selection } from '../domain/types'

export interface ChatContext {
  stageTitle: string
  interestField: string
  coursework: string
  wantToKnow: string
  recommendations: Recommendation[]
  selections: Selection[]
  selectedLabs: Lab[]
  savedCourses: Course[]
  professorCourses: Course[]
  relatedCourses: Course[]
  experiments: ExperimentRecord[]
  reflection: Reflection
  summaryMarkdown: string
  experienceQuestion: string
}

export function buildChatContext(state: AppState): ChatContext {
  const selectedLabs = state.selections
    .map((selection) => getLab(selection.labId))
    .filter((lab): lab is Lab => Boolean(lab))
  const courseIds = new Set<string>()
  const professor: Course[] = []
  const related: Course[] = []
  for (const lab of selectedLabs) {
    for (const courseId of lab.professorCourseIds) {
      const course = getCourse(courseId)
      if (course && !courseIds.has(course.id)) {
        courseIds.add(course.id)
        professor.push(course)
      }
    }
    for (const courseId of lab.relatedCourseIds) {
      const course = getCourse(courseId)
      if (course && !courseIds.has(course.id)) {
        courseIds.add(course.id)
        related.push(course)
      }
    }
  }
  const savedCourses = state.savedCourseIds
    .map((id) => getCourse(id))
    .filter((course): course is Course => Boolean(course))
  const ready = getExperience('maze-compare')
  return {
    stageTitle: stageMeta.find((item) => item.id === state.stage)?.title ?? state.stage,
    interestField: state.interestField.trim(),
    coursework: state.coursework.trim(),
    wantToKnow: state.wantToKnow.trim(),
    recommendations: state.recommendations,
    selections: state.selections,
    selectedLabs,
    savedCourses,
    professorCourses: professor,
    relatedCourses: related,
    experiments: state.experiments,
    reflection: state.reflection,
    summaryMarkdown: buildSummaryMarkdown(state),
    experienceQuestion: ready?.question ?? '',
  }
}
