import { createContext, useContext, type ReactNode } from 'react'

interface UiApi {
  openMap: () => void
  openChat: () => void
  sendChat: (text: string) => void
}

const UiContext = createContext<UiApi | null>(null)

export function UiProvider({ value, children }: { value: UiApi; children: ReactNode }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi(): UiApi {
  const value = useContext(UiContext)
  if (!value) throw new Error('UiProvider가 필요합니다.')
  return value
}
