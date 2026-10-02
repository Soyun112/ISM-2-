import { useEffect, useRef } from 'react'
import { chatExamples, copy } from '../content/copy'
import { useApp } from '../state/store'

export function ChatDock({
  open,
  draft,
  onDraft,
  onSend,
  onClose,
}: {
  open: boolean
  draft: string
  onDraft: (value: string) => void
  onSend: (text: string) => void
  onClose: () => void
}) {
  const { state } = useApp()
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const examples = chatExamples[state.stage]

  useEffect(() => {
    if (!open) return
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [open, state.messages.length])

  if (!open) return null

  return (
    <aside className="chat" aria-label="공통 챗봇">
      <div className="chat-head">
        <h2>챗봇</h2>
        <span className="tag">{copy.chatDemo}</span>
        <button type="button" className="btn ghost" onClick={onClose}>
          {copy.closeChat}
        </button>
      </div>
      <p className="hint">{copy.chatDemoDetail}</p>
      <p className="hint">{copy.chatBoundary}</p>
      <div className="chat-log" ref={logRef} role="log" aria-live="polite">
        {state.messages.length === 0 && <p className="empty tight">예시 질문을 고르거나 직접 입력해 보세요.</p>}
        {state.messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'bubble user' : 'bubble assistant'}>
            {message.role === 'assistant' && <span className="tag">{copy.chatDemo}</span>}
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="chips" aria-label="질문 예시">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            className="chip"
            onClick={() => {
              onDraft(example)
              inputRef.current?.focus()
            }}
          >
            {example}
          </button>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSend(draft)
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          질문
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          value={draft}
          placeholder={copy.chatPlaceholder}
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend(draft)
            }
          }}
        />
        <button className="btn primary" type="submit" disabled={!draft.trim()}>
          {copy.send}
        </button>
      </form>
    </aside>
  )
}
