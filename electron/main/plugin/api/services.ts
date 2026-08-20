/**
 * 插件 API 统一注册表
 *
 * 维护完整的 API 服务列表，所有插件 API 的处理函数集中注册在此。
 * 支持同步（ipcSendSync）和异步（ipcInvoke）两种调用方式。
 * 通过统一的 plugin.api IPC 通道分发。
 */
import {
  ipcMain,
  app,
  clipboard,
  Notification,
  dialog,
  screen,
  nativeImage,
  nativeTheme,
  shell,
  BrowserWindow,
  desktopCapturer,
} from 'electron'
import { pluginDb } from '../store'
import { getPluginDataPrefix } from '../shared'
import type { RunningPlugin } from '../runtime/runner'

type ApiHandler = (
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
  args: unknown,
) => unknown

const services: Record<string, ApiHandler> = {}

export function registerService(name: string, handler: ApiHandler): void {
  if (services[name]) {
    console.warn(`[plugin.api] API "${name}" overwritten`)
  }
  services[name] = handler
}

let runningContext: {
  getRunning: () => RunningPlugin[]
} = { getRunning: () => [] }

export function bindRunningContext(ctx: { getRunning: () => RunningPlugin[] }): void {
  runningContext = ctx
}

function resolvePrefixForSender(
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
): string {
  const running = runningContext.getRunning()
  const match = running.find((p) => p.webContentsId === event.sender.id)
  return match ? getPluginDataPrefix(match.name) : 'ZTOOLS/'
}

// ── 数据库插件 API（含插件前缀隔离）──
function registryPluginDbApis(): void {
  ipcMain.on('db:put', (event, doc) => {
    const prefix = resolvePrefixForSender(event)
    const target = { ...doc, _id: prefix + doc._id }
    event.returnValue = pluginDb.put(target) as unknown
  })
  ipcMain.on('db:get', (event, id) => {
    const prefix = resolvePrefixForSender(event)
    const target = prefix + id
    const doc = pluginDb.get(target)
    event.returnValue = (doc ? { ...doc, _id: id } : null) as unknown
  })
  ipcMain.on('db:remove', (event, docOrId) => {
    const prefix = resolvePrefixForSender(event)
    const id = typeof docOrId === 'string' ? docOrId : docOrId?._id
    const result = pluginDb.remove(prefix + id)
    event.returnValue = result as unknown
  })
  ipcMain.on('db:bulk-docs', (event, docs) => {
    const prefix = resolvePrefixForSender(event)
    const results = docs.map((d: any) => pluginDb.put({ ...d, _id: prefix + d._id }))
    event.returnValue = results as unknown
  })
  ipcMain.on('db:all-docs', (event, key) => {
    const prefix = resolvePrefixForSender(event)
    const prefixToQuery = Array.isArray(key) ? key.map((k: string) => prefix + k) : prefix
    let docs = pluginDb.allDocs(prefixToQuery as string | string[])
    docs = docs.map((d) => ({ ...d, _id: String(d._id).slice(prefix.length) }))
    event.returnValue = docs as unknown
  })
  ipcMain.on('db:post-attachment', (event, id, attachment) => {
    const prefix = resolvePrefixForSender(event)
    const docId = prefix + id
    const existing = pluginDb.get(docId)
    pluginDb.put({
      ...existing,
      _id: docId,
      attachment: Buffer.isBuffer(attachment) ? attachment.toString('base64') : attachment,
      attachmentType: 'binary',
    })
    event.returnValue = { ok: true, id: docId }
  })
  ipcMain.on('db:get-attachment', (event, id) => {
    const prefix = resolvePrefixForSender(event)
    const doc = pluginDb.get(prefix + id)
    event.returnValue = (doc && doc.attachment ? doc.attachment : null) as unknown
  })
  ipcMain.on('db:get-attachment-type', (event, id) => {
    const prefix = resolvePrefixForSender(event)
    const doc = pluginDb.get(prefix + id)
    event.returnValue = (doc ? doc.attachmentType : null) as unknown
  })
  ipcMain.on('db-storage:set-item', (event, key, value) => {
    const prefix = resolvePrefixForSender(event)
    const existing = pluginDb.get(prefix + key)
    pluginDb.put({ ...existing, _id: prefix + key, value })
    event.returnValue = undefined
  })
  ipcMain.on('db-storage:get-item', (event, key) => {
    const prefix = resolvePrefixForSender(event)
    const doc = pluginDb.get(prefix + key)
    event.returnValue = (doc ? doc.value : null) as unknown
  })
  ipcMain.on('db-storage:remove-item', (event, key) => {
    const prefix = resolvePrefixForSender(event)
    pluginDb.remove(prefix + key)
    event.returnValue = undefined
  })
  // 异步数据库 API
  ipcMain.handle('db:put', async (_event, doc) => pluginDb.put(doc))
  ipcMain.handle('db:get', async (_event, id) => pluginDb.get(id))
  ipcMain.handle('db:remove', async (_event, docOrId) => {
    const id = typeof docOrId === 'string' ? docOrId : docOrId?._id
    return pluginDb.remove(id)
  })
  ipcMain.handle('db:bulk-docs', async (_event, docs) => {
    return docs.map((d: any) => pluginDb.put(d))
  })
  ipcMain.handle('db:all-docs', async (_event, key) => pluginDb.allDocs(key))
}

// ── 基础插件 API 服务 ──
function registerBaseServices(): void {
  registerService('getPath', (_event, args) => {
    try {
      const name = args as unknown as string
      return app.getPath(name as any)
    } catch {
      return ''
    }
  })
  registerService('showOpenDialog', (_event, args) => {
    const opts = (args || {}) as any
    return (
      dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: opts.filters,
      }) || null
    )
  })
  registerService('showSaveDialog', (_event, args) => {
    const opts = (args || {}) as any
    const result = dialog.showSaveDialogSync({
      filters: opts.filters,
      defaultPath: opts.defaultPath,
    })
    return result || null
  })
  registerService('getPrimaryDisplay', () => screen.getPrimaryDisplay())
  registerService('getAllDisplays', () => screen.getAllDisplays())
  registerService('getCursorScreenPoint', () => screen.getCursorScreenPoint())
  registerService('getWebContentsId', (event) => event.sender.id)
  registerService('is-dev', () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  registerService('get-app-version', () => app.getVersion())
  registerService('show-toast', (_event, args) => {
    const { message, type } = (args || {}) as any
    const allWindows = BrowserWindow.getAllWindows()
    for (const w of allWindows) {
      if (!w.isDestroyed()) {
        w.webContents.send('plugin-toast', { message, type: type || 'info' })
      }
    }
    return { success: true }
  })
  registerService('show-notification', (_event, args) => {
    const body = (args || {}) as any
    try {
      const notif = new Notification({
        title: body?.title || '插件提示',
        body: body?.body || body?.content || '',
      })
      notif.show()
    } catch {
      // ignore
    }
    return { success: true }
  })
  registerService('get-current-webcontents-id', (event) => event.sender.id)
  registerService('getUser', () => null)
  registerService('getUserTempToken', async () => null)
  registerService('getThemeInfo', () => ({
    isDark: false,
    primaryColor: '#6366f1',
    customColor: null,
    windowMaterial: 'mica',
  }))
}

// ── 独立 IPC 通道 ──
function registerStandaloneIpc(): void {
  // 剪贴板
  ipcMain.on('copy-text', (_event, text) => {
    clipboard.writeText(String(text ?? ''))
  })
  ipcMain.on('copy-image', (_event, image) => {
    if (image) {
      try {
        let nativeImg: Electron.NativeImage | undefined
        if (typeof image === 'string') {
          if (image.startsWith('data:image/')) {
            nativeImg = nativeImage.createFromDataURL(image)
          } else {
            nativeImg = nativeImage.createFromPath(image)
          }
        } else if (Buffer.isBuffer(image) || image instanceof Uint8Array) {
          nativeImg = nativeImage.createFromBuffer(Buffer.from(image))
        }
        if (nativeImg && !nativeImg.isEmpty()) {
          clipboard.writeImage(nativeImg)
        }
      } catch {
        // ignore
      }
    }
  })
  ipcMain.on('copy-file', (_event, filePath) => {
    if (filePath) clipboard.writeBuffer('filenames', Buffer.from(String(filePath)))
  })
  ipcMain.on('get-copyed-files', (event) => {
    event.returnValue = []
  })

  // Shell
  ipcMain.on('shell-open-external', (_event, url) => {
    if (typeof url === 'string') void shell.openExternal(url)
  })
  ipcMain.on('shell-open-path', (_event, p) => {
    if (typeof p === 'string') void shell.openPath(p)
  })
  ipcMain.on('shell-show-item-in-folder', (_event, p) => {
    if (typeof p === 'string') shell.showItemInFolder(p)
  })
  ipcMain.on('shell-beep', () => {
    shell.beep()
  })

  // 平台信息
  ipcMain.on('get-os-type', (event) => {
    event.returnValue = process.platform
  })
  ipcMain.handle('get-os-type', async () => process.platform)

  // 插件入口信息
  ipcMain.on('get-plugin-entry', (event) => {
    const pluginName = resolvePrefixForSender(event)
      .replace(/^PLUGIN\//, '')
      .replace(/\/$/, '')
    event.returnValue = pluginName ? { name: pluginName } : null
  })

  // Toast / Notification
  ipcMain.handle('plugin:show-toast', (_event, args) => {
    const payload = args || {}
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) {
        w.webContents.send('plugin-toast', payload)
      }
    }
    return { success: true }
  })
  ipcMain.handle('show-notification', (_event, body) => {
    try {
      const notif = new Notification({
        title: body?.title || '插件提示',
        body: body?.body || body?.content || '',
      })
      notif.show()
    } catch {
      // ignore
    }
    return { success: true }
  })

  // 插件窗口管理
  ipcMain.handle('out-plugin', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
    return true
  })
  ipcMain.on('get-native-id', (event) => {
    event.returnValue = app.getUUID()
  })
  ipcMain.on('get-app-version', (event) => {
    event.returnValue = app.getVersion()
  })
  ipcMain.on('get-window-type', (event) => {
    event.returnValue = 'plugin'
  })
  ipcMain.on('is-dark-colors', (event) => {
    event.returnValue = nativeTheme.shouldUseDarkColors
  })
  ipcMain.on('get-path', (event, name) => {
    try {
      event.returnValue = app.getPath(name as any)
    } catch {
      event.returnValue = ''
    }
  })
  ipcMain.on('show-save-dialog', (event, options) => {
    const result = dialog.showSaveDialogSync(options)
    event.returnValue = result || null
  })
  ipcMain.on('show-open-dialog', (event, options) => {
    const result = dialog.showOpenDialogSync(options)
    event.returnValue = result || null
  })

  // 屏幕截图
  ipcMain.handle('screen-capture', async () => {
    const { screenCapture } = await import('./screenCapture')
    const result = await screenCapture()
    return result
  })

  // 屏幕取色
  ipcMain.handle('screen-color-pick', async () => {
    return { success: false, hex: null, rgb: null }
  })

  // 显示器
  ipcMain.on('get-primary-display', (event) => {
    event.returnValue = screen.getPrimaryDisplay()
  })
  ipcMain.on('get-all-displays', (event) => {
    event.returnValue = screen.getAllDisplays()
  })
  ipcMain.on('get-cursor-screen-point', (event) => {
    event.returnValue = screen.getCursorScreenPoint()
  })
  ipcMain.on('get-display-nearest-point', (event, point) => {
    event.returnValue = screen.getDisplayNearestPoint(point)
  })
  ipcMain.on('dip-to-screen-point', (event, point) => {
    event.returnValue = screen.dipToScreenPoint(point)
  })
  ipcMain.on('dip-to-screen-rect', (event, rect) => {
    if (process.platform === 'darwin') {
      event.returnValue = rect
      return
    }
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      event.returnValue = screen.dipToScreenRect(win, rect)
    } else {
      event.returnValue = rect
    }
  })
  ipcMain.on('screen-to-dip-point', (event, point) => {
    event.returnValue = screen.screenToDipPoint(point)
  })
  ipcMain.handle('desktop-capture-sources', async (_event, options) => {
    try {
      return await desktopCapturer.getSources(options)
    } catch {
      return []
    }
  })

  // 模拟输入
  ipcMain.handle('send-input-event', async (_event, inputEvent) => {
    return { success: false, error: '需要原生模块支持' }
  })
  ipcMain.on('simulate-keyboard-tap', (event, key, modifiers) => {
    event.returnValue = false
  })
  ipcMain.on('simulate-mouse-move', (event, x, y) => {
    event.returnValue = false
  })
  ipcMain.on('simulate-mouse-click', (event, x, y) => {
    event.returnValue = false
  })
  ipcMain.on('simulate-mouse-double-click', (event, x, y) => {
    event.returnValue = false
  })
  ipcMain.on('simulate-mouse-right-click', (event, x, y) => {
    event.returnValue = false
  })

  // 窗口管理
  ipcMain.handle('show-main-window', async () => false)
  ipcMain.handle('hide-main-window', async () => false)
  ipcMain.on('hide-main-window-paste-text', (event, text) => {
    event.returnValue = false
  })
  ipcMain.on('hide-main-window-paste-image', (event, image) => {
    event.returnValue = false
  })
  ipcMain.on('hide-main-window-paste-file', (event, filePath) => {
    event.returnValue = false
  })
  ipcMain.on('hide-main-window-type-string', (event, text) => {
    event.returnValue = false
  })

  // 子输入框（UI 相关，在独立窗口模式下 stub）
  ipcMain.handle('set-sub-input', async () => false)
  ipcMain.handle('remove-sub-input', async () => false)
  ipcMain.handle('set-sub-input-value', async () => false)
  ipcMain.on('sub-input-focus', (event) => { event.returnValue = false })
  ipcMain.on('sub-input-blur', (event) => { event.returnValue = false })
  ipcMain.on('sub-input-select', (event) => { event.returnValue = false })
  ipcMain.handle('set-expend-height', async () => false)

  // 动态 Feature
  ipcMain.on('get-features', (event, codes) => { event.returnValue = [] })
  ipcMain.on('set-feature', (event, feature) => { event.returnValue = false })
  ipcMain.on('remove-feature', (event, code) => { event.returnValue = false })

  // 剪贴板历史（stub）
  ipcMain.handle('clipboard:get-history', async () => ({ items: [], total: 0 }))
  ipcMain.handle('clipboard:search', async () => [])
  ipcMain.handle('clipboard:delete', async () => false)
  ipcMain.handle('clipboard:clear', async () => false)
  ipcMain.handle('clipboard:get-status', async () => ({ enabled: false }))
  ipcMain.handle('clipboard:write', async () => false)
  ipcMain.handle('clipboard:write-content', async () => false)
  ipcMain.handle('clipboard:update-config', async () => false)

  // 创建浏览器窗口
  ipcMain.on('createBrowserWindow', (event, args) => {
    const { url, options } = args || {}
    if (!url) { event.returnValue = null; return }
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      ...options,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: false,
        ...options?.webPreferences,
      },
    })
    win.loadURL(url)
    event.returnValue = { id: win.webContents.id, webContents: { id: win.webContents.id }, window: win }
  })

  // 转发 IPC（sendTo polyfill）
  ipcMain.on('ipc-send-to', (event, webContentsId, channel, ...args) => {
    const allWindows = BrowserWindow.getAllWindows()
    for (const w of allWindows) {
      if (!w.isDestroyed() && w.webContents.id === webContentsId) {
        w.webContents.send('__ipc_sendto_relay__', {
          senderId: event.sender.id,
          channel,
          args,
        })
        break
      }
    }
  })

  // 插件内查找
  ipcMain.handle('find-in-page', (event, text, options) => {
    try {
      const wc = event.sender
      if (wc.isDestroyed()) return { success: false, error: '页面已销毁' }
      const requestId = wc.findInPage(text, options)
      return { success: true, requestId }
    } catch {
      return { success: false, error: '查找失败' }
    }
  })
  ipcMain.handle('stop-find-in-page', (event, action) => {
    try {
      event.sender.stopFindInPage(action)
      return { success: true }
    } catch {
      return { success: false }
    }
  })
}

// ── 统一分发器 ──
function initPluginApiDispatcher(): void {
  // 同步分发
  ipcMain.on('plugin.api', (event, apiName: string, args: unknown) => {
    const handler = services[apiName]
    if (!handler) {
      console.warn(`[plugin.api] API "${apiName}" not found`)
      event.returnValue = new Error(`API "${apiName}" not found`)
      return
    }
    try {
      const result = handler(event, args)
      if (event.returnValue === undefined && result !== undefined) {
        event.returnValue = result
      }
    } catch (e) {
      if (event.returnValue === undefined) {
        event.returnValue = e instanceof Error ? e : new Error(String(e))
      }
    }
  })

  // 异步分发
  ipcMain.handle('plugin.api', async (event, apiName: string, args: unknown) => {
    const handler = services[apiName]
    if (!handler) throw new Error(`API "${apiName}" not found`)
    return handler(event, args)
  })
}

/**
 * 初始化插件 API 运行时
 */
export function initPluginRuntime(): void {
  initPluginApiDispatcher()
  registryPluginDbApis()
  registerBaseServices()
  registerStandaloneIpc()
}