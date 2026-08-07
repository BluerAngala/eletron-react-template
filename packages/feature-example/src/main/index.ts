import type { MainFeatureRegistration } from '@electron-template/feature-contract'
import { ipcMain } from 'electron'
import { EXAMPLE_PING_CHANNEL } from '../shared/protocol'

let initialized = false

export function createMainFeature(): MainFeatureRegistration {
  return {
    initialize() {
      if (initialized) return
      initialized = true
      // 演示：注册一个主进程 IPC，供渲染进程经 preload 桥调用
      ipcMain.handle(EXAMPLE_PING_CHANNEL, () => ({
        pong: true,
        timestamp: new Date().toISOString(),
      }))
    },
  }
}
