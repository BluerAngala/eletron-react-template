import type { PreloadFeatureRegistration } from '@electron-template/feature-contract'
import { contextBridge, ipcRenderer } from 'electron'
import { AI_STREAM_CHANNEL, type AiEvent, type AiRequest } from '../shared/protocol'

export function createPreloadFeature(): PreloadFeatureRegistration {
  return {
    expose() {
      contextBridge.exposeInMainWorld('aiChat', {
        listModels: () => ipcRenderer.invoke('feature-ai-chat:list-models') as Promise<unknown>,
        setKey: (provider: string, key: string) =>
          ipcRenderer.invoke('feature-ai-chat:set-key', provider, key) as Promise<boolean>,
        authStatus: () => ipcRenderer.invoke('feature-ai-chat:auth-status') as Promise<unknown>,
        stream(request: AiRequest, onEvent: (event: AiEvent) => void) {
          const { port1, port2 } = new MessageChannel()
          const onMessage = (event: MessageEvent<AiEvent>) => onEvent(event.data)
          port1.addEventListener('message', onMessage)
          port1.start()
          ipcRenderer.postMessage(AI_STREAM_CHANNEL, request, [port2])
          return () => {
            port1.removeEventListener('message', onMessage)
            port1.close()
          }
        },
      })
    },
  }
}
