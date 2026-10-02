import { useId } from 'react'
import { buttons, copy } from '../content/copy'
import { blockedGrid, compareOnSameGrid, emptyGrid, exampleGrid, toggleWall } from '../domain/pathfinding'
import type { Cell, Grid } from '../domain/types'
import { useApp } from '../state/store'
import { ExperimentHistory } from './ExperimentHistory'
import { GridView, formatPath } from './GridView'

export function MazeCompare({ labNames, question }: { labNames: string[]; question: string }) {
  const { state, dispatch } = useApp()
  const draft = state.mazeDraft
  const result = draft.result
  const predictionId = useId()
  const observationId = useId()

  function onToggle(cell: Cell) {
    const next = toggleWall(draft.grid, cell)
    if (next === draft.grid) return
    dispatch({ type: 'set-maze-grid', grid: next })
  }

  function run() {
    dispatch({ type: 'set-maze-result', result: compareOnSameGrid(draft.grid) })
  }

  const bothMissing = Boolean(result && !result.bfs.found && !result.astar.found)
  const bothFound = Boolean(result && result.bfs.found && result.astar.found)
  const sameLength = Boolean(
    bothFound && result && result.bfs.pathLength !== null && result.bfs.pathLength === result.astar.pathLength,
  )

  return (
    <section className="stack">
      <h3>미로 길찾기 비교</h3>
      <p className="question">{question}</p>
      <p className="hint">연결된 연구실: {labNames.join(', ')}. 시연용 가상 체험입니다.</p>
      <p className="hint">{copy.astarRule}</p>

      <div className="card stack">
        <h4>지도</h4>
        <p className="hint">칸을 눌러 장애물을 넣거나 뺍니다. 출발과 도착에는 장애물을 놓을 수 없습니다.</p>
        <div className="maze-scroll">
          <GridView grid={draft.grid} onToggle={onToggle} label="편집용 격자 지도" />
        </div>
        <div className="legend">
          <span><i className="swatch start" /> 출발</span>
          <span><i className="swatch goal" /> 도착</span>
          <span><i className="swatch wall" /> 장애물</span>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => dispatch({ type: 'set-maze-grid', grid: emptyGrid() })}>
            {buttons.resetMap}
          </button>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'set-maze-grid', grid: exampleGrid() })}>
            {buttons.exampleMap}
          </button>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'set-maze-grid', grid: blockedGrid() })}>
            {buttons.blockedMap}
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor={predictionId}>실험 전 예상</label>
        <textarea
          id={predictionId}
          value={draft.prediction}
          onChange={(event) => dispatch({ type: 'set-maze-notes', prediction: event.target.value })}
          placeholder="예: 장애물이 있으면 A*가 살펴보는 칸이 더 적을 것 같다"
        />
      </div>

      <div className="actions">
        <button type="button" className="btn primary" onClick={run}>
          {buttons.runSearch}
        </button>
      </div>

      {!result && <p className="empty">아직 비교를 실행하지 않았습니다.</p>}

      {result && (
        <div className="stack">
          {bothMissing && (
            <p className="banner warn" role="status">
              {copy.noPath}
            </p>
          )}
          {bothFound && (
            <p className="banner" role="status">
              {sameLength ? copy.sameLength : copy.differentLength}
            </p>
          )}
          {result.bfs.found !== result.astar.found && (
            <p className="banner warn" role="status">
              한 방법만 경로를 찾았습니다. 같은 지도와 이동 규칙에서는 둘 다 찾거나 둘 다 없어야 합니다.
            </p>
          )}
          <div className="grid-2">
            <ResultCard title={copy.bfsName} found={result.bfs.found} pathLength={result.bfs.pathLength} exploredCount={result.bfs.exploredCount} pathText={formatPath(result.bfs.path)} grid={draft.grid} explored={result.bfs.explored} path={result.bfs.path} />
            <ResultCard title={copy.astarName} found={result.astar.found} pathLength={result.astar.pathLength} exploredCount={result.astar.exploredCount} pathText={formatPath(result.astar.path)} grid={draft.grid} explored={result.astar.explored} path={result.astar.path} />
          </div>
          <p className="hint">{copy.exploredHelp}</p>
          <p className="hint">{copy.pathHelp}</p>
          <p className="hint">{copy.runtimeNote}</p>
          <div className="legend">
            <span><i className="swatch explored" /> 탐색한 칸</span>
            <span><i className="swatch path" /> 최종 경로</span>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor={observationId}>실험 후 관찰</label>
        <textarea
          id={observationId}
          value={draft.observation}
          onChange={(event) => dispatch({ type: 'set-maze-notes', observation: event.target.value })}
          placeholder="예: 경로 길이는 같았고, 살펴본 칸 수는 A*가 더 적었다"
        />
      </div>
      <div className="actions">
        <button type="button" className="btn primary" disabled={!result} onClick={() => dispatch({ type: 'save-maze' })}>
          {buttons.saveExperiment}
        </button>
      </div>
      {!result && <p className="hint">비교를 실행한 뒤 저장할 수 있습니다. 저장본에는 그때의 지도, 예상, 관찰, 결과가 함께 남습니다.</p>}

      <ExperimentHistory records={state.experiments.filter((item) => item.experienceId === 'maze-compare')} />
    </section>
  )
}

function ResultCard({
  title,
  found,
  pathLength,
  exploredCount,
  pathText,
  grid,
  explored,
  path,
}: {
  title: string
  found: boolean
  pathLength: number | null
  exploredCount: number
  pathText: string
  grid: Grid
  explored: Cell[]
  path: Cell[]
}) {
  return (
    <article className="card stack">
      <h4>{title}</h4>
      <dl className="stats">
        <div>
          <dt>경로 길이</dt>
          <dd>{found && pathLength !== null ? `${pathLength}번 이동` : '경로 없음'}</dd>
        </div>
        <div>
          <dt>탐색한 칸</dt>
          <dd>{exploredCount}</dd>
        </div>
      </dl>
      <div className="maze-scroll">
        <GridView grid={grid} explored={explored} path={path} label={`${title} 결과`} />
      </div>
      <p className="hint">경로 좌표: {pathText}</p>
    </article>
  )
}
