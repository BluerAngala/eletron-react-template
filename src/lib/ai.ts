/**
 * 渲染进程 AI 配置 API 类型（模型列表 / API Key 管理）。
 * 对话流由 assistant-ui 的 `window.assistantAI`（MessagePort 桥）承担。
 */

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
  listModels: () => Promise<AiListEntry[]>
  setKey: (provider: string, key: string) => Promise<boolean>
  authStatus: () => Promise<AiAuthStatus[]>
}

declare global {
  interface Window {
    ai?: AiApi
  }
}
