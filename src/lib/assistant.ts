/**
 * assistant-ui 桥的渲染层类型（与 electron/shared/assistant.ts 对齐）
 * preload 暴露的 `window.assistantAI` 类型声明。
 */

export interface AssistantStreamMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AssistantStreamRequest {
  system?: string
  provider: string
  model: string
  messages: AssistantStreamMessage[]
}

export type AssistantStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export interface AssistantStreamBridge {
  streamChat(
    request: AssistantStreamRequest,
    onEvent: (event: AssistantStreamEvent) => void,
  ): () => void
}

declare global {
  interface Window {
    assistantAI?: AssistantStreamBridge
  }
}
