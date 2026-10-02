import { getLab } from '../content/labs'
import type { ChatContext } from './context'

/**
 * 데모 응답기.
 * 실제 API로 바꿀 때는 이 파일의 replyDemo 대신 같은 ChatContext를 받는 함수를 두고,
 * getResponder()가 그 함수를 반환하게 하면 됩니다.
 */
export interface Responder {
  reply(message: string, context: ChatContext): string
}

export const demoResponder: Responder = {
  reply: replyDemo,
}

export function replyDemo(message: string, context: ChatContext): string {
  const compact = message.replace(/\s+/g, '').toLowerCase()
  const body = pickBody(compact, context)
  return `데모 응답입니다. 외부 AI나 웹 검색을 사용하지 않았습니다.\n현재 과정: ${context.stageTitle}\n\n${body}`
}

function pickBody(compact: string, context: ChatContext): string {
  if (compact.includes('추천') && compact.includes('이유')) return reasonBody(context)
  if (compact.includes('수업') || compact.includes('과목')) return courseBody(context)
  if (compact.includes('차이')) return differenceBody(context)
  if (
    compact.includes('비교') ||
    compact.includes('실험') ||
    compact.includes('길찾기') ||
    compact.includes('경로') ||
    compact.includes('bfs') ||
    compact.includes('astar') ||
    compact.includes('a*')
  ) {
    return experimentBody(context)
  }
  if (compact.includes('정리')) return context.summaryMarkdown
  return fallbackBody()
}

function reasonBody(context: ChatContext): string {
  if (context.selections.length === 0 && context.recommendations.length === 0) {
    return '아직 추천 결과가 없습니다. 관심 분야를 입력하고 추천 버튼을 눌러 주세요. 데모는 저장된 가상 연구실의 태그가 관심 문장과 겹치는지만 봅니다.'
  }
  const lines: string[] = []
  if (context.interestField) lines.push(`지금 관심 분야는 ‘${context.interestField}’입니다.`)
  if (context.recommendations.length === 0) {
    lines.push('현재 추천 목록이 비어 있습니다.')
  } else {
    lines.push('이번 추천에서 화면에 보이는 이유와 같은 문장입니다.')
    for (const recommendation of context.recommendations) {
      lines.push(`- ${getLab(recommendation.labId)?.name ?? recommendation.labId}: ${recommendation.reason}`)
    }
  }
  const missing = context.selections.filter(
    (selection) => !context.recommendations.some((item) => item.labId === selection.labId),
  )
  if (missing.length > 0) {
    lines.push('추천 목록에는 없지만 선택으로 남아 있는 연구실입니다. 이유는 고를 때 저장된 문장입니다.')
    for (const selection of missing) {
      lines.push(`- ${getLab(selection.labId)?.name ?? selection.labId}: ${selection.reason}`)
    }
  }
  lines.push('적합도 점수는 계산하지 않습니다.')
  return lines.join('\n')
}

function differenceBody(context: ChatContext): string {
  if (context.selectedLabs.length < 2) {
    return '차이를 비교하려면 관심 후보를 두 곳 이상 선택해 주세요. 한 곳만 선택된 상태에서는 다른 후보와의 차이를 단정하지 않습니다.'
  }
  const lines = ['선택한 연구실의 초점입니다. 시연용 설명이며 우열을 정하지 않습니다.']
  for (const lab of context.selectedLabs) {
    lines.push(`- ${lab.name}: ${lab.fields.join(', ')}. ${lab.differenceNote}`)
  }
  return lines.join('\n')
}

function courseBody(context: ChatContext): string {
  const lines = [
    '과목은 두 종류로만 나눕니다.',
    '1. 교수님 담당 수업: 그 교수님의 담당 기록으로 둔 가상 수업입니다. 담당했다는 사실만으로 연구와 직접 연결하지 않습니다.',
    '2. 관련 과목: 연구 내용을 이해하는 데 도움이 되도록 고른 과목입니다. 그 교수님의 수업이 아닙니다.',
    '현재 담당과 과거 담당도 구분합니다. 학기를 모르는 항목은 미확인입니다.',
  ]
  if (context.professorCourses.length === 0 && context.relatedCourses.length === 0) {
    lines.push('선택한 연구실이 없어 과목 목록은 붙이지 않았습니다.')
    return lines.join('\n')
  }
  lines.push('선택한 연구실에 연결된 교수님 담당 수업:')
  for (const course of context.professorCourses) {
    const link = course.connectionAssumed ? '주제상 연결해 둔 설명' : '담당 사실만 기록, 직접 연결은 단정하지 않음'
    lines.push(`- ${course.title} (${course.termLabel}): ${course.researchConnection} [${link}]`)
  }
  lines.push('관련 과목:')
  for (const course of context.relatedCourses) {
    lines.push(`- ${course.title} (${course.termLabel}): ${course.researchConnection}`)
  }
  if (context.savedCourses.length > 0) {
    lines.push(`관심 과목으로 저장한 항목: ${context.savedCourses.map((course) => course.title).join(', ')}`)
  }
  return lines.join('\n')
}

function experimentBody(context: ChatContext): string {
  const lines = [
    '이 체험에서 비교할 것은 두 가지입니다.',
    '- 경로 길이: 시작에서 목적지까지 이동한 횟수',
    '- 탐색한 칸 수: 대기열에서 꺼내 이웃을 확인한 칸의 수',
    context.experienceQuestion
      ? `탐구 질문: ${context.experienceQuestion}`
      : '탐구 질문은 체험 메타데이터에 있습니다.',
    'BFS와 A*를 같은 지도에서 실행합니다. A*는 맨해튼 거리를 쓰고, 이동은 상하좌우, 비용은 모두 1입니다.',
    '경로가 없으면 두 방법 모두 경로 없음으로 나오는 것이 맞습니다. 살펴본 칸은 도달 가능한 영역입니다.',
    '실행 시간으로 우열을 정하지 않습니다.',
  ]
  const latest = context.experiments[context.experiments.length - 1]
  if (!latest) {
    lines.push('아직 저장한 실험 수치가 없어, 위 기준만 안내합니다.')
    return lines.join('\n')
  }
  lines.push('가장 최근 저장 결과입니다.')
  lines.push(`- BFS: ${formatOutcome(latest.bfs.found, latest.bfs.pathLength, latest.bfs.exploredCount)}`)
  lines.push(`- A*: ${formatOutcome(latest.astar.found, latest.astar.pathLength, latest.astar.exploredCount)}`)
  if (latest.prediction.trim()) lines.push(`- 당시 예상: ${latest.prediction.trim()}`)
  if (latest.observation.trim()) lines.push(`- 당시 관찰: ${latest.observation.trim()}`)
  return lines.join('\n')
}

function formatOutcome(found: boolean, pathLength: number | null, exploredCount: number): string {
  const path = found && pathLength !== null ? `${pathLength}번 이동` : '경로 없음'
  return `경로 ${path}, 탐색한 칸 ${exploredCount}`
}

function fallbackBody(): string {
  return [
    '이 데모에서 답할 수 있는 범위는 정해져 있습니다.',
    '- 이 연구실을 추천한 이유는?',
    '- 선택한 연구실은 어떤 차이가 있어?',
    '- 교수님 수업과 관련 과목은 어떻게 달라?',
    '- 이 실험에서 무엇을 비교하면 돼?',
    '- 내 탐색 내용을 정리해줘.',
    '그 밖의 질문, 실시간 자료 검색, 모집 여부 확인은 하지 않습니다.',
  ].join('\n')
}
