import type { Credential, CredentialStore, Message, MutableModels } from '@earendil-works/pi-ai'
import { createModels } from '@earendil-works/pi-ai'
import { deepseekProvider } from '@earendil-works/pi-ai/providers/deepseek'
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai'
import type { MainFeatureRegistration } from '@electron-template/feature-contract'
import { ipcMain, type MessagePortMain } from 'electron'
import Store from 'electron-store'
import { AI_STREAM_CHANNEL, type AiEvent, type AiRequest, isAiRequest } from '../shared/protocol'

const credentials: CredentialStore = (() => {
  const store = new Store({ name: 'feature-ai-chat-credentials' })
  return {
    read: async (provider) => store.get(`credentials.${provider}`) as Credential | undefined,
    list: async () =>
      Object.entries(store.get('credentials', {}) as Record<string, Credential>).map(
        ([providerId, credential]) => ({ providerId, type: credential.type }),
      ),
    modify: async (provider, update) => {
      const current = store.get(`credentials.${provider}`) as Credential | undefined
      const next = await update(current)
      if (next) store.set(`credentials.${provider}`, next)
      return next ?? current
    },
    delete: async (provider) => store.delete(`credentials.${provider}`),
  }
})()

let models: MutableModels | undefined

function getModels() {
  if (models) return models
  const collection = createModels({ credentials })
  collection.setProvider(openaiProvider())
  collection.setProvider(deepseekProvider())
  models = collection
  return collection
}

function toPiMessages(messages: AiRequest['messages']): Message[] {
  return messages.map((message) => ({ ...message, timestamp: Date.now() })) as Message[]
}

async function stream(request: AiRequest, port: MessagePortMain) {
  const controller = new AbortController()
  port.once('close', () => controller.abort())
  port.start()
  const send = (event: AiEvent) => port.postMessage(event)
  try {
    const model = getModels().getModel(request.provider, request.model)
    if (!model) throw new Error(`Model not found: ${request.provider}/${request.model}`)
    const response = getModels().streamSimple(
      model,
      {
        systemPrompt: request.system,
        messages: toPiMessages(request.messages),
      },
      { signal: controller.signal },
    )
    for await (const event of response) {
      if (event.type === 'text_delta') send({ type: 'delta', text: event.delta })
    }
    const result = await response.result()
    if (result.stopReason === 'error' || result.stopReason === 'aborted') {
      throw new Error(result.errorMessage ?? result.stopReason)
    }
    send({ type: 'done' })
  } catch (error) {
    send({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  } finally {
    port.close()
  }
}

export function createMainFeature(): MainFeatureRegistration {
  return {
    initialize() {
      ipcMain.on(AI_STREAM_CHANNEL, (event, request: unknown) => {
        const [port] = event.ports
        if (!port) return
        if (!isAiRequest(request)) {
          port.postMessage({ type: 'error', message: 'Invalid chat request.' } satisfies AiEvent)
          port.close()
          return
        }
        void stream(request, port)
      })

      ipcMain.handle('feature-ai-chat:list-models', () =>
        getModels()
          .getProviders()
          .map((provider) => ({
            provider: provider.id,
            name: provider.name ?? provider.id,
            models: getModels()
              .getModels(provider.id)
              .map((model) => ({ id: model.id, name: model.name ?? model.id }))
              .sort((left, right) => left.id.localeCompare(right.id)),
          })),
      )
      ipcMain.handle('feature-ai-chat:set-key', async (_event, provider: string, key: string) => {
        if (!provider || !key.trim()) return false
        await credentials.modify(provider, async () => ({ type: 'api_key', key: key.trim() }))
        return true
      })
      ipcMain.handle('feature-ai-chat:auth-status', async () => {
        const configured = new Set((await credentials.list()).map((entry) => entry.providerId))
        return getModels()
          .getProviders()
          .map((provider) => ({
            provider: provider.id,
            configured: configured.has(provider.id),
          }))
      })
    },
  }
}
