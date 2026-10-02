import { useId, useState } from 'react'
import { buttons, copy, nextActions, stageMeta } from '../content/copy'
import { getCourse } from '../content/courses'
import { getLab } from '../content/labs'
import { reflectionHasContent } from '../domain/reflection'
import { buildSummaryMarkdown } from '../domain/summary'
import { useApp } from '../state/store'
import { ReviewNote } from './bits'
import { useUi } from './ui-context'

export function StagePrepare() {
  const { state, dispatch } = useApp()
  const { openMap } = useUi()
  const meta = stageMeta[3]
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const interestingId = useId()
  const difficultId = useId()
  const questionId = useId()
  const undecidedId = useId()
  const reasonId = useId()
  const noteId = useId()
  const labSelectId = useId()
  const reflection = state.reflection

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildSummaryMarkdown(state))
      setCopyState('ok')
    } catch {
      setCopyState('fail')
    }
  }

  function downloadSummary() {
    const blob = new Blob([buildSummaryMarkdown(state)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lab-explore-summary.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  function toggleAction(actionId: string) {
    const exists = reflection.nextActionIds.includes(actionId)
    dispatch({
      type: 'patch-reflection',
      patch: {
        nextActionIds: exists
          ? reflection.nextActionIds.filter((id) => id !== actionId)
          : [...reflection.nextActionIds, actionId],
      },
    })
  }

  return (
    <section className="stage">
      <p className="kicker">과정 {meta.index}</p>
      <h2>{meta.title}</h2>
      <p className="lead">{meta.description}</p>
      <ReviewNote stage="prepare" />
      <p className="hint">{copy.aptitudeNote}</p>

      <section className="card stack">
        <h3>지금까지의 기록</h3>
        <p>관심 분야: {state.interestField.trim() || '없음'}</p>
        {state.selections.length === 0 ? (
          <p>선택한 연구실이 없습니다.</p>
        ) : (
          <ul>
            {state.selections.map((selection) => (
              <li key={selection.labId}>
                {getLab(selection.labId)?.name ?? selection.labId}: {selection.reason}
              </li>
            ))}
          </ul>
        )}
        <p>
          관심 과목:{' '}
          {state.savedCourseIds.length === 0
            ? '없음'
            : state.savedCourseIds.map((id) => getCourse(id)?.title ?? id).join(', ')}
        </p>
        <p>저장한 실험: {state.experiments.length}회</p>
      </section>

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          dispatch({ type: 'save-reflection' })
        }}
      >
        <div className="field">
          <label htmlFor={interestingId}>체험에서 흥미로웠던 부분</label>
          <textarea
            id={interestingId}
            value={reflection.interesting}
            onChange={(event) => dispatch({ type: 'patch-reflection', patch: { interesting: event.target.value } })}
          />
        </div>
        <div className="field">
          <label htmlFor={difficultId}>어려웠던 부분</label>
          <textarea
            id={difficultId}
            value={reflection.difficult}
            onChange={(event) => dispatch({ type: 'patch-reflection', patch: { difficult: event.target.value } })}
          />
        </div>
        <div className="field">
          <label htmlFor={questionId}>더 알아보고 싶은 질문</label>
          <textarea
            id={questionId}
            value={reflection.questions}
            onChange={(event) => dispatch({ type: 'patch-reflection', patch: { questions: event.target.value } })}
          />
        </div>
        <fieldset>
          <legend>현재 판단</legend>
          <label className="check">
            <input
              type="radio"
              name="decision"
              checked={reflection.decision === 'explore-more'}
              onChange={() => dispatch({ type: 'patch-reflection', patch: { decision: 'explore-more' } })}
            />
            아직 정하지 않고 더 탐색하기
          </label>
          <label className="check">
            <input
              type="radio"
              name="decision"
              disabled={state.selections.length === 0}
              checked={reflection.decision === 'choose-lab'}
              onChange={() => dispatch({ type: 'patch-reflection', patch: { decision: 'choose-lab' } })}
            />
            관심 연구실을 하나 메모하기
          </label>
          {state.selections.length === 0 && <p className="hint">메모할 연구실을 아직 고르지 않았습니다.</p>}
        </fieldset>
        {reflection.decision === 'choose-lab' && (
          <>
            <div className="field">
              <label htmlFor={labSelectId}>관심 연구실</label>
              <select
                id={labSelectId}
                value={reflection.labId}
                onChange={(event) => dispatch({ type: 'patch-reflection', patch: { labId: event.target.value } })}
              >
                <option value="">선택</option>
                {state.selections.map((selection) => (
                  <option key={selection.labId} value={selection.labId}>
                    {getLab(selection.labId)?.name ?? selection.labId}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={reasonId}>그 이유</label>
              <textarea
                id={reasonId}
                value={reflection.labReason}
                onChange={(event) => dispatch({ type: 'patch-reflection', patch: { labReason: event.target.value } })}
              />
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor={undecidedId}>아직 판단하지 못한 부분</label>
          <textarea
            id={undecidedId}
            value={reflection.undecided}
            onChange={(event) => dispatch({ type: 'patch-reflection', patch: { undecided: event.target.value } })}
          />
        </div>
        <fieldset>
          <legend>다음에 할 행동</legend>
          {nextActions.map((action) => (
            <label key={action.id} className="check">
              <input
                type="checkbox"
                checked={reflection.nextActionIds.includes(action.id)}
                onChange={() => toggleAction(action.id)}
              />
              {action.label}
            </label>
          ))}
        </fieldset>
        <div className="field">
          <label htmlFor={noteId}>행동 메모</label>
          <textarea
            id={noteId}
            value={reflection.nextActionNote}
            onChange={(event) => dispatch({ type: 'patch-reflection', patch: { nextActionNote: event.target.value } })}
          />
        </div>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={!reflectionHasContent(reflection)}>
            {buttons.saveReflection}
          </button>
          {state.prepareSaved && <span className="hint">정리를 저장했습니다. 수정한 뒤 다시 저장할 수 있습니다.</span>}
        </div>
      </form>

      <div className="actions">
        <button type="button" className="btn" onClick={() => void copySummary()}>
          {buttons.copySummary}
        </button>
        <button type="button" className="btn" onClick={downloadSummary}>
          {buttons.downloadSummary}
        </button>
        <button type="button" className="btn ghost" onClick={openMap}>
          {buttons.openMap}
        </button>
      </div>
      {copyState === 'ok' && <p role="status">{buttons.copied}</p>}
      {copyState === 'fail' && (
        <p className="banner warn" role="alert">
          {buttons.copyFailed}
        </p>
      )}
    </section>
  )
}
