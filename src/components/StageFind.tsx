import { useId, useState, type FormEvent } from 'react'
import { buttons, copy, interestExamples, stageMeta } from '../content/copy'
import { getLab, labs } from '../content/labs'
import { recommendLabs } from '../domain/recommend'
import { useApp } from '../state/store'
import { ReviewNote } from './bits'
import { useUi } from './ui-context'

export function StageFind() {
  const { state, dispatch } = useApp()
  const { sendChat } = useUi()
  const [error, setError] = useState<string | null>(null)
  const interestId = useId()
  const courseId = useId()
  const wantId = useId()
  const interestDirty = Boolean(state.recommendedInterest) && state.recommendedInterest !== state.interestField.trim()
  const resultIds = new Set(state.recommendations.map((item) => item.labId))
  const leftovers = state.selections.filter((item) => !resultIds.has(item.labId))

  function recommend(event: FormEvent) {
    event.preventDefault()
    if (!state.interestField.trim()) return
    try {
      const recommendations = recommendLabs(labs, {
        interestField: state.interestField,
        coursework: state.coursework,
        wantToKnow: state.wantToKnow,
      })
      dispatch({ type: 'recommend', recommendations })
      setError(null)
    } catch {
      setError('추천을 계산하지 못했습니다.')
    }
  }

  function addExample(keyword: string) {
    const current = state.interestField.trim()
    if (!current) {
      dispatch({ type: 'set-interest', value: keyword })
      return
    }
    if (current.includes(keyword)) return
    dispatch({ type: 'set-interest', value: `${current} ${keyword}` })
  }

  return (
    <section className="stage">
      <p className="kicker">과정 {stageMeta[0].index}</p>
      <h2>{stageMeta[0].title}</h2>
      <p className="lead">{stageMeta[0].description}</p>
      <ReviewNote stage="find" />
      <p className="hint">{copy.dataDisclaimer}</p>

      <form className="card stack" onSubmit={recommend}>
        <div className="field">
          <label htmlFor={interestId}>관심 분야</label>
          <textarea
            id={interestId}
            value={state.interestField}
            onChange={(event) => dispatch({ type: 'set-interest', value: event.target.value })}
            placeholder="예: 로봇이 길을 찾는 방법"
          />
        </div>
        <div className="chips" aria-label="예시 관심 키워드">
          {interestExamples.map((keyword) => (
            <button key={keyword} type="button" className="chip" onClick={() => addExample(keyword)}>
              {keyword}
            </button>
          ))}
        </div>
        <details>
          <summary>선택 입력</summary>
          <div className="field">
            <label htmlFor={courseId}>들어 본 과목이나 과제</label>
            <textarea
              id={courseId}
              value={state.coursework}
              onChange={(event) => dispatch({ type: 'set-coursework', value: event.target.value })}
              placeholder="예: 알고리즘 과제에서 그래프를 다룸"
            />
          </div>
          <div className="field">
            <label htmlFor={wantId}>더 알고 싶은 내용</label>
            <textarea
              id={wantId}
              value={state.wantToKnow}
              onChange={(event) => dispatch({ type: 'set-want', value: event.target.value })}
              placeholder="예: 탐색 방법이 왜 달라지는지"
            />
          </div>
        </details>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={!state.interestField.trim()}>
            {buttons.recommend}
          </button>
        </div>
      </form>

      {error && (
        <p className="banner warn" role="alert">
          {error}
        </p>
      )}
      {interestDirty && (
        <p className="banner" role="status">
          지금 입력과 다른 관심으로 찾은 후보입니다. 다시 추천하면 겹치는 후보의 이유가 현재 입력으로 바뀝니다.
        </p>
      )}

      {state.recommendedInterest && (
        <div className="stack">
          <div className="row spread">
            <h3>후보 {state.recommendations.length}곳</h3>
            {state.recommendations.length > 0 && (
              <button type="button" className="btn ghost" onClick={() => sendChat('이 연구실을 추천한 이유는?')}>
                {buttons.askReason}
              </button>
            )}
          </div>
          {state.recommendations.length === 0 ? (
            <div className="empty" role="status">
              <p>해당하는 연구실 후보가 없습니다.</p>
              <p>관심 분야의 단어를 바꾸거나 예시 키워드로 넓혀 다시 추천해 보세요.</p>
            </div>
          ) : (
            state.recommendations.map((recommendation) => {
              const lab = getLab(recommendation.labId)
              if (!lab) return null
              const selected = state.selections.some((item) => item.labId === lab.id)
              return (
                <article key={lab.id} className={selected ? 'card selected' : 'card'}>
                  <div className="row spread">
                    <h3>{lab.name}</h3>
                    <span className="tag">시연용 가상 데이터</span>
                  </div>
                  <p className="meta">
                    {lab.professor} · 가상 인물
                  </p>
                  <p>{lab.fields.join(' · ')}</p>
                  <p>{lab.summary}</p>
                  <p>
                    <strong>추천 이유. </strong>
                    {recommendation.reason}
                  </p>
                  <p className="source">
                    자료 출처: {lab.sourceLabel} · 확인 날짜: {lab.verifiedAt}
                  </p>
                  <details>
                    <summary>{buttons.detail}</summary>
                    <div className="stack">
                      <p>
                        <strong>해결하려는 문제. </strong>
                        {lab.problem}
                      </p>
                      <ul>
                        {lab.methods.map((method) => (
                          <li key={method}>{method}</li>
                        ))}
                      </ul>
                      {lab.projects.map((project) => (
                        <p key={project.id}>
                          <strong>{project.title}. </strong>
                          {project.summary}
                        </p>
                      ))}
                    </div>
                  </details>
                  <div className="actions">
                    <button
                      type="button"
                      className={selected ? 'btn' : 'btn primary'}
                      aria-pressed={selected}
                      disabled={!selected && interestDirty}
                      onClick={() => dispatch({ type: 'toggle-lab', labId: lab.id, reason: recommendation.reason })}
                    >
                      {selected ? buttons.unselectLab : buttons.selectLab}
                    </button>
                  </div>
                  {!selected && interestDirty && (
                    <p className="hint">입력이 바뀐 상태에서는 새 선택이 막혀 있습니다. 추천을 다시 실행해 주세요.</p>
                  )}
                </article>
              )
            })
          )}
        </div>
      )}

      {leftovers.length > 0 && (
        <section className="stack">
          <h3>이전에 선택한 연구실</h3>
          <p className="hint">이번 추천에는 없지만 기록은 유지됩니다.</p>
          {leftovers.map((selection) => {
            const lab = getLab(selection.labId)
            return (
              <article key={selection.labId} className="card selected">
                <h3>{lab?.name ?? selection.labId}</h3>
                <p>{selection.reason}</p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => dispatch({ type: 'toggle-lab', labId: selection.labId, reason: selection.reason })}
                >
                  {buttons.unselectLab}
                </button>
              </article>
            )
          })}
        </section>
      )}

      <div className="actions">
        <button
          type="button"
          className="btn primary"
          disabled={state.selections.length === 0}
          onClick={() => dispatch({ type: 'goto', stage: 'explore' })}
        >
          {buttons.toExplore}
        </button>
      </div>
      {state.selections.length === 0 && <p className="hint">관심 후보를 한 곳 이상 고르면 연구와 수업을 비교할 수 있습니다.</p>}
    </section>
  )
}
