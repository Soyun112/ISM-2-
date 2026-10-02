import { stageMeta } from '../content/copy'
import { stageSummary, getStageStatus } from '../domain/status'
import type { StageId } from '../domain/types'
import { useApp } from '../state/store'
import { StatusPill } from './bits'

export function ProgressBar({
  mapOpen,
  onSelect,
}: {
  mapOpen: boolean
  onSelect: (stage: StageId) => void
}) {
  const { state } = useApp()
  return (
    <nav className="progress" aria-label="탐색 과정">
      <ol>
        {stageMeta.map((stage) => {
          const status = getStageStatus(stage.id, state)
          const current = !mapOpen && state.stage === stage.id
          return (
            <li key={stage.id}>
              <button
                type="button"
                className={current ? 'progress-step active' : 'progress-step'}
                aria-current={current ? 'step' : undefined}
                onClick={() => onSelect(stage.id)}
              >
                <span className="step-index">{stage.index}</span>
                <span>
                  <strong>{stage.title}</strong>
                  <StatusPill status={status} />
                  <small>{stageSummary(stage.id, state)}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
