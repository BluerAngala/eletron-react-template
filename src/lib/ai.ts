/**
 * 渲染进程 AI 能力类型（与主进程 electron/main/ai.ts 的 IPC 载荷对齐）
 * 通过 preload 暴露的 `window.ai` 与主进程的 pi-ai 桥接。
 */

/** 会话消息（简化结构，timestamp 由主进程补齐） */
export interface AiRenderMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatRequest {
  requestId: string
  provider: string
  model: string
  systemPrompt?: string
  messages: AiRenderMessage[]
}

/** 主进程推送的流式事件 */
export type AiEvent =
  | { type: 'text_delta'; requestId: string; delta: string }
  | { type: 'done'; requestId: string; text: string }
  | { type: 'error'; requestId: string; message: string; reason?: 'error' | 'aborted' }

export interface AiModelInfo {
  id: string
  name: string
  reasoning: boolean
  contextWindow?: number
}

export interface AiListEntry {
  provider: string
  name: string
  models: AiModelInfo[]
}

export interface AiAuthStatus {
  provider: string
  configured: boolean
}

export interface AiApi {
  chat: (req: AiChatRequest) => void
  abort: (requestId: string) => void
  listModels: () => Promise<AiListEntry[]>
  setKey: (provider: string, key: string) => Promise<boolean>
  authStatus: () => Promise<AiAuthStatus[]>
  onEvent: (listener: (event: AiEvent) => void) => () => void
}

declare global {
  interface Window {
    ai?: AiApi
  }
}
