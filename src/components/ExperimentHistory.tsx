import { getLab } from '../content/labs'
import { gridToAscii } from '../domain/pathfinding'
import type { AlgorithmOutcome, ExperimentRecord } from '../domain/types'

export function ExperimentHistory({ records }: { records: ExperimentRecord[] }) {
  if (records.length === 0) return null
  return (
    <section className="stack">
      <h3>저장한 실험</h3>
      {records.map((record, index) => (
        <article key={record.id} className="card">
          <h4>
            실험 {index + 1}
            <span className="meta"> {formatWhen(record.savedAt)}</span>
          </h4>
          <p className="hint">
            당시 관심: {record.interestField || '없음'} · 당시 연구실:{' '}
            {record.labIds.map((id) => getLab(id)?.name ?? id).join(', ') || '없음'}
          </p>
          <p>예상: {record.prediction.trim() || '없음'}</p>
          <p>관찰: {record.observation.trim() || '없음'}</p>
          <div className="split">
            <OutcomeStat title="BFS" outcome={record.bfs} />
            <OutcomeStat title="A*" outcome={record.astar} />
          </div>
          <pre className="ascii">{gridToAscii(record.grid)}</pre>
        </article>
      ))}
    </section>
  )
}

function OutcomeStat({ title, outcome }: { title: string; outcome: AlgorithmOutcome }) {
  const path = outcome.found && outcome.pathLength !== null ? `${outcome.pathLength}번 이동` : '경로 없음'
  return (
    <p>
      <strong>{title}</strong> 경로 {path}, 탐색한 칸 {outcome.exploredCount}
    </p>
  )
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '시간 미확인'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
