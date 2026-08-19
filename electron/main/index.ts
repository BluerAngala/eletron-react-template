import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import Store from 'electron-store'
import log from 'electron-log/main'
import { update } from './update'

// 初始化日志系统
log.initialize()

// 按环境设置日志级别
log.transports.file.level = app.isPackaged ? 'info' : 'silly'
log.transports.console.level = app.isPackaged ? 'info' : 'silly'

// 主进程启动日志
log.info('=== App starting ===')
log.info(`Version: ${app.getVersion()}`)
log.info(`Platform: ${process.platform} ${process.arch}`)
log.info(`Electron: ${process.versions.electron}`)

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

  log.info('Window created')
}

// IPC: 读取日志文件内容
ipcMain.handle('get-logs', async (_event, lines: number = 200) => {
  try {
    const fs = await import('node:fs/promises')
    const logPath = log.transports.file.getFile().path
    const content = await fs.readFile(logPath, 'utf-8')
    const allLines = content.split('\n').filter(Boolean)
    return allLines.slice(-lines).join('\n')
  } catch (err) {
    log.warn('Failed to read log file:', err)
    return ''
  }
})

// IPC: 获取日志文件路径
ipcMain.handle('get-log-path', () => {
  return log.transports.file.getFile().path
})

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
