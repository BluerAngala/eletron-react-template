import type { RendererFeatureRegistration } from '@electron-template/feature-contract'
import { Bot, KeyRound, Send, Settings, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import type { Provider } from './renderer/bridge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function AiChatPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  const currentProvider = providers.find((item) => item.provider === provider)

  useEffect(() => {
    if (!window.aiChat) {
      setError(
        'AI feature bridge is unavailable. Restart the Electron application after enabling this feature.',
      )
      return
    }
    void window.aiChat.listModels().then((items) => {
      setProviders(items)
      const first = items[0]
      if (first) {
        setProvider(first.provider)
        setModel(first.models[0]?.id ?? '')
      }
    })
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || running || !window.aiChat) return
    if (!provider || !model) {
      setError('Choose a provider and model first.')
      return
    }

    const history = [...messages, { id: crypto.randomUUID(), role: 'user' as const, content }]
    setMessages([...history, { id: crypto.randomUUID(), role: 'assistant', content: '' }])
    setInput('')
    setError('')
    setRunning(true)
    window.aiChat.stream({ provider, model, messages: history }, (event) => {
      if (event.type === 'delta') {
        setMessages((items) => {
          const last = items.at(-1)
          if (last?.role !== 'assistant') return items
          return [...items.slice(0, -1), { ...last, content: last.content + event.text }]
        })
      }
      if (event.type === 'error') {
        setError(event.message)
        setRunning(false)
      }
      if (event.type === 'done') setRunning(false)
    })
  }

  const saveKey = async () => {
    if (!window.aiChat || !provider || !key.trim()) return
    const saved = await window.aiChat.setKey(provider, key.trim())
    if (saved) {
      setKey('')
      setSettingsOpen(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-900 dark:bg-black dark:text-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <Bot className="size-5" />
        <select
          value={provider}
          onChange={(event) => {
            const next = event.target.value
            const nextProvider = providers.find((item) => item.provider === next)
            setProvider(next)
            setModel(nextProvider?.models[0]?.id ?? '')
          }}
          className="rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        >
          {providers.map((item) => (
            <option key={item.provider} value={item.provider}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(event) => setModel(event.target.value)}
          className="rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        >
          {(currentProvider?.models ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="ml-auto rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/10"
          title="AI settings"
        >
          <Settings className="size-4" />
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="m-auto text-center text-sm text-slate-500 dark:text-white/70">
            Start a conversation.
          </div>
        )}
        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === 'user'
                ? 'self-end rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/10'
                : 'whitespace-pre-wrap'
            }
          >
            {message.content || (running && message.role === 'assistant' ? '...' : '')}
          </article>
        ))}
        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
      </main>

      <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl gap-2 px-4 py-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Message AI"
          rows={1}
          className="min-h-10 flex-1 resize-none rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none dark:border-white/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || running}
          className="grid size-10 place-items-center rounded-lg bg-slate-900 text-white disabled:opacity-40 dark:bg-white dark:text-black"
          title="Send"
        >
          <Send className="size-4" />
        </button>
      </form>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <section className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">AI settings</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} title="Close">
                <X className="size-4" />
              </button>
            </div>
            <label
              htmlFor="feature-ai-chat-api-key"
              className="mb-2 flex items-center gap-2 text-sm"
            >
              <KeyRound className="size-4" /> API key for {currentProvider?.name ?? provider}
            </label>
            <input
              id="feature-ai-chat-api-key"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-white/20"
            />
            <button
              type="button"
              onClick={() => void saveKey()}
              className="mt-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Save key
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export function createRendererFeature(): RendererFeatureRegistration {
  return {
    routes: [{ path: 'ai', Component: AiChatPage }],
    navigation: [{ to: '/ai', icon: Bot, key: 'nav.ai', ns: 'ai' }],
    fullBleedPaths: ['/ai'],
    locales: {
      'zh-CN': { ai: zhCN },
      'en-US': { ai: enUS },
    },
  }
}
