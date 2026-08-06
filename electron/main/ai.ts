import {
  type Credential,
  type CredentialInfo,
  type CredentialStore,
  createModels,
  type Message,
} from '@earendil-works/pi-ai'
import { anthropicProvider } from '@earendil-works/pi-ai/providers/anthropic'
import { deepseekProvider } from '@earendil-works/pi-ai/providers/deepseek'
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai'
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter'
import { xiaomiProvider } from '@earendil-works/pi-ai/providers/xiaomi'
import { ipcMain, type WebContents } from 'electron'
import Store from 'electron-store'
import { createLogger } from './logger'

const logger = createLogger('ai')

// ---------- 与渲染层共享的类型（IPC 载荷） ----------

/** 渲染进程会话消息（简化结构，timestamp 由主进程补齐） */
export interface AiRenderMessage {
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

/** 推送给渲染层的流式事件 */
export type AiEvent =
  | { type: 'text_delta'; requestId: string; delta: string }
  | { type: 'done'; requestId: string; text: string }
  | { type: 'error'; requestId: string; message: string; reason?: 'error' | 'aborted' }

export interface AiListEntry {
  provider: string
  name: string
  models: { id: string; name: string; reasoning: boolean; contextWindow?: number }[]
}

// ---------- API Key 持久化（electron-store，仅主进程持有） ----------
// 实现 pi-ai 的 CredentialStore 接口：key 按 provider 存储，绝不暴露给渲染层
const credentialStore: CredentialStore = (() => {
  const store = new Store({ name: 'ai-credentials' })
  const keyOf = (providerId: string) => `credentials.${providerId}`
  return {
    async read(providerId) {
      return store.get(keyOf(providerId)) as Credential | undefined
    },
    async list() {
      const data = store.store as Record<string, unknown>
      const prefix = 'credentials.'
      const out: CredentialInfo[] = []
      for (const key of Object.keys(data)) {
        if (key.startsWith(prefix)) {
          const cred = data[key] as Credential
          out.push({ providerId: key.slice(prefix.length), type: cred.type })
        }
      }
      return out
    },
    async modify(providerId, fn) {
      const current = store.get(keyOf(providerId)) as Credential | undefined
      const next = await fn(current)
      if (next !== undefined) store.set(keyOf(providerId), next)
      return next ?? current
    },
    async delete(providerId) {
      store.delete(keyOf(providerId))
    },
  }
})()

// ---------- 模型集合：按需注册厂商（保持 tree-shaking / 启动轻量） ----------
// 懒加载 + try/catch：万一 pi-ai 初始化异常，不影响应用启动（AI 功能降级为不可用）
let models: MutableModels | undefined
let modelsInitError: string | undefined

function getModels(): MutableModels | undefined {
  if (models === undefined && modelsInitError === undefined) {
    try {
      const m = createModels({ credentials: credentialStore })
      m.setProvider(openaiProvider())
      m.setProvider(anthropicProvider())
      m.setProvider(deepseekProvider())
      m.setProvider(xiaomiProvider())
      m.setProvider(openrouterProvider())
      models = m
    } catch (err) {
      modelsInitError = err instanceof Error ? err.message : String(err)
      logger.error('models-init-failed', { message: modelsInitError })
    }
  }
  return models
}

/** 进行中的请求：requestId -> AbortController */
const inflight = new Map<string, AbortController>()

function toContextMessages(messages: AiRenderMessage[]): Message[] {
  return messages.map((m) => ({ role: m.role, content: m.content, timestamp: Date.now() }))
}

function sendTo(sender: WebContents, event: AiEvent) {
  if (!sender.isDestroyed()) sender.send('ai:event', event)
}

async function runChat(requestId: string, req: AiChatRequest, sender: WebContents) {
  const controller = new AbortController()
  inflight.set(requestId, controller)

  const collection = getModels()
  if (!collection) {
    sendTo(sender, { type: 'error', requestId, message: modelsInitError ?? 'AI not initialized' })
    inflight.delete(requestId)
    return
  }

  try {
    const model = collection.getModel(req.provider, req.model)
    if (!model) {
      sendTo(sender, {
        type: 'error',
        requestId,
        message: `Model not found: ${req.provider}/${req.model}`,
      })
      return
    }

    const context = {
      systemPrompt: req.systemPrompt,
      messages: toContextMessages(req.messages),
    }

    const stream = collection.streamSimple(model, context, { signal: controller.signal })
    let text = ''
    for await (const event of stream) {
      if (event.type === 'text_delta') {
        text += event.delta
        sendTo(sender, { type: 'text_delta', requestId, delta: event.delta })
      }
    }

    const result = await stream.result()
    if (result.stopReason === 'error' || result.stopReason === 'aborted') {
      const reason = result.stopReason
      const message = result.errorMessage ?? (reason === 'aborted' ? 'aborted' : 'Request failed')
      sendTo(sender, { type: 'error', requestId, message, reason })
      logger.error('chat-error', { provider: req.provider, model: req.model, reason, message })
    } else {
      sendTo(sender, { type: 'done', requestId, text })
      logger.info('chat-done', { provider: req.provider, model: req.model, chars: text.length })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    sendTo(sender, { type: 'error', requestId, message })
    logger.error('chat-failed', { provider: req.provider, model: req.model, message })
  } finally {
    inflight.delete(requestId)
  }
}

/**
 * 注册 AI IPC 通道（只调用一次）：
 * - ai:chat      渲染层发起一次流式对话
 * - ai:abort     按 requestId 中断
 * - ai:list-models  列出已注册厂商与模型（供模型选择器）
 * - ai:set-key   持久化某厂商的 API Key（主进程持有）
 * - ai:auth-status  返回各厂商是否已配置 Key
 */
export function initAi() {
  ipcMain.on('ai:chat', (event, req: AiChatRequest) => {
    if (!req || typeof req !== 'object' || typeof req.requestId !== 'string') return
    void runChat(req.requestId, req, event.sender)
  })

  ipcMain.on('ai:abort', (_event, requestId: string) => {
    const controller = inflight.get(requestId)
    if (controller) controller.abort()
  })

  ipcMain.handle('ai:list-models', () => {
    const out: AiListEntry[] = []
    const collection = getModels()
    if (!collection) return out
    for (const provider of collection.getProviders()) {
      const list = collection
        .getModels(provider.id)
        .map((m) => ({
          id: m.id,
          name: m.name ?? m.id,
          reasoning: !!m.reasoning,
          contextWindow: m.contextWindow,
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
      if (list.length)
        out.push({ provider: provider.id, name: provider.name ?? provider.id, models: list })
    }
    return out
  })

  ipcMain.handle('ai:set-key', async (_event, provider: string, key: string) => {
    if (typeof provider !== 'string' || typeof key !== 'string') return false
    await credentialStore.modify(provider, async () => ({ type: 'api_key', key: key.trim() }))
    logger.info('key-saved', { provider })
    return true
  })

  ipcMain.handle('ai:auth-status', async () => {
    const info = await credentialStore.list()
    const keys = new Map(info.map((i) => [i.providerId, i.type]))
    const collection = getModels()
    if (!collection) return []
    return collection.getProviders().map((p) => ({ provider: p.id, configured: keys.has(p.id) }))
  })
}
