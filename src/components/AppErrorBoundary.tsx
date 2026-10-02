import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page">
          <p className="banner warn" role="alert">
            화면을 표시하지 못했습니다. 저장된 기록이 있다면 브라우저에 남아 있습니다. 새로고침 후 다시 시도해 주세요.
          </p>
        </main>
      )
    }
    return this.props.children
  }
}
