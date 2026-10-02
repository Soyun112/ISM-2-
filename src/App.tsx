import { AppErrorBoundary } from './components/AppErrorBoundary'
import { Shell } from './components/Shell'
import { StoreProvider } from './state/store'

export function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </AppErrorBoundary>
  )
}
