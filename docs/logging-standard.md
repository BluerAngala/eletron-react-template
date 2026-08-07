# 日志规范（Logging Standard）

本仓库为 Electron + React 桌面应用，日志系统覆盖**主进程（Node/Electron）**与**渲染进程（React）**，
采用统一的结构化日志标准，确保前后端开发时日志一致、可检索、可诊断。

---

## 1. 核心原则

| 原则 | 说明 |
|------|------|
| **结构化** | 每条日志是 JSON 对象，禁止裸字符串拼接 |
| **分级** | 四级：`debug` / `info` / `warn` / `error` |
| **有作用域** | 每条日志必须带 `scope`（如 `main`、`home`、`updater`） |
| **集中落盘** | 渲染进程日志经 IPC 转发到主进程统一写文件（JSONL） |
| **不记录敏感信息** | 禁止记录 token、密码、完整请求体等 |

---

## 2. 日志级别

| 级别 | 含义 | 何时使用 |
|------|------|----------|
| `debug` | 诊断细节 | 仅开发期；默认不输出到控制台 |
| `info` | 重要业务事件 | 页面访问、窗口创建、任务完成等 |
| `warn` | 降级但已处理 | 重试成功、回退路径、非致命异常 |
| `error` | 不变量被破坏 | 需要关注与排查的错误 |

---

## 3. 日志条目格式

落盘文件（`userData/logs/YYYY-MM-DD.log`）中每行一个 JSON：

```json
{
  "ts": "2026-08-06T07:00:00.000Z",
  "level": "info",
  "scope": "home",
  "message": "page-view",
  "data": { "greeting": "下午好", "ts": 1722927600000 }
}
```

| 字段 | 说明 |
|------|------|
| `ts` | ISO 8601 时间戳（UTC） |
| `level` | 日志级别 |
| `scope` | 来源作用域 |
| `message` | 稳定事件名（如 `page-view`、`window-created`），用 kebab-case |
| `data` | 可选结构化字段，用于检索与定位 |

---

## 4. 主进程使用

`app/electron/main/logger.ts` 提供 `createLogger(scope)`：

```ts
import { createLogger } from './logger'

const log = createLogger('main')

log.info('window-created', { width: 1200, height: 800 })
log.error('window-load-failed', { errorCode: -3, errorDescription: 'ERR_ABORTED' })
```

- 控制台：彩色格式化输出（便于开发时阅读）
- 落盘：`app.getPath('userData')/logs/` 下按天轮转的 JSONL 文件

---

## 5. 渲染进程使用

`app/renderer/lib/logger.ts` 提供 `createLogger(scope)`，内部经 preload 的 `window.logger` 转发到主进程统一落盘：

```ts
import { createLogger } from '@/lib/logger'

const log = createLogger('home')

log.info('page-view', { greeting })
log.warn('api-degraded', { retry: 2 })
```

- 纯浏览器环境（无 preload）时自动回退到 `console`，不会崩溃
- 不允许在渲染进程直接 `console.log` 替代统一日志；如需保留可同时输出

---

## 6. IPC 通道

| 通道 | 方向 | 说明 |
|------|------|------|
| `log:write` | 渲染进程 → 主进程 | 携带 `LogEntry`，主进程统一落盘 |
| `log:read` | 渲染进程 → 主进程 | 读取当天日志（日志页面） |
| `log:clear` | 渲染进程 → 主进程 | 清空当天日志（日志页面） |
| `log:event` | 主进程 → 渲染进程 | 新日志实时推送（日志页面订阅） |

主进程侧通过 `ipcMain.on('log:write', ...)` 接收，并做基础字段校验后写入。

---

## 7. 自动安全增强（自研内置）

### 7.1 敏感字段自动打码（Redaction）

写入日志前，`data` 中命中敏感 key 的字段会被自动替换为 `[REDACTED]`（大小写不敏感，
支持 `snake_case` / `kebab-case` 变体），递归覆盖嵌套对象（深度上限 6 层）：

```
password / passwd / pwd / secret / token / access_token / refresh_token
api_key / apikey / authorization / auth / cookie / session
private_key / client_secret ...
```

> 自动打码是**兜底**，开发者仍应遵守第 8 节红线，不要在日志里主动塞敏感信息。

### 7.2 日志轮转与清理

- 按天分文件：`logs/YYYY-MM-DD.log`
- 单文件超过 **10MB**：清空重写（保留文件名，滚动续写）
- 文件超过 **14 天**：自动删除
- 清理带节流（两次至少间隔 10 分钟），不阻塞日志写入

### 7.3 崩溃 / 未捕获异常兜底

主进程注册 `uncaughtException` 与 `unhandledRejection` 处理器，异常会以 `error` 级别
记录（含堆栈）后让进程继续运行，避免静默崩溃无法排查。

---

## 8. 事件命名约定

- 事件名（`message`）使用 **kebab-case**：`page-view`、`window-created`、`render-error`
- 不要用模板字符串拼接人话句子当事件名；事件名应当是稳定的、可被检索的
- 需要表述的补充信息放在 `data` 字段

---

## 9. 红线（禁止事项）

- ❌ 直接 `console.log` 输出无结构信息（异常情况除外，需注明）
- ❌ 记录密码、token、API Key、完整请求体（自动打码仅作兜底，不得依赖）
- ❌ 用用户 ID、原始 URL 等无界值作为 `data` 的高基数字段（应放在 message 或受限集合）
- ❌ 吞掉错误不记录（`catch` 里至少 `log.error`）

---

## 10. 日志文件位置与轮转

- macOS: `~/Library/Application Support/<appName>/logs/`
- Windows: `%APPDATA%\<appName>\logs\`
- Linux: `~/.config/<appName>/logs/`

按天轮转，文件名 `YYYY-MM-DD.log`；保留 14 天，单文件上限 10MB。
