import {
  ipcMain,
  app,
  BrowserWindow,
  shell,
  clipboard,
  Notification,
  dialog,
  screen,
} from 'electron'
import { pluginDb } from './store'
import { getPluginDataPrefix } from './shared'
import type { RunningPlugin } from './runner'

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

/**
 * 返回当前插件应使用的数据前缀。
 * 根据 sender 解析所属插件；无归属则返回宿主前缀。
 */
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
    // 去除前缀
    docs = docs.map((d) => ({ ...d, _id: String(d._id).slice(prefix.length) }))
    event.returnValue = docs as unknown
  })
  ipcMain.on('db:post-attachment', (event, id, attachment) => {
    // 附件简化实现：以 base64 存入文档附件字段
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
}

// ── 基础插件 API 服务（经 plugin.api 分发）──
function registerBaseServices(): void {
  registerService('getPath', (event, args) => {
    try {
      const name = args as unknown as string
      return app.getPath(name as any)
    } catch {
      return ''
    }
  })
  registerService('showOpenDialog', (event, args) => {
    const opts = (args || {}) as any
    return (
      dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: opts.filters,
      }) || null
    )
  })
  registerService('showSaveDialog', (event, args) => {
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
  registerService('get-app-version', () => {
    return app.getVersion()
  })
  registerService('show-toast', (event, args) => {
    const { message, type } = (args || {}) as any
    const win = BrowserWindow.fromId(event.sender.id)
    win?.webContents.send('plugin-toast', { message, type: type || 'info' })
    return { success: true }
  })
  registerService('show-notification', (event, args) => {
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
}

// ── 独立 IPC 通道（preload 直接调用，不走 plugin.api）──
function registerStandaloneIpc(): void {
  ipcMain.on('copy-text', (_event, text) => {
    clipboard.writeText(String(text ?? ''))
  })
  ipcMain.on('copy-image', (_event, image) => {
    if (image) clipboard.writeImage(image)
  })
  ipcMain.on('copy-file', (_event, filePath) => {
    if (filePath) clipboard.writeBuffer('filenames', Buffer.from(String(filePath)))
  })
  ipcMain.on('get-copyed-files', () => {
    /* 简化：不提供文件读取 */
  })
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
  ipcMain.on('get-os-type', (event) => {
    event.returnValue = process.platform
  })
  ipcMain.on('get-plugin-entry', (event) => {
    // 由 preload 同步获取插件自身识别信息
    const pluginName = resolvePrefixForSender(event)
      .replace(/^PLUGIN\//, '')
      .replace(/\/$/, '')
    event.returnValue = pluginName ? { name: pluginName } : null
  })
  ipcMain.handle('plugin:show-toast', (_event, args) => {
    const payload = args || {}
    // 转发到宿主主窗口
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
  ipcMain.handle('out-plugin', (event, _isKill) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.close()
    }
    return true
  })
}

/**
 * 初始化插件 API：注册 plugin.api 分发器、数据库插件 API、基础服务与独立 IPC。
 */
export function initPluginRuntime(): void {
  // 统一分发器
  ipcMain.on('plugin.api', (event, apiName, args) => {
    const handler = services[apiName]
    if (!handler) {
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
  ipcMain.handle('plugin.api', async (event, apiName, args) => {
    const handler = services[apiName]
    if (!handler) {
      throw new Error(`API "${apiName}" not found`)
    }
    return handler(event, args)
  })
  registryPluginDbApis()
  registerBaseServices()
  registerStandaloneIpc()
}
