/**
 * assistant-ui 集成协议（Electron 本地主进程模式）
 *
 * 数据只走结构化克隆安全的结构（字符串/数组/普通对象），
 * 不跨 IPC 传 SDK 实例、AbortSignal、File 等对象。
 * 详见 https://www.assistant-ui.com/docs/guides/electron（Pattern 2）
 */

export const ASSISTANT_STREAM_CHANNEL = 'assistant:stream'

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

/** 渲染层经 preload 暴露的桥接 API（纯数据回调） */
export interface AssistantStreamBridge {
  streamChat(
    request: AssistantStreamRequest,
    onEvent: (event: AssistantStreamEvent) => void,
  ): () => void
}

/** 请求校验：只接受受限形状的纯数据载荷 */
export function isAssistantStreamRequest(value: unknown): value is AssistantStreamRequest {
  if (typeof value !== 'object' || value === null) return false
  const req = value as Record<string, unknown>
  if (typeof req.provider !== 'string' || typeof req.model !== 'string') return false
  if (!Array.isArray(req.messages) || req.messages.length > 200) return false
  if (req.system !== undefined && typeof req.system !== 'string') return false

  let totalLength = typeof req.system === 'string' ? req.system.length : 0
  for (const message of req.messages) {
    if (typeof message !== 'object' || message === null) return false
    const m = message as Record<string, unknown>
    if (m.role !== 'user' && m.role !== 'assistant') return false
    if (typeof m.content !== 'string') return false
    totalLength += m.content.length
    if (totalLength > 1_000_000) return false
  }
  return true
}
