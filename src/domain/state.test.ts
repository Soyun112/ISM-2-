import { describe, expect, it } from 'vitest'
import { labs } from '../content/labs'
import { recommendLabs } from './recommend'
import { createInitialState } from './initial'
import { compareOnSameGrid, createGrid } from './pathfinding'
import { reducer } from './reducer'
import { getStageStatus } from './status'
import { STORAGE_KEY, createMemoryStore, loadAppState, saveAppState } from './storage'
import type { AppState } from './types'

describe('exploration state', () => {
  it('keeps the full flow, then marks later work for review without deleting it', () => {
    let state = createInitialState()
    expect(getStageStatus('find', state)).toBe('not_started')

    state = reducer(state, { type: 'goto', stage: 'explore' })
    state = reducer(state, { type: 'goto', stage: 'experience' })
    state = reducer(state, { type: 'goto', stage: 'prepare' })
    expect(getStageStatus('explore', state)).toBe('not_started')
    expect(getStageStatus('experience', state)).toBe('not_started')
    expect(getStageStatus('prepare', state)).toBe('not_started')

    state = reducer(state, { type: 'set-interest', value: '길찾기' })
    state = reducer(state, { type: 'set-coursework', value: '알고리즘' })
    expect(getStageStatus('find', state)).toBe('in_progress')
    state = reducer(state, {
      type: 'recommend',
      recommendations: [
        { labId: 'lab-path', reason: '길찾기와 겹칩니다.', matchedTags: ['길찾기'], matchedOptionalTags: ['알고리즘'] },
      ],
    })
    state = reducer(state, { type: 'toggle-lab', labId: 'lab-path', reason: '길찾기와 겹칩니다.' })
    expect(getStageStatus('find', state)).toBe('completed')

    state = reducer(state, { type: 'confirm-explore' })
    state = reducer(state, { type: 'toggle-course', courseId: 'course-path-algo' })
    expect(getStageStatus('explore', state)).toBe('completed')

    const grid = createGrid(4, 4, [], { r: 0, c: 0 }, { r: 3, c: 3 })
    state = reducer(state, { type: 'set-maze-notes', prediction: '길이는 같을 것', observation: '칸 수는 다를 수 있다' })
    state = reducer(state, { type: 'set-maze-grid', grid })
    state = reducer(state, { type: 'set-maze-result', result: compareOnSameGrid(grid) })
    state = reducer(state, { type: 'save-maze' })
    expect(state.experiments).toHaveLength(1)
    expect(state.experiments[0].prediction).toBe('길이는 같을 것')
    expect(state.experiments[0].observation).toBe('칸 수는 다를 수 있다')
    expect(state.experiments[0].bfs.pathLength).toBe(6)
    expect(state.experiments[0].astar.pathLength).toBe(state.experiments[0].bfs.pathLength)
    expect(state.experiments[0].grid).not.toBe(state.mazeDraft.grid)
    expect(getStageStatus('experience', state)).toBe('completed')

    state = reducer(state, {
      type: 'patch-reflection',
      patch: { decision: 'explore-more', interesting: '탐색 범위를 비교한 점' },
    })
    state = reducer(state, { type: 'save-reflection' })
    expect(getStageStatus('prepare', state)).toBe('completed')

    state = reducer(state, {
      type: 'append-chat',
      messages: [
        { id: 'u1', role: 'user', text: '정리해줘', createdAt: '2026-10-03T00:00:00.000Z', stage: 'prepare', demo: false },
        { id: 'a1', role: 'assistant', text: '데모 응답입니다.', createdAt: '2026-10-03T00:00:00.000Z', stage: 'prepare', demo: true },
      ],
    })
    const selections = state.selections
    state = reducer(state, { type: 'goto', stage: 'find' })
    expect(state.selections).toEqual(selections)
    expect(state.experiments).toHaveLength(1)
    expect(state.messages).toHaveLength(2)
    expect(getStageStatus('prepare', state)).toBe('completed')

    state = reducer(state, { type: 'set-interest', value: '자연어 처리' })
    expect(getStageStatus('find', state)).toBe('needs_review')
    expect(getStageStatus('explore', state)).toBe('needs_review')
    expect(getStageStatus('experience', state)).toBe('needs_review')
    expect(getStageStatus('prepare', state)).toBe('needs_review')
    expect(state.experiments).toHaveLength(1)
    expect(state.experiments[0].observation).toBe('칸 수는 다를 수 있다')
    expect(state.savedCourseIds).toEqual(['course-path-algo'])
    expect(state.messages).toHaveLength(2)

    state = reducer(state, {
      type: 'recommend',
      recommendations: [
        { labId: 'lab-path', reason: '갱신된 이유', matchedTags: ['길찾기'], matchedOptionalTags: [] },
      ],
    })
    expect(state.selections[0].reason).toBe('갱신된 이유')
    expect(state.selections[0].interestAtSelection).toBe('자연어 처리')
    expect(getStageStatus('find', state)).toBe('completed')
    expect(getStageStatus('explore', state)).toBe('needs_review')
    expect(state.experiments).toHaveLength(1)

    state = reducer(state, { type: 'ack-stage', stage: 'experience' })
    expect(getStageStatus('experience', state)).toBe('completed')
    expect(state.experiments[0].interestField).toBe('길찾기')
  })

  it('does not save an experiment before it is run or an empty reflection', () => {
    const initial = createInitialState()
    expect(reducer(initial, { type: 'save-maze' }).experiments).toHaveLength(0)
    expect(reducer(initial, { type: 'save-reflection' }).prepareSaved).toBe(false)
    expect(reducer(initial, { type: 'confirm-explore' }).exploreConfirmed).toBe(false)
  })

  it('stores a no-path result from the algorithm and keeps the earlier record', () => {
    let state = withSavedOpenMap()
    const blocked = createGrid(3, 3, [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }], { r: 0, c: 0 }, { r: 2, c: 2 })
    state = reducer(state, { type: 'set-maze-grid', grid: blocked })
    state = reducer(state, { type: 'set-maze-result', result: compareOnSameGrid(blocked) })
    state = reducer(state, { type: 'save-maze' })
    expect(state.experiments).toHaveLength(2)
    expect(state.experiments[1].bfs.found).toBe(false)
    expect(state.experiments[1].astar.found).toBe(false)
    expect(state.experiments[1].bfs.pathLength).toBeNull()
    expect(state.experiments[1].astar.pathLength).toBeNull()
    expect(state.experiments[0].bfs.pathLength).toBe(6)
  })

  it('round-trips storage and survives a broken or older payload', () => {
    const state = reducer(withSavedOpenMap(), {
      type: 'append-chat',
      messages: [
        { id: 'u1', role: 'user', text: '이유', createdAt: '2026-10-03T00:00:00.000Z', stage: 'find', demo: false },
      ],
    })
    const memory = createMemoryStore()
    expect(saveAppState(state, memory)).toBe(true)
    const loaded = loadAppState(memory)
    expect(loaded.notice).toBeNull()
    expect(loaded.state.experiments).toHaveLength(1)
    expect(loaded.state.experiments[0].bfs.pathLength).toBe(6)
    expect(loaded.state.messages).toHaveLength(1)
    expect(loaded.state.interestField).toBe('길찾기')

    const broken = loadAppState(createMemoryStore({ [STORAGE_KEY]: '{oops' }))
    expect(broken.notice).toBeTruthy()
    expect(broken.state.selections).toEqual([])

    const foreign = loadAppState(createMemoryStore({ [STORAGE_KEY]: JSON.stringify({ version: 99, interestField: '유지되면 안 됨' }) }))
    expect(foreign.notice).toBeTruthy()
    expect(foreign.state.interestField).toBe('')

    const damaged = loadAppState(
      createMemoryStore({
        [STORAGE_KEY]: JSON.stringify({
          version: 1,
          interestField: '보안',
          selections: 'nope',
          experiments: [{ id: 'bad' }, state.experiments[0]],
          messages: [{ id: 'm', role: 'assistant', text: '데모', stage: 'nope' }],
        }),
      }),
    )
    expect(damaged.notice).toBeNull()
    expect(damaged.state.interestField).toBe('보안')
    expect(damaged.state.selections).toEqual([])
    expect(damaged.state.experiments).toHaveLength(1)
    expect(damaged.state.messages[0].stage).toBe('find')
    expect(damaged.state.messages[0].demo).toBe(true)
  })

  it('matches demo keywords without recommending from optional text alone', () => {
    const matched = recommendLabs(labs, { interestField: '길찾기', coursework: '알고리즘', wantToKnow: '' })
    expect(matched.some((item) => item.labId === 'lab-path')).toBe(true)
    expect(matched.find((item) => item.labId === 'lab-path')?.reason).toContain('길찾기')
    expect(matched.find((item) => item.labId === 'lab-path')?.reason).toContain('알고리즘')
    const security = recommendLabs(labs, { interestField: '보안', coursework: '', wantToKnow: '' })
    expect(security.some((item) => item.labId === 'lab-security')).toBe(true)
    expect(security.some((item) => item.labId === 'lab-path')).toBe(false)
    expect(recommendLabs(labs, { interestField: '양자중력', coursework: '', wantToKnow: '' })).toEqual([])
    expect(recommendLabs(labs, { interestField: '', coursework: '보안', wantToKnow: '' })).toEqual([])
  })
})

function withSavedOpenMap(): AppState {
  let state = createInitialState()
  state = reducer(state, { type: 'set-interest', value: '길찾기' })
  const grid = createGrid(4, 4, [], { r: 0, c: 0 }, { r: 3, c: 3 })
  state = reducer(state, { type: 'set-maze-grid', grid })
  state = reducer(state, { type: 'set-maze-result', result: compareOnSameGrid(grid) })
  return reducer(state, { type: 'save-maze' })
}
