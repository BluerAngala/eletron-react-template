import { appendFile, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'

/**
 * 统一日志系统（主进程侧）
 *
 * - 结构化输出：每条日志为 JSON 对象，便于检索与机器解析
 * - 四级日志：debug / info / warn / error
 * - 双重输出：开发环境彩色控制台 + 落盘 JSONL（按天轮转）
 * - 渲染进程日志通过 IPC 转发到这里统一落盘
 * - 支持读取 / 清空当天日志，并在新日志产生时广播给订阅者
 * - 敏感字段自动打码；日志文件按天轮转 + 按大小/天数自动清理
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  ts: string
  level: LogLevel
  scope: string
  message: string
  data?: Record<string, unknown>
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: '\x1b[90m', // gray
  info: '\x1b[36m', // cyan
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
}

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

/**
 * 敏感字段黑名单：命中 key 或嵌套路径中的字段会被打码。
 * 兼容常见命名（大小写不敏感、支持 snake_case / kebab-case 变体）。
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'access_token',
  'access-token',
  'refresh_token',
  'refresh-token',
  'api_key',
  'api-key',
  'apikey',
  'apiKey',
  'authorization',
  'auth',
  'cookie',
  'session',
  'private_key',
  'private-key',
  'client_secret',
  'client-secret',
])

const MASK = '[REDACTED]'

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase()
  return SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(normalized)
}

/** 递归打码 data 中的敏感字段（会修改对象本身） */
function redact(data: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 6) return data
  for (const key of Object.keys(data)) {
    const value = data[key]
    if (value === null || value === undefined) continue
    if (isSensitiveKey(key)) {
      data[key] = MASK
    } else if (typeof value === 'object') {
      redact(value as Record<string, unknown>, depth + 1)
    }
  }
  return data
}

/** 新日志广播订阅者（用于实时推送到渲染进程） */
const subscribers = new Set<(entry: LogEntry) => void>()

export function onLog(callback: (entry: LogEntry) => void): () => void {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

function getLogDir(): string {
  // 开发环境也写入 userData 下的 logs，与生产路径一致
  return path.join(app.getPath('userData'), 'logs')
}

function logFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.log`
}

function toIso(ts: Date): string {
  return ts.toISOString()
}

/**
 * 创建带作用域的 logger。
 * @param scope 日志作用域，如 `main`、`updater`、`renderer`
 * @param minLevel 最低输出级别（默认 info，debug 会被过滤）
 */
export function createLogger(scope: string, minLevel: LogLevel = 'info') {
  const shouldLog = (level: LogLevel) => LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel]

  const write = async (entry: LogEntry) => {
    if (!shouldLog(entry.level)) return

    // 打码敏感字段（深拷贝，避免污染调用方传入的对象）
    const safeEntry = entry.data ? { ...entry, data: redact(structuredClone(entry.data)) } : entry

    // 1. 控制台彩色输出
    const color = LEVEL_COLOR[safeEntry.level]
    const line = `${BOLD}${color}[${safeEntry.level.toUpperCase().padEnd(5)}]${RESET} ${color}${safeEntry.ts}${RESET} ${BOLD}[${safeEntry.scope}]${RESET} ${safeEntry.message}`
    console[safeEntry.level === 'debug' ? 'log' : safeEntry.level](line)
    if (safeEntry.data && Object.keys(safeEntry.data).length > 0) {
      console.log('    ', JSON.stringify(safeEntry.data))
    }

    // 2. 落盘 JSONL（异步，不阻塞主流程）
    void writeToFile(safeEntry)
  }

  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      void write({ ts: toIso(new Date()), level: 'debug', scope, message, data }),
    info: (message: string, data?: Record<string, unknown>) =>
      void write({ ts: toIso(new Date()), level: 'info', scope, message, data }),
    warn: (message: string, data?: Record<string, unknown>) =>
      void write({ ts: toIso(new Date()), level: 'warn', scope, message, data }),
    error: (message: string, data?: Record<string, unknown>) =>
      void write({ ts: toIso(new Date()), level: 'error', scope, message, data }),
  }
}

/** 供渲染进程日志 IPC 调用：直接落盘一条已格式化的日志 */
export async function writeLogEntry(entry: LogEntry): Promise<void> {
  const safeEntry = entry.data ? { ...entry, data: redact(structuredClone(entry.data)) } : entry
  await writeToFile(safeEntry)
}

/** 读取指定日期（默认今天）的日志，按时间正序返回；文件不存在时返回空数组 */
export async function readLogs(date = new Date()): Promise<LogEntry[]> {
  try {
    const file = path.join(getLogDir(), logFileName(date))
    const content = await readFile(file, 'utf8')
    return content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry
        } catch {
          return null
        }
      })
      .filter((entry): entry is LogEntry => entry !== null)
  } catch {
    return []
  }
}

/** 清空指定日期（默认今天）的日志文件 */
export async function clearLogs(date = new Date()): Promise<void> {
  const file = path.join(getLogDir(), logFileName(date))
  await rm(file, { force: true })
}

/** 单文件大小上限（字节），超过则清空重写，防止单个文件无限膨胀 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
/** 日志文件保留天数，超过将被清理 */
const MAX_KEEP_DAYS = 14

/** 清理节流：两次清理之间至少间隔 10 分钟，避免每次写入都扫描目录 */
let lastCleanAt = 0
const CLEAN_INTERVAL = 10 * 60 * 1000 // 10min

/** 清理策略：单文件超过大小上限则清空；日志文件超过保留天数则删除（带节流） */
export async function cleanLogs(keepDays = MAX_KEEP_DAYS): Promise<void> {
  const now = Date.now()
  if (now - lastCleanAt < CLEAN_INTERVAL) return
  lastCleanAt = now

  const logDir = getLogDir()
  try {
    const files = await readdir(logDir)
    const dayMs = 24 * 60 * 60 * 1000

    for (const file of files) {
      // 仅处理 YYYY-MM-DD.log 命名
      if (!/^\d{4}-\d{2}-\d{2}\.log$/.test(file)) continue
      const filePath = path.join(logDir, file)

      // 按保留天数清理
      const match = file.match(/^(\d{4})-(\d{2})-(\d{2})\.log$/)
      if (!match) continue
      const [, y, m, d] = match
      const fileDate = new Date(Number(y), Number(m) - 1, Number(d)).getTime()
      if (now - fileDate > keepDays * dayMs) {
        await rm(filePath, { force: true })
        continue
      }

      // 当天文件超大小上限则清空（保留文件，滚动重写）
      const today = logFileName(new Date())
      if (file === today) {
        const { size } = await stat(filePath)
        if (size > MAX_FILE_SIZE) {
          await rm(filePath, { force: true })
        }
      }
    }
  } catch {
    // 清理失败不阻塞日志写入
  }
}

async function writeToFile(entry: LogEntry): Promise<void> {
  try {
    const logDir = getLogDir()
    await mkdir(logDir, { recursive: true })
    const file = path.join(logDir, logFileName(new Date(entry.ts)))
    await appendFile(file, `${JSON.stringify(entry)}\n`, 'utf8')
    // 广播给订阅者（如日志页面实时刷新）
    subscribers.forEach((cb) => {
      try {
        cb(entry)
      } catch {
        /* 订阅者异常不影响日志写入 */
      }
    })
    // 周期性触发清理（每次写入后节流执行，避免频繁 IO）
    void cleanLogs()
  } catch (err) {
    // 文件写入失败时至少保证控制台可读
    console.error('[logger] 写入日志文件失败:', err)
  }
}

export type Logger = ReturnType<typeof createLogger>
