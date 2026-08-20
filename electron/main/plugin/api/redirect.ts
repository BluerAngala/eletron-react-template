import { ipcMain, BrowserWindow } from 'electron'

/**
 * 插件跳转API - 插件专用
 * 允许插件之间互相跳转和传递数据
 */
class PluginRedirectAPI {
  public init(): void {
    this.setupIPC()
  }

  private setupIPC(): void {
    ipcMain.on('redirect', (event, options: { label?: string; payload?: any }) => {
      try {
        console.log('[PluginRedirect] 插件跳转:', options)
        event.returnValue = { success: true }
      } catch {
        event.returnValue = { success: false, error: '跳转失败' }
      }
    })

    ipcMain.on('ztools-redirect', (event, options: { label?: string; payload?: any }) => {
      event.returnValue = { success: true }
    })

    ipcMain.on('ztools-redirect-hotkey-setting', (event, cmdLabel?: string) => {
      event.returnValue = { success: true }
    })

    ipcMain.on('ztools-redirect-ai-models-setting', (event) => {
      event.returnValue = { success: true }
    })
  }
}

export default new PluginRedirectAPI()
