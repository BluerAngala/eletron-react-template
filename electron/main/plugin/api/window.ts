import { ipcMain, BrowserWindow } from 'electron'

/**
 * 窗口管理API - 插件专用
 */
export class PluginWindowAPI {
  private createdWindows = new Map<number, BrowserWindow>()

  public init(): void {
    this.setupIPC()
  }

  private setupIPC(): void {
    ipcMain.on(
      'createBrowserWindow',
      (event, args: { url: string; options?: Electron.BrowserWindowConstructorOptions }) => {
        const { url, options } = args || {}
        if (!url) {
          event.returnValue = null
          return
        }
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
        const winId = win.webContents.id
        this.createdWindows.set(winId, win)
        win.on('closed', () => this.createdWindows.delete(winId))
        win.loadURL(url)
        // 返回 Proxy 对象，支持 method/invoke 调用
        event.returnValue = {
          id: winId,
          webContents: { id: winId },
          window: win,
        }
      },
    )

    // 同步方法调用（如 win.close(), win.focus() 等）
    ipcMain.on(
      'pluginBrowserWindowMethod',
      (event, args: { id: number; method: string; args?: unknown[] }) => {
        const { id, method, args: methodArgs = [] } = args || {}
        const win = this.createdWindows.get(id)
        if (!win) {
          event.returnValue = { success: false, error: '窗口不存在' }
          return
        }
        try {
          const result = (win as any)[method](...methodArgs)
          event.returnValue = { success: true, result }
        } catch (e: any) {
          event.returnValue = { success: false, error: e.message }
        }
      },
    )

    // 异步方法调用（如 win.loadURL() 等）
    ipcMain.handle(
      'pluginBrowserWindowInvoke',
      async (_event, args: { id: number; method: string; args?: unknown[] }) => {
        const { id, method, args: methodArgs = [] } = args || {}
        const win = this.createdWindows.get(id)
        if (!win) return { success: false, error: '窗口不存在' }
        try {
          const result = await (win as any)[method](...methodArgs)
          return { success: true, result }
        } catch (e: any) {
          return { success: false, error: e.message }
        }
      },
    )

    // 子窗口 → 父窗口通信
    ipcMain.on('send-to-parent', (event, channel: string, ...args: unknown[]) => {
      const parentWin = BrowserWindow.fromWebContents(event.sender)
      if (parentWin) {
        parentWin.webContents.send(channel, ...args)
      }
    })

    ipcMain.handle('show-main-window', async () => false)
    ipcMain.handle('hide-main-window', async () => false)

    ipcMain.on(
      'ipc-send-to',
      (event, webContentsId: number, channel: string, ...args: unknown[]) => {
        for (const w of BrowserWindow.getAllWindows()) {
          if (!w.isDestroyed() && w.webContents.id === webContentsId) {
            w.webContents.send('__ipc_sendto_relay__', {
              senderId: event.sender.id,
              channel,
              args,
            })
            break
          }
        }
      },
    )
  }
}

export default new PluginWindowAPI()
