import { useState, useEffect, useRef } from 'react'
import {
  RefreshCw,
  Trash2,
  FolderOpen,
  Copy,
  Check,
  Search,
  Download,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'all'

interface ParsedLog {
  raw: string
  level: LogLevel
  time: string
  message: string
}

function parseLogLine(line: string): ParsedLog {
  const timeMatch = line.match(/\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\]/)
  const levelMatch = line.match(/\[(error|warn|info|debug|verbose|silly)\]/i)

  let level: LogLevel = 'info'
  if (levelMatch) {
    const l = levelMatch[1].toLowerCase()
    if (l === 'error') level = 'error'
    else if (l === 'warn') level = 'warn'
    else if (l === 'info') level = 'info'
    else level = 'debug'
  } else if (line.toLowerCase().includes('error')) level = 'error'
  else if (line.toLowerCase().includes('warn')) level = 'warn'

  return {
    raw: line,
    level,
    time: timeMatch?.[1] ?? '',
    message: line,
  }
}

const LEVEL_STYLES: Record<LogLevel, { badge: string; text: string }> = {
  error: { badge: 'bg-red-500/15 text-red-500', text: 'text-red-400' },
  warn: { badge: 'bg-amber-500/15 text-amber-500', text: 'text-amber-400' },
  info: { badge: 'bg-cyan-500/15 text-cyan-500', text: 'text-foreground-secondary' },
  debug: { badge: 'bg-slate-500/15 text-slate-400', text: 'text-foreground-muted' },
  all: { badge: '', text: '' },
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
  debug: 'DEBUG',
  all: 'ALL',
}

export function LogViewer() {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<ParsedLog[]>([])
  const [logPath, setLogPath] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filter, setFilter] = useState<LogLevel>('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    try {
      const content = await window.ipcRenderer.invoke('get-logs', 500)
      if (typeof content === 'string' && content) {
        setLogs(content.split('\n').filter(Boolean).map(parseLogLine))
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    }
  }

  // 初始加载
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [content, p] = await Promise.all([
          window.ipcRenderer.invoke('get-logs', 500),
          window.ipcRenderer.invoke('get-log-path'),
        ])
        if (cancelled) return
        if (typeof content === 'string' && content) {
          setLogs(content.split('\n').filter(Boolean).map(parseLogLine))
        }
        if (typeof p === 'string') setLogPath(p)
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(fetchLogs, 2000)
    return () => clearInterval(timer)
  }, [autoRefresh])

  // 自动滚到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, filter, search])

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.level !== filter) return false
    if (search && !log.raw.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const levelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleCopy = async () => {
    const text = filteredLogs.map((l) => l.raw).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('log.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    const text = filteredLogs.map((l) => l.raw).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('log.exported'))
  }

  const handleClear = () => {
    setLogs([])
    toast.success(t('log.cleared'))
  }

  const handleRefresh = () => {
    fetchLogs()
    toast.success(t('log.refreshed'))
  }

  return (
    <section className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground-muted">
            {t('log.title')}
          </h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
            {filteredLogs.length}/{logs.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-surface-hover p-2 text-foreground-muted transition hover:bg-border-default hover:text-foreground active:scale-95"
            title={t('log.refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-surface-hover p-2 text-foreground-muted transition hover:bg-border-default hover:text-foreground active:scale-95"
            title={t('log.copy')}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg bg-surface-hover p-2 text-foreground-muted transition hover:bg-border-default hover:text-foreground active:scale-95"
            title={t('log.export')}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg bg-surface-hover p-2 text-foreground-muted transition hover:bg-red-500/10 hover:text-red-500 active:scale-95"
            title={t('log.clear')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-3">
        {/* 搜索 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('log.search')}
            className="w-full rounded-lg border border-border-default bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>

        {/* 级别筛选 */}
        <div className="relative">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-foreground-secondary transition hover:border-accent/50"
          >
            {filter === 'all' ? t('log.allLevels') : LEVEL_LABELS[filter]}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showFilters && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg">
              {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setFilter(level)
                    setShowFilters(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-hover ${
                    filter === level ? 'text-accent' : 'text-foreground-secondary'
                  }`}
                >
                  <span>{level === 'all' ? t('log.allLevels') : LEVEL_LABELS[level]}</span>
                  {level !== 'all' && (
                    <span className="text-xs text-foreground-muted">{levelCounts[level] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 自动刷新 */}
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition active:scale-95 ${
            autoRefresh
              ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/20'
              : 'bg-surface-hover text-foreground-secondary hover:bg-border-default'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-foreground-muted'}`}
          />
          {autoRefresh ? t('log.auto') : t('log.manual')}
        </button>
      </div>

      {/* 日志路径 */}
      {logPath && (
        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-foreground-muted">
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-mono">{logPath}</span>
        </div>
      )}

      {/* 日志内容 */}
      <div
        ref={containerRef}
        className="h-80 resize-y overflow-auto rounded-xl border border-border-default bg-surface [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground-muted/40 [&::-webkit-scrollbar-thumb:hover]:bg-foreground-muted/70 [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ minHeight: '200px', maxHeight: '600px' }}
      >
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-border-default">
            {filteredLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-2.5 transition hover:bg-surface-hover"
              >
                {/* 级别徽标 */}
                <span
                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${LEVEL_STYLES[log.level].badge}`}
                >
                  {LEVEL_LABELS[log.level]}
                </span>
                {/* 时间 */}
                {log.time && (
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] text-foreground-muted">
                    {log.time}
                  </span>
                )}
                {/* 内容 */}
                <span
                  className={`min-w-0 flex-1 break-all font-mono text-xs leading-6 ${LEVEL_STYLES[log.level].text}`}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-muted">
            <Search className="mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">{t('log.empty')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
