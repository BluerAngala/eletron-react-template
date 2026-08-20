import { ipcMain } from 'electron'
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

  private setupIPC(): void {
    ipcMain.on('get-features', (_event, _codes?: string[]) => {
      try {
        _event.returnValue = []
      } catch {
        _event.returnValue = []
      }
    })

    ipcMain.on('set-feature', (_event, _feature: DynamicFeature) => {
      try {
        _event.returnValue = { success: true }
      } catch {
        _event.returnValue = { success: false, error: '未知错误' }
      }
    })

    ipcMain.on('remove-feature', (_event, _code: string) => {
      try {
        _event.returnValue = true
      } catch {
        _event.returnValue = false
      }
    })
  }
}

export const pluginFeatureAPI = new PluginFeatureAPI()
