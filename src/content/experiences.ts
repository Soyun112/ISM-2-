import type { ExperienceMeta } from '../domain/types'

/**
 * 체험 메타데이터.
 * availability가 preparing이면 구현이 있어도 실행 화면으로 연결하지 않습니다.
 * 새 체험을 넣을 때는 이 목록과 화면 구현을 각각 추가합니다.
 */
export const experiences: ExperienceMeta[] = [
  {
    id: 'maze-compare',
    title: '미로 길찾기 비교',
    question: '같은 목적지로 가는 경로를 찾을 때, 탐색 방법에 따라 살펴보는 칸의 수는 어떻게 달라질까?',
    availability: 'ready',
    summary: '같은 지도에서 BFS와 A*가 살펴본 칸과 최종 경로를 비교합니다.',
  },
  {
    id: 'language-preview',
    title: '문장 의미 맛보기',
    question: '같은 문장을 다르게 읽으면 시스템이 고르는 답은 어떻게 달라질까?',
    availability: 'preparing',
    summary: '말뜻이해 연구실용으로 남겨 둔 자리입니다. 아직 실행 화면이 없습니다.',
  },
]

export function getExperience(id: string): ExperienceMeta | undefined {
  return experiences.find((item) => item.id === id)
}
