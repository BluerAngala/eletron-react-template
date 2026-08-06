import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Pause,
  Play,
  ScrollText,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createLogger, type LogEntry } from '@/lib/logger'

const log = createLogger('logs')

type LevelFilter = 'all' | LogEntry['level']

/** 内存中最多保留的日志条数，超出后丢弃最旧的，防止无限增长 */
const MAX_ENTRIES = 2000

const LEVEL_STYLES: Record<LogEntry['level'], { badge: string; text: string }> = {
  debug: {
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400',
    text: 'text-slate-500 dark:text-slate-500',
  },
  info: {
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
    text: 'text-slate-700 dark:text-slate-300',
  },
  warn: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
  },
  error: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
}

const FILTERS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'debug', label: 'debug' },
  { value: 'info', label: 'info' },
  { value: 'warn', label: 'warn' },
  { value: 'error', label: 'error' },
]

export function Logs() {
  const { t } = useTranslation('logs')
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<LevelFilter>('all')
  const [paused, setPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // 默认折叠详情；expanded 记录被手动展开的条目
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  // 最近被复制单条的标识（用于按钮短暂显示“已复制”状态）
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<LogEntry[]>([])
  const rafRef = useRef<number | null>(null)
  const entriesRef = useRef<LogEntry[]>([])
  const pausedRef = useRef(paused)

  // 加载历史日志
  useEffect(() => {
    let cancelled = false
    window.logAPI?.read().then((history) => {
      if (cancelled) return
      setEntries(history)
      entriesRef.current = history
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 订阅实时日志：批量收集后用 rAF 合并更新，避免高频日志造成频繁重渲染
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const unsubscribe = window.logAPI?.onLogEvent((entry) => {
      pendingRef.current.push(entry)

      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const batch = pendingRef.current
        pendingRef.current = []
        if (pausedRef.current) return // 暂停时丢弃实时追加，历史仍可查

        const merged = [...entriesRef.current, ...batch]
        const trimmed = merged.length > MAX_ENTRIES ? merged.slice(-MAX_ENTRIES) : merged
        entriesRef.current = trimmed
        setEntries(trimmed)
      })
    })
    return () => {
      unsubscribe?.()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.level === filter)),
    [entries, filter],
  )

  // 虚拟滚动：只渲染可视区域的日志行，大量日志也不卡
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 30,
    overscan: 12,
  })

  // 自动滚动到底部（暂停时不滚动）
  useEffect(() => {
    if (paused || filtered.length === 0) return
    virtualizer.scrollToIndex(filtered.length - 1, { align: 'end' })
  }, [filtered.length, paused, virtualizer])

  const toggleExpand = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

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

  // 复制单条日志
  const handleCopyEntry = useCallback(async (entry: LogEntry) => {
    const text = JSON.stringify({ ...entry, data: entry.data ?? undefined })
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(entry.ts)
      setTimeout(() => setCopiedKey((cur) => (cur === entry.ts ? null : cur)), 1500)
    } catch {
      log.error('copy-failed', {})
    }
  }, [])

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
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">
            {t('count', { count: filtered.length })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 级别筛选 */}
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {FILTERS.map(({ value, label }) => (
              <button
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === value
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {label === 'all' ? t('filters.all') : label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* 暂停滚动 */}
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            title={paused ? t('actions.resume') : t('actions.pause')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              paused
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? t('actions.resume') : t('actions.pause')}
          </button>

          {/* 复制 */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t('actions.copied') : t('actions.copy')}
          </button>

          {/* 清空 */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('actions.clear')}
          </button>
        </div>
      </div>

      {/* 日志流（虚拟滚动） */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white font-mono text-[13px] dark:border-slate-700 dark:bg-slate-900/70"
      >
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {t('states.loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {t('states.empty')}
          </div>
        ) : (
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const entry = filtered[vi.index]
              if (!entry) return null
              const style = LEVEL_STYLES[entry.level]
              const hasData = entry.data && Object.keys(entry.data).length > 0
              const isExpanded = hasData && expanded.has(vi.index)
              return (
                <div
                  key={vi.key}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  {/* biome-ignore lint/a11y/useSemanticElements: 日志行是“整行可点击展开 + 内部操作按钮”的容器，role=group 语义合适 */}
                  <div
                    role="group"
                    tabIndex={hasData ? 0 : -1}
                    onClick={() => hasData && toggleExpand(vi.index)}
                    onKeyDown={(e) => {
                      if (hasData && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        toggleExpand(vi.index)
                      }
                    }}
                    className={`flex w-full items-start gap-2 border-b border-slate-100 px-3 py-1.5 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                      hasData ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className="shrink-0 pt-0.5 text-slate-400 dark:text-slate-500">
                      {formatTime(entry.ts)}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${style.badge}`}
                    >
                      {entry.level.toUpperCase()}
                    </span>
                    <span className="shrink-0 pt-0.5 text-slate-500 dark:text-slate-400">
                      [{entry.scope}]
                    </span>
                    <span className={`min-w-0 flex-1 break-all pt-0.5 ${style.text}`}>
                      {entry.message}
                    </span>
                    {/* 折叠时右侧显示部分内容预览 */}
                    {!isExpanded && hasData && (
                      <span className="max-w-[220px] shrink-0 truncate pt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {previewData(entry.data)}
                      </span>
                    )}
                    {/* 单条复制按钮（外层为可点展开的整行，用 role=button 避免嵌套 button） */}
                    <button
                      type="button"
                      title={t('actions.copy')}
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleCopyEntry(entry)
                      }}
                      className="inline-flex shrink-0 items-center rounded bg-transparent p-0.5 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                      {copiedKey === entry.ts ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {hasData &&
                      (isExpanded ? (
                        <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      ))}
                  </div>
                  {isExpanded && hasData && (
                    <pre className="whitespace-pre-wrap break-words border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
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

/** 折叠时右侧显示的内容预览：data 的 JSON 截断 */
function previewData(data: Record<string, unknown> | undefined): string {
  if (!data) return ''
  const text = JSON.stringify(data)
  const MAX = 80
  return text.length > MAX ? `${text.slice(0, MAX)}…` : text
}
