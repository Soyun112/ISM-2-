import { useEffect, useRef, useState } from 'react'
import { buildChatContext } from '../chat/context'
import { getResponder } from '../chat'
import { copy } from '../content/copy'
import { createId } from '../domain/id'
import type { StageId } from '../domain/types'
import { useApp } from '../state/store'
import { ChatDock } from './ChatDock'
import { ExploreMap } from './ExploreMap'
import { ProgressBar } from './ProgressBar'
import { StageExperience } from './StageExperience'
import { StageExplore } from './StageExplore'
import { StageFind } from './StageFind'
import { StagePrepare } from './StagePrepare'
import { UiProvider } from './ui-context'

export function Shell() {
  const { state, dispatch, notice, dismissNotice } = useApp()
  const [chatOpen, setChatOpen] = useState(() => window.matchMedia('(min-width: 961px)').matches)
  const [showMap, setShowMap] = useState(false)
  const [draft, setDraft] = useState('')
  const [resetAsk, setResetAsk] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.title = copy.serviceName
  }, [])

  useEffect(() => {
    document.getElementById('main')?.focus()
    window.scrollTo({ top: 0 })
  }, [state.stage, showMap])

  useEffect(() => {
    if (resetAsk) cancelRef.current?.focus()
  }, [resetAsk])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (resetAsk) {
        setResetAsk(false)
        return
      }
      if (showMap) {
        setShowMap(false)
        return
      }
      setChatOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetAsk, showMap])

  function sendChat(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const reply = getResponder().reply(trimmed, buildChatContext(state))
    const now = new Date().toISOString()
    dispatch({
      type: 'append-chat',
      messages: [
        { id: createId('user'), role: 'user', text: trimmed, createdAt: now, stage: state.stage, demo: false },
        { id: createId('bot'), role: 'assistant', text: reply, createdAt: now, stage: state.stage, demo: true },
      ],
    })
    setDraft('')
    setChatOpen(true)
  }

  function openStage(stage: StageId) {
    dispatch({ type: 'goto', stage })
    setShowMap(false)
  }

  return (
    <UiProvider value={{ openMap: () => setShowMap(true), openChat: () => setChatOpen(true), sendChat }}>
      <a className="skip" href="#main">
        본문으로
      </a>
      <div className="page">
        <header className="topbar">
          <div>
            <p className="badge">{copy.demoBadge}</p>
            <h1>{copy.serviceName}</h1>
            <p className="hint">{copy.tagline}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="btn" aria-pressed={showMap} onClick={() => setShowMap((open) => !open)}>
              {copy.mapButton}
            </button>
            <button
              type="button"
              className="btn"
              aria-expanded={chatOpen}
              onClick={() => setChatOpen((open) => !open)}
            >
              {chatOpen ? copy.closeChat : copy.chatButton}
            </button>
            <button type="button" className="btn ghost" onClick={() => setResetAsk(true)}>
              {copy.reset}
            </button>
          </div>
        </header>
        {notice && (
          <div className="banner warn" role="status">
            <p>{notice}</p>
            <button type="button" className="btn" onClick={dismissNotice}>
              닫기
            </button>
          </div>
        )}
        <ProgressBar mapOpen={showMap} onSelect={openStage} />
        <div className={chatOpen ? 'workspace with-chat' : 'workspace'}>
          <main id="main" className="main-panel" tabIndex={-1}>
            {showMap ? <ExploreMap onOpen={openStage} /> : <CurrentStage stage={state.stage} />}
          </main>
          {chatOpen && <button type="button" className="chat-backdrop" aria-label={copy.closeChat} onClick={() => setChatOpen(false)} />}
          <ChatDock open={chatOpen} draft={draft} onDraft={setDraft} onSend={sendChat} onClose={() => setChatOpen(false)} />
        </div>
      </div>
      {resetAsk && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div className="card stack">
            <h2 id="reset-title">{copy.resetTitle}</h2>
            <p>{copy.resetBody}</p>
            <div className="actions">
              <button ref={cancelRef} type="button" className="btn" onClick={() => setResetAsk(false)}>
                {copy.cancel}
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  dispatch({ type: 'reset' })
                  setShowMap(false)
                  setDraft('')
                  setResetAsk(false)
                }}
              >
                {copy.resetConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </UiProvider>
  )
}

function CurrentStage({ stage }: { stage: StageId }) {
  if (stage === 'explore') return <StageExplore />
  if (stage === 'experience') return <StageExperience />
  if (stage === 'prepare') return <StagePrepare />
  return <StageFind />
}
