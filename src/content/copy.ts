import type { StageId } from '../domain/types'

/** 화면 문구. 서비스 이름과 버튼 문자는 이 파일에서 바꿉니다. */
export const copy = {
  serviceName: '연구실 탐색 지도',
  tagline: '관심 분야부터 연구실, 수업, 작은 체험을 차근차근 살펴봅니다.',
  demoBadge: '시연용 데모',
  dataDisclaimer:
    '시연용 가상 데이터입니다. 실제 교수, 학교 발표, 논문, 모집 공고가 아닙니다.',
  mapButton: '나의 탐색 지도',
  chatButton: '챗봇',
  closeChat: '챗봇 닫기',
  reset: '전체 초기화',
  resetTitle: '탐색 기록을 삭제할까요?',
  resetBody: '관심, 연구실 선택, 과목, 실험, 정리, 채팅 기록이 모두 삭제됩니다.',
  resetConfirm: '삭제',
  cancel: '취소',
  ackReview: '다시 확인했어요',
  backToStage: '현재 과정으로',
  storageWriteFailed: '브라우저에 기록을 저장하지 못했습니다.',
  exploredHelp:
    '탐색한 칸은 대기열에서 꺼내 이웃을 확인한 칸입니다. 시작 칸을 포함하고, 목적지를 꺼낸 경우에는 목적지도 포함합니다. 대기열에만 있는 칸은 세지 않습니다.',
  pathHelp: '경로 길이는 시작부터 목적지까지의 이동 횟수입니다.',
  runtimeNote: '실행 시간으로 어떤 방법이 더 낫다고 정하지 않습니다. 같은 지도에서 경로 길이와 탐색한 칸 수를 비교합니다.',
  astarRule: 'A*는 맨해튼 거리를 휴리스틱으로 사용합니다. 상하좌우로만 움직이고, 한 칸 이동 비용은 1입니다.',
  noPath: '이 지도에서는 시작점에서 목적지에 도달하는 경로가 없습니다.',
  sameLength: '같은 지도에서 두 방법의 최단 경로 길이는 같습니다. 탐색한 칸 수는 다를 수 있습니다.',
  differentLength: '두 방법의 경로 길이가 다릅니다. 이 조건에서는 둘 다 최단 경로를 내야 하므로 결과를 다시 확인해 주세요.',
  aptitudeNote: '짧은 체험 결과로 적성이나 연구 능력을 판정하지 않습니다. 연구실을 지금 정하지 않아도 됩니다.',
  chatDemo: '데모 응답',
  chatDemoDetail: '외부 AI를 호출하지 않습니다. 저장된 시연 데이터와 내 기록만 사용합니다.',
  chatBoundary: '채팅은 선택이나 완료 상태를 바꾸지 않습니다. 과정 이동은 화면의 버튼을 사용합니다.',
  chatPlaceholder: '데모에서 답할 수 있는 질문을 입력하세요',
  send: '보내기',
  bfsName: '너비 우선 탐색 (BFS)',
  astarName: 'A*',
}

export const stageMeta: {
  id: StageId
  index: number
  title: string
  short: string
  description: string
}[] = [
  {
    id: 'find',
    index: 1,
    title: '관심 연구실 찾기',
    short: '관심 분야로 후보를 고릅니다.',
    description: '관심 분야를 적으면 시연용 연구실 후보와 추천 이유를 보여 줍니다. 수강 경험은 선택입니다.',
  },
  {
    id: 'explore',
    index: 2,
    title: '연구와 수업 알아보기',
    short: '연구 내용과 두 종류의 과목을 비교합니다.',
    description: '고른 연구실이 다루는 문제와 방법, 교수님 담당 수업, 연구 이해에 도움이 되는 과목을 나눠 봅니다.',
  },
  {
    id: 'experience',
    index: 3,
    title: '작은 연구 체험하기',
    short: '준비된 체험으로 연구 질문을 직접 봅니다.',
    description: '체험이 연결된 연구실만 실행할 수 있습니다. 준비 중인 분야는 다른 체험으로 바꾸지 않습니다.',
  },
  {
    id: 'prepare',
    index: 4,
    title: '내 선택과 준비 정리하기',
    short: '기록과 다음 행동을 한곳에 모읍니다.',
    description: '앞 과정의 기록을 보고, 흥미와 질문, 다음 행동을 적습니다. 연구실을 확정하지 않아도 됩니다.',
  },
]

export const interestExamples = ['길찾기', '자연어 처리', '컴퓨터 비전', '보안', '사용자 경험', '데이터 분석']

export const nextActions = [
  { id: 'courses', label: '관련 과목 알아보기' },
  { id: 'reading', label: '입문 자료 읽기' },
  { id: 'project', label: '작은 프로젝트 해보기' },
  { id: 'questions', label: '연구실에 물어볼 질문 정리하기' },
] as const

export const chatExamples: Record<StageId, string[]> = {
  find: ['이 연구실을 추천한 이유는?', '선택한 연구실은 어떤 차이가 있어?'],
  explore: ['선택한 연구실은 어떤 차이가 있어?', '교수님 수업과 관련 과목은 어떻게 달라?'],
  experience: ['이 실험에서 무엇을 비교하면 돼?', '경로가 없을 때는 무엇을 보면 돼?'],
  prepare: ['내 탐색 내용을 정리해줘.', '교수님 수업과 관련 과목은 어떻게 달라?'],
}

export const reviewMessage: Record<StageId, string> = {
  find: '관심 분야가 바뀌었습니다. 선택한 연구실과 추천 이유는 지우지 않았습니다. 다시 추천하면, 아직 겹치는 후보의 이유만 갱신됩니다.',
  explore:
    '앞 과정의 관심이나 후보가 바뀌었습니다. 저장한 과목과 비교 기록은 그대로 두었습니다. 내용을 다시 확인해 주세요.',
  experience:
    '관심이나 연구실 후보가 바뀌었습니다. 저장한 실험의 지도와 결과는 그대로 두었습니다. 필요하면 다시 확인해 주세요.',
  prepare:
    '관심이나 연구실 후보가 바뀌었습니다. 적어 둔 준비 계획은 삭제하지 않았습니다. 아직 맞는지 확인해 주세요.',
}

export const buttons = {
  recommend: '연구실 추천',
  selectLab: '관심 후보로 선택',
  unselectLab: '선택 해제',
  detail: '상세보기',
  closeDetail: '상세 닫기',
  toExplore: '선택한 연구실 알아보기',
  saveCompare: '비교 내용을 기록하기',
  toExperience: '체험 화면으로 이동',
  tryExperience: '이 분야 체험하기',
  preparing: '체험 준비 중',
  saveCourse: '관심 과목 저장',
  unsaveCourse: '관심 과목 해제',
  askDifference: '차이를 챗봇에게 묻기',
  askCourses: '수업 구분을 챗봇에게 묻기',
  askReason: '추천 이유를 챗봇에게 묻기',
  runSearch: 'BFS와 A* 비교',
  resetMap: '장애물 초기화',
  exampleMap: '예제 지도',
  blockedMap: '경로 없는 예제',
  saveExperiment: '실험 결과 저장',
  toPrepare: '준비 정리로 이동',
  saveReflection: '정리 저장',
  copySummary: '요약 복사',
  downloadSummary: 'Markdown 다운로드',
  openMap: '탐색 지도에서 보기',
  copied: '복사했습니다',
  copyFailed: '복사하지 못했습니다. 다운로드를 사용해 주세요.',
}
