import type { Lab } from '../domain/types'

/** 연구실 데이터. UI와 분리되어 있으므로 이 목록만 교체하면 됩니다. */
export const labs: Lab[] = [
  {
    id: 'lab-path',
    name: '길찾기탐색 연구실',
    professor: '김하늘',
    fields: ['경로 탐색', '휴리스틱', '로봇 이동'],
    tags: ['길찾기', '경로', '탐색', '휴리스틱', '알고리즘', '로봇', '미로', '최단경로', '인공지능'],
    summary:
      '지도 위에서 목적지까지 가는 길을 찾을 때, 어떤 순서로 후보 칸을 살펴볼지 다루는 가상 연구실입니다.',
    problem: '막힌 칸이 있는 지도에서 목적지까지 가는 경로를 찾고, 그 과정에서 살펴보는 범위를 줄이는 문제입니다.',
    methods: [
      '격자 위에서 상하좌우로만 이동한다고 가정합니다.',
      '가까운 칸부터 살펴보는 너비 우선 탐색을 기준점으로 둡니다.',
      '목적지까지 남은 거리를 힌트로 쓰는 A*와 비교합니다.',
    ],
    projects: [
      {
        id: 'proj-path-maze',
        title: '같은 미로에서 탐색 범위 비교',
        summary:
          '목적지도 장애물도 같은 지도에서, 방법에 따라 살펴본 칸 수가 어떻게 달라지는지 보는 가상 프로젝트입니다.',
      },
    ],
    differenceNote: '문장이나 영상 자체를 다루기보다, 이동 경로와 탐색 순서를 비교하는 데 초점이 있습니다.',
    experienceId: 'maze-compare',
    professorCourseIds: ['course-path-algo', 'course-path-os'],
    relatedCourseIds: ['course-path-discrete', 'course-path-intro-ai'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
  {
    id: 'lab-language',
    name: '말뜻이해 연구실',
    professor: '이도윤',
    fields: ['자연어 처리', '질의응답'],
    tags: ['자연어', '언어', '말', '텍스트', '챗봇', '질의응답', '대화', '인공지능'],
    summary: '사람이 쓴 문장을 읽고, 질문이 무엇을 묻는지 파악하는 방법을 다루는 가상 연구실입니다.',
    problem: '같은 단어도 문맥에 따라 뜻이 달라서, 질문과 답을 단순히 단어 겹침으로 고르기 어렵습니다.',
    methods: [
      '문장을 토큰으로 나누고 문맥을 숫자로 나타냅니다.',
      '질문과 후보 문장의 관계를 분류합니다.',
      '답이 본문에 있는지 먼저 판단하는 절차를 둡니다.',
    ],
    projects: [
      {
        id: 'proj-lang-qa',
        title: '짧은 지문 질의응답',
        summary: '한 문단 안에서 질문의 근거 문장을 고르는 가상 프로젝트입니다. 실제 논문은 없습니다.',
      },
    ],
    differenceNote: '길을 찾는 대신, 문장의 의미와 질문의 초점을 맞추는 문제를 다룹니다.',
    experienceId: 'language-preview',
    professorCourseIds: ['course-lang-nlp', 'course-lang-db'],
    relatedCourseIds: ['course-lang-prob'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
  {
    id: 'lab-vision',
    name: '화면이해 연구실',
    professor: '박서연',
    fields: ['컴퓨터 비전', '영상 인식'],
    tags: ['비전', '컴퓨터비전', '영상', '이미지', '사진', '인식', '인공지능'],
    summary: '사진과 영상에서 물체가 어디 있는지, 무엇인지 구분하는 가상 연구실입니다.',
    problem: '빛, 각도, 가림이 바뀌어도 같은 물체로 알아봐야 하는 문제입니다.',
    methods: [
      '이미지를 작은 영역으로 나눠 특징을 뽑습니다.',
      '정답이 표시된 사진으로 분류기를 학습합니다.',
      '틀리는 사례를 모아 어떤 조건에서 약한지 봅니다.',
    ],
    projects: [
      {
        id: 'proj-vision-object',
        title: '단순 배경의 물체 구분',
        summary: '배경이 단순한 사진에서 물체 종류를 맞히는 가상 프로젝트입니다.',
      },
    ],
    differenceNote: '텍스트 의미보다 시각 신호에서 물체를 구분하는 문제에 초점이 있습니다.',
    experienceId: null,
    professorCourseIds: ['course-vis-cv', 'course-vis-linear'],
    relatedCourseIds: ['course-vis-signal'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
  {
    id: 'lab-security',
    name: '코드안전 연구실',
    professor: '최민재',
    fields: ['소프트웨어 보안', '취약점'],
    tags: ['보안', '취약점', '해킹', '코드', '소프트웨어보안'],
    summary: '프로그램이 예상하지 못한 입력 때문에 위험해지는 지점을 찾는 가상 연구실입니다.',
    problem: '정상 기능은 그대로 두면서, 공격을 유발하는 입력과 코드 경로를 구분해야 합니다.',
    methods: [
      '입력 검증이 빠지는 위치를 살펴봅니다.',
      '실패 사례를 재현할 수 있는 작은 입력을 만듭니다.',
      '고친 뒤에도 원래 기능이 남는지 확인합니다.',
    ],
    projects: [
      {
        id: 'proj-sec-input',
        title: '입력 검증 빠짐 사례',
        summary: '짧은 예제 프로그램에서 검증이 빠지는 분기를 찾는 가상 프로젝트입니다.',
      },
    ],
    differenceNote: '추천이나 영상 인식보다, 코드가 깨지는 조건과 방어에 초점이 있습니다.',
    experienceId: null,
    professorCourseIds: ['course-sec-soft', 'course-sec-network'],
    relatedCourseIds: ['course-sec-system'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
  {
    id: 'lab-hci',
    name: '학습도구 연구실',
    professor: '정유진',
    fields: ['인간-컴퓨터 상호작용', '학습 도구'],
    tags: ['사용자', '인터랙션', '학습도구', 'HCI', '화면설계', '사람'],
    summary: '사람이 소프트웨어를 쓰며 배우는 과정에서 어디가 막히는지 보는 가상 연구실입니다.',
    problem: '기능이 맞아도 화면 흐름이 어려우면 학습이 멈춥니다. 그 막힘을 관찰로 확인합니다.',
    methods: [
      '과제를 수행하는 사람의 조작 순서를 기록합니다.',
      '막힌 지점과 화면 문구를 함께 봅니다.',
      '한 가지 흐름만 바꿔 다시 수행 시간을 비교합니다.',
    ],
    projects: [
      {
        id: 'proj-hci-flow',
        title: '과제 화면의 막힘 관찰',
        summary: '짧은 학습 과제에서 사용자가 멈추는 단계를 적는 가상 프로젝트입니다.',
      },
    ],
    differenceNote: '알고리즘의 정답률보다, 사람이 도구를 이해하며 겪는 어려움에 초점이 있습니다.',
    experienceId: null,
    professorCourseIds: ['course-hci-design', 'course-hci-web'],
    relatedCourseIds: ['course-hci-psych'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
  {
    id: 'lab-data',
    name: '데이터흐름 연구실',
    professor: '한지우',
    fields: ['데이터 분석', '추천'],
    tags: ['데이터', '추천', '분석', '로그', '데이터분석', '인공지능'],
    summary: '사용 기록에서 반복되는 패턴을 찾고, 다음에 볼 항목을 고르는 가상 연구실입니다.',
    problem: '기록이 적어도 그럴듯한 추천을 하게 되면, 왜 그 항목이 나왔는지 설명하기 어렵습니다.',
    methods: [
      '클릭과 저장 기록을 표로 정리합니다.',
      '비슷한 사용 패턴을 묶습니다.',
      '추천 이유에 쓰인 기록과 실제 선택을 비교합니다.',
    ],
    projects: [
      {
        id: 'proj-data-rec',
        title: '작은 기록으로 다음 항목 고르기',
        summary: '수십 개의 가상 사용 기록만으로 다음 항목을 고르는 프로젝트입니다.',
      },
    ],
    differenceNote: '문장 이해나 길찾기보다, 사용 기록의 패턴과 추천 근거를 다룹니다.',
    experienceId: null,
    professorCourseIds: ['course-data-mining', 'course-data-stat'],
    relatedCourseIds: ['course-data-python'],
    sourceLabel: '데모 자료',
    verifiedAt: '미확인',
  },
]

export function getLab(id: string): Lab | undefined {
  return labs.find((lab) => lab.id === id)
}
