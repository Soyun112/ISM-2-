import { buttons, copy, stageMeta } from '../content/copy'
import { getExperience } from '../content/experiences'
import { getLab } from '../content/labs'
import type { Lab } from '../domain/types'
import { useApp } from '../state/store'
import { ReviewNote } from './bits'
import { ExperimentHistory } from './ExperimentHistory'
import { MazeCompare } from './MazeCompare'

export function StageExperience() {
  const { state, dispatch } = useApp()
  const meta = stageMeta[2]
  const selected = state.selections
    .map((selection) => getLab(selection.labId))
    .filter((lab): lab is Lab => Boolean(lab))
  const ready = new Map<string, string[]>()
  const pending: { key: string; name: string; message: string }[] = []

  for (const lab of selected) {
    if (!lab.experienceId) {
      pending.push({
        key: lab.id,
        name: lab.name,
        message: '이 연구실에 연결된 체험은 아직 없습니다. 다른 체험으로 대신하지 않습니다.',
      })
      continue
    }
    const experience = getExperience(lab.experienceId)
    if (!experience || experience.availability !== 'ready') {
      pending.push({
        key: lab.id,
        name: lab.name,
        message: experience
          ? `‘${experience.title}’ 체험은 준비 중입니다. 다른 체험으로 대신하지 않습니다.`
          : '체험 정보를 찾지 못했습니다.',
      })
      continue
    }
    const names = ready.get(experience.id) ?? []
    names.push(lab.name)
    ready.set(experience.id, names)
  }

  const showMaze = ready.has('maze-compare')

  return (
    <section className="stage">
      <p className="kicker">과정 {meta.index}</p>
      <h2>{meta.title}</h2>
      <p className="lead">{meta.description}</p>
      <ReviewNote stage="experience" />
      <p className="hint">{copy.dataDisclaimer}</p>

      {selected.length === 0 && (
        <div className="empty">
          <p>체험을 연결할 연구실이 선택되어 있지 않습니다.</p>
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'goto', stage: 'find' })}>
            관심 연구실 찾기로 이동
          </button>
        </div>
      )}

      {pending.map((item) => (
        <article key={item.key} className="card">
          <h3>{item.name}</h3>
          <p className="empty tight">{item.message}</p>
        </article>
      ))}

      {[...ready.entries()].map(([experienceId, names]) => {
        const experience = getExperience(experienceId)
        if (!experience) return null
        if (experienceId === 'maze-compare') {
          return <MazeCompare key={experienceId} labNames={names} question={experience.question} />
        }
        return (
          <article key={experienceId} className="card">
            <h3>{experience.title}</h3>
            <p className="empty tight">실행 화면이 없습니다. 다른 체험으로 대신하지 않습니다.</p>
          </article>
        )
      })}

      {!showMaze && <ExperimentHistory records={state.experiments} />}

      <div className="actions">
        <button type="button" className="btn primary" onClick={() => dispatch({ type: 'goto', stage: 'prepare' })}>
          {buttons.toPrepare}
        </button>
      </div>
    </section>
  )
}
