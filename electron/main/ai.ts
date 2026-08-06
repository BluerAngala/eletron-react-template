import {
  type Credential,
  type CredentialInfo,
  type CredentialStore,
  createModels,
  type MutableModels,
} from '@earendil-works/pi-ai'
import { anthropicProvider } from '@earendil-works/pi-ai/providers/anthropic'
import { deepseekProvider } from '@earendil-works/pi-ai/providers/deepseek'
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai'
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter'
import { xiaomiProvider } from '@earendil-works/pi-ai/providers/xiaomi'
import { ipcMain } from 'electron'
import Store from 'electron-store'
import {
  ASSISTANT_STREAM_CHANNEL,
  type AssistantStreamEvent,
  type AssistantStreamRequest,
  isAssistantStreamRequest,
} from '../shared/assistant'
import { createLogger } from './logger'

const logger = createLogger('ai')

// ---------- 与渲染层共享的类型（IPC 载荷） ----------

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

/**
 * 通过 MessagePort 流式跑一次 pi-ai 对话（assistant-ui LocalRuntime 用）。
 * 端口关闭 → abort；事件只用结构化克隆安全的纯数据。
 */
async function runAssistantStream(request: AssistantStreamRequest, port: MessagePort) {
  const controller = new AbortController()
  port.once('close', () => controller.abort())
  port.start()
  const send = (event: AssistantStreamEvent) => port.postMessage(event)

  const collection = getModels()
  if (!collection) {
    send({ type: 'error', message: modelsInitError ?? 'AI not initialized' })
    port.close()
    return
  }

  try {
    const model = collection.getModel(request.provider, request.model)
    if (!model) {
      send({ type: 'error', message: `Model not found: ${request.provider}/${request.model}` })
      port.close()
      return
    }

    const context = {
      systemPrompt: request.system,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: Date.now(),
      })),
    }

    const stream = collection.streamSimple(model, context, { signal: controller.signal })
    let text = ''
    for await (const event of stream) {
      if (event.type === 'text_delta') {
        text += event.delta
        send({ type: 'delta', text: event.delta })
      }
    }

    const result = await stream.result()
    if (result.stopReason === 'error' || result.stopReason === 'aborted') {
      const reason = result.stopReason
      const message = result.errorMessage ?? (reason === 'aborted' ? 'aborted' : 'Request failed')
      send({ type: 'error', message })
      logger.error('assistant-error', {
        provider: request.provider,
        model: request.model,
        reason,
        message,
      })
    } else {
      send({ type: 'done' })
      logger.info('assistant-done', {
        provider: request.provider,
        model: request.model,
        chars: text.length,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    send({ type: 'error', message })
    logger.error('assistant-failed', { provider: request.provider, model: request.model, message })
  } finally {
    port.close()
  }
}

/**
 * 注册 AI IPC 通道（只调用一次）：
 * - assistant:stream  渲染层经 MessagePort 发起流式对话（assistant-ui 用）
 * - ai:list-models    列出已注册厂商与模型（供模型选择器）
 * - ai:set-key        持久化某厂商的 API Key（主进程持有）
 * - ai:auth-status    返回各厂商是否已配置 Key
 */
export function initAi() {
  ipcMain.on(ASSISTANT_STREAM_CHANNEL, (event, request: unknown) => {
    const [port] = event.ports
    if (!port) return
    if (!isAssistantStreamRequest(request)) {
      port.postMessage({
        type: 'error',
        message: 'Invalid chat request.',
      } satisfies AssistantStreamEvent)
      port.close()
      return
    }
    void runAssistantStream(request, port)
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
