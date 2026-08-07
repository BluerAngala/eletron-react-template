import type { AiEvent, AiRequest } from '../shared/protocol'

export interface Model {
  id: string
  name: string
}

export interface Provider {
  provider: string
  name: string
  models: Model[]
}

export interface AiChatBridge {
  listModels(): Promise<Provider[]>
  setKey(provider: string, key: string): Promise<boolean>
  authStatus(): Promise<{ provider: string; configured: boolean }[]>
  stream(request: AiRequest, onEvent: (event: AiEvent) => void): () => void
}

declare global {
  interface Window {
    aiChat?: AiChatBridge
  }
}
