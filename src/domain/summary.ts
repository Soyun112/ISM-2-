import { getCourse } from '../content/courses'
import { getLab } from '../content/labs'
import { copy, nextActions } from '../content/copy'
import { gridToAscii } from './pathfinding'
import type { AlgorithmOutcome, AppState, ExperimentRecord } from './types'

export function buildSummaryMarkdown(state: AppState): string {
  const lines: string[] = [
    `# ${copy.serviceName} 요약`,
    '',
    '시연용 데모에서 정리한 내용입니다. 짧은 체험 결과로 적성이나 연구 능력을 판정하지 않습니다.',
    '',
    '## 관심',
    '',
    `- 관심 분야: ${textOrEmpty(state.interestField)}`,
    `- 수강 경험: ${textOrEmpty(state.coursework)}`,
    `- 더 알고 싶은 내용: ${textOrEmpty(state.wantToKnow)}`,
    '',
    '## 관심 연구실',
    '',
  ]

  if (state.selections.length === 0) {
    lines.push('선택한 연구실이 없습니다.', '')
  } else {
    for (const selection of state.selections) {
      const lab = getLab(selection.labId)
      lines.push(`### ${lab?.name ?? selection.labId}`, '')
      lines.push(`- 교수: ${lab ? `${lab.professor} (가상 인물)` : '자료를 찾을 수 없음'}`)
      lines.push(`- 선택할 때의 이유: ${selection.reason}`)
      lines.push(`- 선택 당시 관심: ${selection.interestAtSelection || '없음'}`)
      lines.push('')
    }
  }

  lines.push('## 관심 과목', '')
  if (state.savedCourseIds.length === 0) {
    lines.push('저장한 과목이 없습니다.', '')
  } else {
    for (const courseId of state.savedCourseIds) {
      const course = getCourse(courseId)
      if (!course) {
        lines.push(`- ${courseId}: 자료를 찾을 수 없음`)
        continue
      }
      const kind = course.kind === 'professor' ? '교수님 담당 수업' : '관련 과목'
      lines.push(`- ${course.title} (${kind}, ${course.termLabel})`)
    }
    lines.push('')
  }

  lines.push('## 실험 기록', '')
  if (state.experiments.length === 0) {
    lines.push('저장한 실험이 없습니다.', '')
  } else {
    state.experiments.forEach((record, index) => {
      lines.push(...experimentLines(record, index))
    })
  }

  lines.push('## 체험 후 생각', '')
  lines.push(`- 흥미로웠던 부분: ${textOrEmpty(state.reflection.interesting)}`)
  lines.push(`- 어려웠던 부분: ${textOrEmpty(state.reflection.difficult)}`)
  lines.push(`- 더 알아보고 싶은 질문: ${textOrEmpty(state.reflection.questions)}`)
  lines.push(`- 아직 판단하지 못한 부분: ${textOrEmpty(state.reflection.undecided)}`)
  lines.push('')
  lines.push('## 현재 판단', '')
  if (state.reflection.decision === 'explore-more') {
    lines.push('연구실을 최종 선택하지 않고 더 탐색하기로 했습니다.', '')
  } else if (state.reflection.decision === 'choose-lab') {
    const lab = getLab(state.reflection.labId)
    lines.push(`- 관심 연구실: ${lab?.name ?? (state.reflection.labId || '아직 고르지 않음')}`)
    lines.push(`- 이유: ${textOrEmpty(state.reflection.labReason)}`)
    lines.push('')
  } else {
    lines.push('아직 연구실을 정하지 않았습니다.', '')
  }

  lines.push('## 다음에 할 행동', '')
  if (state.reflection.nextActionIds.length === 0 && !state.reflection.nextActionNote.trim()) {
    lines.push('적은 행동이 없습니다.', '')
  } else {
    for (const actionId of state.reflection.nextActionIds) {
      const action = nextActions.find((item) => item.id === actionId)
      lines.push(`- ${action?.label ?? actionId}`)
    }
    if (state.reflection.nextActionNote.trim()) {
      lines.push(`- 메모: ${state.reflection.nextActionNote.trim()}`)
    }
    lines.push('')
  }

  lines.push('자료는 시연용 가상 데이터이며, 실제 학교 발표나 논문 링크가 아닙니다.')
  return lines.join('\n')
}

function experimentLines(record: ExperimentRecord, index: number): string[] {
  const labNames = record.labIds.map((id) => getLab(id)?.name ?? id).join(', ')
  return [
    `### 실험 ${index + 1}`,
    '',
    `- 저장 시각: ${record.savedAt || '미확인'}`,
    `- 당시 관심: ${textOrEmpty(record.interestField)}`,
    `- 당시 연구실: ${labNames || '없음'}`,
    `- 예상: ${textOrEmpty(record.prediction)}`,
    `- 관찰: ${textOrEmpty(record.observation)}`,
    `- BFS: ${outcomeText(record.bfs)}`,
    `- A*: ${outcomeText(record.astar)}`,
    '',
    '```',
    gridToAscii(record.grid),
    '```',
    '',
  ]
}

function outcomeText(outcome: AlgorithmOutcome): string {
  const path = outcome.found && outcome.pathLength !== null ? `${outcome.pathLength}번 이동` : '경로 없음'
  return `경로 ${path}, 탐색한 칸 ${outcome.exploredCount}`
}

function textOrEmpty(value: string): string {
  return value.trim() ? value.trim() : '없음'
}
