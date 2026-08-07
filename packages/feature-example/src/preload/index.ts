import type { PreloadFeatureRegistration } from '@electron-template/feature-contract'
import { contextBridge, ipcRenderer } from 'electron'
import { EXAMPLE_PING_CHANNEL } from '../shared/protocol'

export function createPreloadFeature(): PreloadFeatureRegistration {
  return {
    expose() {
      contextBridge.exposeInMainWorld('exampleBridge', {
        ping: () =>
          ipcRenderer.invoke(EXAMPLE_PING_CHANNEL) as Promise<{
            pong: boolean
            timestamp: string
          }>,
      })
    },
  }
}
