import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import Store from 'electron-store'
import { update } from './update'
import { createLogger, readLogs, clearLogs, writeLogEntry, onLog, type LogEntry } from './logger'

const logger = createLogger('main')

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 强制 DevTools 使用中文，不弹语言选择
app.commandLine.appendSwitch('lang', 'zh-CN')

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32' && os.release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// 崩溃 / 未捕获异常兜底：记录到日志后继续运行（未捕获的异常不再让主进程静默崩溃）
process.on('uncaughtException', (error) => {
  logger.error('uncaught-exception', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  })
})

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled-rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  })
})

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// 窗口状态持久化
const windowStore = new Store({ name: 'window-state' })
const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 800
const MIN_WIDTH = 800
const MIN_HEIGHT = 600

function getWindowState() {
  const state = windowStore.get('bounds', null) as {
    x?: number
    y?: number
    width?: number
    height?: number
    isMaximized?: boolean
  } | null
  if (!state) return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
  return {
    x: state.x,
    y: state.y,
    width: Math.max(state.width || DEFAULT_WIDTH, MIN_WIDTH),
    height: Math.max(state.height || DEFAULT_HEIGHT, MIN_HEIGHT),
    isMaximized: state.isMaximized,
  }
}

function saveWindowState(win: BrowserWindow) {
  if (win.isMaximized()) {
    windowStore.set('bounds.isMaximized', true)
  } else {
    const bounds = win.getBounds()
    windowStore.set('bounds', { ...bounds, isMaximized: false })
  }
}

async function createWindow() {
  const windowState = getWindowState()

  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: windowState.width,
    height: windowState.height,
    ...(windowState.x !== undefined && { x: windowState.x }),
    ...(windowState.y !== undefined && { y: windowState.y }),
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    webPreferences: {
      preload,
    },
  })

  // 恢复最大化状态
  if (windowState.isMaximized) {
    win.maximize()
  }

  // 窗口关闭时保存状态
  win.on('close', () => {
    if (win) saveWindowState(win)
  })

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(indexHtml)
  }

  logger.info('window-created', {
    width: windowState.width,
    height: windowState.height,
    dev: !!VITE_DEV_SERVER_URL,
  })

  win.webContents.on('did-fail-load', (_e, errorCode, errorDescription) => {
    logger.error('window-load-failed', { errorCode, errorDescription })
  })

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// 渲染进程日志转发：统一落盘到主进程日志目录
ipcMain.on('log:write', (_event, entry: LogEntry) => {
  if (!entry || typeof entry !== 'object') return
  void writeLogEntry(entry)
})

// 日志页面：读取当天日志
ipcMain.handle('log:read', async () => {
  return await readLogs()
})

// 日志页面：清空当天日志
ipcMain.handle('log:clear', async () => {
  await clearLogs()
  logger.info('logs-cleared', { by: 'log-page' })
})

// 实时推送新日志到所有窗口（供日志页面订阅）
onLog((entry) => {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('log:event', entry)
    }
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
