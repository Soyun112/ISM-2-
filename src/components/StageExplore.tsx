import { buttons, copy, stageMeta } from '../content/copy'
import { getCourse } from '../content/courses'
import { getExperience } from '../content/experiences'
import { getLab } from '../content/labs'
import type { Course, Lab } from '../domain/types'
import { useApp } from '../state/store'
import { ReviewNote } from './bits'
import { useUi } from './ui-context'

export function StageExplore() {
  const { state, dispatch } = useApp()
  const { sendChat } = useUi()
  const selected = state.selections
    .map((selection) => getLab(selection.labId))
    .filter((lab): lab is Lab => Boolean(lab))

  if (selected.length === 0) {
    return (
      <section className="stage">
        <p className="kicker">과정 {stageMeta[1].index}</p>
        <h2>{stageMeta[1].title}</h2>
        <ReviewNote stage="explore" />
        <div className="empty">
          <p>비교할 연구실이 없습니다.</p>
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'goto', stage: 'find' })}>
            관심 연구실 찾기로 이동
          </button>
        </div>
      </section>
    )
  }

  const professorCourses = uniqueCourses(selected.flatMap((lab) => lab.professorCourseIds))
  const relatedCourses = uniqueCourses(selected.flatMap((lab) => lab.relatedCourseIds))

  return (
    <section className="stage">
      <p className="kicker">과정 {stageMeta[1].index}</p>
      <h2>{stageMeta[1].title}</h2>
      <p className="lead">{stageMeta[1].description}</p>
      <ReviewNote stage="explore" />
      <p className="hint">{copy.dataDisclaimer}</p>
      <p className="hint">비교를 마쳤으면 기록해 주세요. 다른 화면으로 이동해도 이 과정이 자동으로 완료되지는 않습니다.</p>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => sendChat('선택한 연구실은 어떤 차이가 있어?')}>
          {buttons.askDifference}
        </button>
      </div>

      <div className="grid-2">
        {selected.map((lab) => (
          <article key={lab.id} className="card stack">
            <div className="row spread">
              <h3>{lab.name}</h3>
              <span className="tag">시연용 가상 데이터</span>
            </div>
            <p className="meta">{lab.professor} · 가상 인물</p>
            <p>{lab.fields.join(' · ')}</p>
            <p>
              <strong>해결하려는 문제. </strong>
              {lab.problem}
            </p>
            <div>
              <strong>주요 방법</strong>
              <ul>
                {lab.methods.map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            </div>
            {lab.projects.map((project) => (
              <p key={project.id}>
                <strong>{project.title}. </strong>
                {project.summary}
              </p>
            ))}
            <p>
              <strong>다른 후보와 다른 점. </strong>
              {lab.differenceNote}
            </p>
            <p className="source">
              자료 출처: {lab.sourceLabel} · 확인 날짜: {lab.verifiedAt}
            </p>
            <ExperienceLink lab={lab} />
          </article>
        ))}
      </div>

      <section className="stack">
        <div className="row spread">
          <h3>교수님 담당 수업</h3>
          <button type="button" className="btn ghost" onClick={() => sendChat('교수님 수업과 관련 과목은 어떻게 달라?')}>
            {buttons.askCourses}
          </button>
        </div>
        <p className="hint">담당 수업이라는 이유만으로 연구와 직접 연결하지 않습니다. 현재 담당과 과거 담당을 구분합니다.</p>
        {professorCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </section>

      <section className="stack">
        <h3>연구 이해에 도움이 되는 관련 과목</h3>
        <p className="hint">이 과목들은 해당 교수님의 담당 수업이 아닙니다.</p>
        {relatedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </section>

      <div className="actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => dispatch({ type: 'confirm-explore' })}
        >
          {buttons.saveCompare}
        </button>
        <button type="button" className="btn" onClick={() => dispatch({ type: 'goto', stage: 'experience' })}>
          {buttons.toExperience}
        </button>
      </div>
    </section>
  )
}

function CourseCard({ course }: { course: Course }) {
  const { state, dispatch } = useApp()
  const saved = state.savedCourseIds.includes(course.id)
  const lab = course.labId ? getLab(course.labId) : undefined
  return (
    <article className="card">
      <div className="row spread">
        <h4>{course.title}</h4>
        <span className="tag">{course.kind === 'professor' ? '교수님 담당 수업' : '관련 과목'}</span>
      </div>
      <p className="meta">
        {course.termLabel}
        {lab ? ` · ${lab.name}` : ''}
        {course.term === 'current' ? ' · 현재 담당' : course.term === 'past' ? ' · 과거 담당' : ' · 학기 미확인'}
      </p>
      <p>
        <strong>학습 내용. </strong>
        {course.learnings}
      </p>
      <p>
        <strong>연구와의 연결. </strong>
        {course.researchConnection}
      </p>
      {course.kind === 'professor' && !course.connectionAssumed && (
        <p className="hint">담당 여부만 기록했습니다. 연구 주제와 직접 연결된다고 보지 않습니다.</p>
      )}
      <button
        type="button"
        className={saved ? 'btn' : 'btn primary'}
        aria-pressed={saved}
        onClick={() => dispatch({ type: 'toggle-course', courseId: course.id })}
      >
        {saved ? buttons.unsaveCourse : buttons.saveCourse}
      </button>
    </article>
  )
}

function ExperienceLink({ lab }: { lab: Lab }) {
  const { dispatch } = useApp()
  if (!lab.experienceId) {
    return <p className="empty tight">이 연구실에 연결된 체험은 아직 없습니다. 다른 체험으로 대신하지 않습니다.</p>
  }
  const experience = getExperience(lab.experienceId)
  if (!experience || experience.availability !== 'ready') {
    return (
      <p className="empty tight">
        {experience ? `‘${experience.title}’ 체험은 준비 중입니다.` : '체험 정보를 찾지 못했습니다.'} 다른 체험으로 대신하지
        않습니다.
      </p>
    )
  }
  return (
    <button
      type="button"
      className="btn primary"
      onClick={() => {
        dispatch({ type: 'start-explore' })
        dispatch({ type: 'goto', stage: 'experience' })
      }}
    >
      {buttons.tryExperience}
    </button>
  )
}

function uniqueCourses(ids: string[]): Course[] {
  const seen = new Set<string>()
  const list: Course[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    const course = getCourse(id)
    if (!course) continue
    seen.add(id)
    list.push(course)
  }
  return list
}
