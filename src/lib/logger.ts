/**
 * 渲染进程统一日志模块
 *
 * - 通过 preload 暴露的 `window.logger` 将日志转发到主进程统一落盘
 * - 若在纯浏览器环境（无 preload），自动回退到 console，保证不崩溃
 * - 用法：`const log = createLogger('home'); log.info('页面加载完成', { t: 1 })`
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** 与主进程 logger.ts 对齐的日志条目结构 */
export interface LogEntry {
  ts: string
  level: LogLevel
  scope: string
  message: string
  data?: Record<string, unknown>
}

export interface RendererLogger {
  debug: (message: string, data?: Record<string, unknown>) => void
  info: (message: string, data?: Record<string, unknown>) => void
  warn: (message: string, data?: Record<string, unknown>) => void
  error: (message: string, data?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    logger?: {
      debug: (scope: string, message: string, data?: Record<string, unknown>) => void
      info: (scope: string, message: string, data?: Record<string, unknown>) => void
      warn: (scope: string, message: string, data?: Record<string, unknown>) => void
      error: (scope: string, message: string, data?: Record<string, unknown>) => void
    }
    logAPI?: {
      read: () => Promise<LogEntry[]>
      clear: () => Promise<void>
      onLogEvent: (listener: (entry: LogEntry) => void) => () => void
    }
  }
}

/** 创建带作用域的渲染进程 logger */
export function createLogger(scope: string): RendererLogger {
  const bridge = window.logger
  const hasBridge = typeof bridge === 'object' && bridge !== null

  const emit = (level: LogLevel, message: string, data?: Record<string, unknown>) => {
    if (hasBridge && bridge) {
      bridge[level](scope, message, data)
      return
    }
    // 回退：无 preload 时输出到控制台
    const fn = console[level] ?? console.log
    fn(`[${scope}]`, message, data ?? '')
  }

  return {
    debug: (message, data) => emit('debug', message, data),
    info: (message, data) => emit('info', message, data),
    warn: (message, data) => emit('warn', message, data),
    error: (message, data) => emit('error', message, data),
  }
}

export type { LogLevel }
