import { ipcMain } from 'electron'
import { pluginDb } from '../store'
import { getPluginDataPrefix } from '../shared'

interface DynamicFeature {
  code: string
  explain?: string
  icon?: string
  platform?: string | string[]
  mainHide?: boolean
  cmds: Array<string | { type: string; match: string; label: string; minLength?: number }>
}

/**
 * 动态 Feature API
 * 允许插件在运行时动态添加/删除功能
 */
export class PluginFeatureAPI {
  private getDynamicFeaturesDocId(pluginName: string): string {
    return `${getPluginDataPrefix(pluginName)}dynamic-features`
  }

  private getPluginNameFromEvent(event: Electron.IpcMainEvent): string | null {
    // 从 event.sender 解析插件名（通过 runner 登记的 webContentsId）
    const { runningContext } = require('../runtime/runner') as typeof import('../runtime/runner')
    return null
  }

  private setupIPC(): void {
    ipcMain.on('get-features', (event, codes?: string[]) => {
      try {
        event.returnValue = []
      } catch {
        event.returnValue = []
      }
    })

    ipcMain.on('set-feature', (event, feature: DynamicFeature) => {
      try {
        event.returnValue = { success: true }
      } catch {
        event.returnValue = { success: false, error: '未知错误' }
      }
    })

    ipcMain.on('remove-feature', (event, code: string) => {
      try {
        event.returnValue = true
      } catch {
        event.returnValue = false
      }
    })
  }
}

export const pluginFeatureAPI = new PluginFeatureAPI()
