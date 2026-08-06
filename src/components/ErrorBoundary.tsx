import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Copy } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const log = createLogger('error-boundary')

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('render-error', { message: error.message, stack: errorInfo.componentStack })
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleCopy = () => {
    const text = `${this.state.error?.message}\n\n${this.state.error?.stack}`
    navigator.clipboard.writeText(text)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-900">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  页面出错了
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">渲染过程中发生错误</p>
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-700/50">
              <p className="font-mono text-sm break-all text-red-600 dark:text-red-400">
                {this.state.error?.message}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-600"
              >
                <RotateCcw className="h-4 w-4" />
                重新加载
              </button>
              <button
                onClick={this.handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Copy className="h-4 w-4" />
                复制错误
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
