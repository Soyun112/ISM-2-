import type { StageStatus } from '../domain/types'
import { getStageStatus } from '../domain/status'
import { copy, reviewMessage } from '../content/copy'
import type { StageId } from '../domain/types'
import { useApp } from '../state/store'

const statusLabel: Record<StageStatus, string> = {
  not_started: '시작 전',
  in_progress: '진행 중',
  completed: '완료',
  needs_review: '재검토 필요',
}

export function StatusPill({ status }: { status: StageStatus }) {
  return <span className={`status ${status}`}>{statusLabel[status]}</span>
}

export function ReviewNote({ stage }: { stage: StageId }) {
  const { state, dispatch } = useApp()
  if (getStageStatus(stage, state) !== 'needs_review') return null
  return (
    <div className="banner warn" role="status">
      <p>{reviewMessage[stage]}</p>
      {stage !== 'find' && (
        <button type="button" className="btn" onClick={() => dispatch({ type: 'ack-stage', stage })}>
          {copy.ackReview}
        </button>
      )}
    </div>
  )
}
