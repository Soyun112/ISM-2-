import { copy, nextActions, stageMeta } from '../content/copy'
import { getCourse } from '../content/courses'
import { getLab } from '../content/labs'
import { getStageStatus, stageSummary } from '../domain/status'
import type { StageId } from '../domain/types'
import { useApp } from '../state/store'
import { StatusPill } from './bits'

export function ExploreMap({ onOpen }: { onOpen: (stage: StageId) => void }) {
  const { state } = useApp()
  const reflection = state.reflection
  const chosen = getLab(reflection.labId)
  const chosenSelection = state.selections.find((item) => item.labId === reflection.labId)
  const reasonChanged = Boolean(
    chosenSelection &&
      reflection.labReason.trim() &&
      chosenSelection.reason.trim() !== reflection.labReason.trim(),
  )

  return (
    <section className="stage">
      <h2>{copy.mapButton}</h2>
      <p className="lead">네 과정의 저장 결과입니다. 과정을 누르면 그 화면으로 이동합니다.</p>
      <p className="hint">{copy.dataDisclaimer}</p>
      <div className="map-list">
        {stageMeta.map((stage) => {
          const status = getStageStatus(stage.id, state)
          return (
            <article key={stage.id} className="map-card">
              <div className="row spread">
                <h3>
                  {stage.index}. {stage.title}
                </h3>
                <StatusPill status={status} />
              </div>
              <p>{stageSummary(stage.id, state)}</p>
              {status === 'needs_review' && (
                <p className="hint">기록 당시와 지금의 관심 또는 후보가 다릅니다. 이전 기록은 삭제하지 않았습니다.</p>
              )}
              {stage.id === 'find' && (
                <ul>
                  {state.selections.map((selection) => (
                    <li key={selection.labId}>
                      <strong>{getLab(selection.labId)?.name ?? selection.labId}</strong>
                      <div>선택할 때의 이유: {selection.reason}</div>
                    </li>
                  ))}
                </ul>
              )}
              {stage.id === 'explore' && (
                <ul>
                  {state.savedCourseIds.map((id) => (
                    <li key={id}>{getCourse(id)?.title ?? id}</li>
                  ))}
                </ul>
              )}
              {stage.id === 'experience' && (
                <ul>
                  {state.experiments.map((record) => (
                    <li key={record.id}>
                      경로 BFS {pathText(record.bfs.found, record.bfs.pathLength)} / A*{' '}
                      {pathText(record.astar.found, record.astar.pathLength)}
                      {record.observation.trim() ? ` · 관찰: ${record.observation.trim()}` : ''}
                    </li>
                  ))}
                </ul>
              )}
              {stage.id === 'prepare' && (
                <div className="stack">
                  <p>
                    {reflection.decision === 'explore-more'
                      ? '연구실을 확정하지 않고 더 탐색하기로 했습니다.'
                      : reflection.decision === 'choose-lab'
                        ? `메모한 연구실: ${chosen?.name ?? '아직 고르지 않음'}`
                        : '판단은 아직 저장 전일 수 있습니다.'}
                  </p>
                  {reflection.decision === 'choose-lab' && reflection.labReason.trim() && (
                    <p>정리할 때의 이유: {reflection.labReason}</p>
                  )}
                  {reasonChanged && chosenSelection && (
                    <p className="hint">선택할 때의 이유와 다릅니다. 선택할 때: {chosenSelection.reason}</p>
                  )}
                  {reflection.nextActionIds.length > 0 && (
                    <ul>
                      {reflection.nextActionIds.map((id) => (
                        <li key={id}>{nextActions.find((action) => action.id === id)?.label ?? id}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <button type="button" className="btn" onClick={() => onOpen(stage.id)}>
                이 과정 열기
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function pathText(found: boolean, pathLength: number | null): string {
  return found && pathLength !== null ? `${pathLength}번 이동` : '경로 없음'
}
