import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Trash2, Pause, Play, ScrollText, Check } from 'lucide-react'
import { createLogger, type LogEntry } from '@/lib/logger'

const log = createLogger('logs')

type LevelFilter = 'all' | LogEntry['level']

const LEVEL_STYLES: Record<LogEntry['level'], { label: string; badge: string; text: string }> = {
  debug: {
    label: 'DEBUG',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400',
    text: 'text-slate-500 dark:text-slate-500',
  },
  info: {
    label: 'INFO',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
    text: 'text-slate-700 dark:text-slate-300',
  },
  warn: {
    label: 'WARN',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
  },
  error: {
    label: 'ERROR',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
}

const FILTERS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'debug', label: 'DEBUG' },
  { value: 'info', label: 'INFO' },
  { value: 'warn', label: 'WARN' },
  { value: 'error', label: 'ERROR' },
]

export function Logs() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<LevelFilter>('all')
  const [paused, setPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<LogEntry[]>([])

  // 加载历史日志
  useEffect(() => {
    let cancelled = false
    window.logAPI?.read().then((history) => {
      if (cancelled) return
      setEntries(history)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 订阅实时日志
  useEffect(() => {
    const unsubscribe = window.logAPI?.onLogEvent((entry) => {
      pendingRef.current.push(entry)
      if (paused) return
      setEntries((prev) => [...prev, ...pendingRef.current])
      pendingRef.current = []
    })
    return () => unsubscribe?.()
  }, [paused])

  // 自动滚动到底部
  useEffect(() => {
    if (paused) return
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries, paused])

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.level === filter)),
    [entries, filter],
  )

  const handleCopy = useCallback(async () => {
    const text = filtered.map((e) => JSON.stringify({ ...e, data: e.data ?? undefined })).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      log.error('copy-failed', {})
    }
  }, [filtered])

  const handleClear = useCallback(async () => {
    try {
      await window.logAPI?.clear()
      setEntries([])
      pendingRef.current = []
      log.info('logs-cleared', { by: 'log-page' })
    } catch {
      log.error('clear-failed', {})
    }
  }, [])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">运行日志</h1>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">
            {filtered.length} 条
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 级别筛选 */}
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === value
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 暂停滚动 */}
          <button
            onClick={() => setPaused((v) => !v)}
            title={paused ? '继续滚动' : '暂停滚动'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              paused
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? '继续' : '暂停'}
          </button>

          {/* 复制 */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? '已复制' : '复制'}
          </button>

          {/* 清空 */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        </div>
      </div>

      {/* 日志流 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white font-mono text-[13px] leading-6 dark:border-slate-700 dark:bg-slate-900/70"
      >
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            加载日志中…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            暂无日志
          </div>
        ) : (
          <div className="p-4">
            {filtered.map((entry, i) => {
              const style = LEVEL_STYLES[entry.level]
              return (
                <div
                  key={`${entry.ts}-${i}`}
                  className="flex items-start gap-3 border-b border-slate-100 py-1 last:border-0 dark:border-slate-800"
                >
                  <span className="shrink-0 text-slate-400 dark:text-slate-500">
                    {formatTime(entry.ts)}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="shrink-0 text-slate-500 dark:text-slate-400">
                    [{entry.scope}]
                  </span>
                  <span className={`min-w-0 flex-1 break-all ${style.text}`}>{entry.message}</span>
                  {entry.data && Object.keys(entry.data).length > 0 && (
                    <span className="shrink-0 text-slate-400 dark:text-slate-500">
                      {JSON.stringify(entry.data)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
