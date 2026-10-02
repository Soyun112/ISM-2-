import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { copy } from '../content/copy'
import { reducer } from '../domain/reducer'
import { loadAppState, saveAppState } from '../domain/storage'
import type { AppState } from '../domain/types'
import type { Action } from '../domain/reducer'

interface StoreValue {
  state: AppState
  dispatch: (action: Action) => void
  notice: string | null
  dismissNotice: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(() => loadAppState())
  const [state, dispatch] = useReducer(reducer, boot.state)
  const [notice, setNotice] = useState<string | null>(boot.notice)

  useEffect(() => {
    const saved = saveAppState(state)
    if (!saved) setNotice(copy.storageWriteFailed)
  }, [state])

  return (
    <StoreContext.Provider value={{ state, dispatch, notice, dismissNotice: () => setNotice(null) }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useApp(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('StoreProvider가 필요합니다.')
  return value
}
