import { Bot, KeyRound, Send, Square, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAiChat } from '@/hooks/useAiChat'
import type { AiAuthStatus, AiListEntry } from '@/lib/ai'
import { createLogger } from '@/lib/logger'

const log = createLogger('ai-page')

export function AiChat() {
  const { t } = useTranslation('ai')

  // 厂商 / 模型 / Key 状态
  const [providers, setProviders] = useState<AiListEntry[]>([])
  const [authStatus, setAuthStatus] = useState<AiAuthStatus[]>([])
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [input, setInput] = useState('')

  const { messages, streamingText, isStreaming, error, send, abort, reset } = useAiChat()

  useEffect(() => {
    log.info('page-view', { ts: Date.now() })
    let cancelled = false
    void Promise.all([
      window.ai?.listModels() ?? Promise.resolve([]),
      window.ai?.authStatus() ?? Promise.resolve([]),
    ])
      .then(([list, status]) => {
        if (cancelled) return
        setProviders(list)
        setAuthStatus(status)
        if (list.length > 0) {
          setProvider(list[0].provider)
          if (list[0].models.length > 0) setModel(list[0].models[0].id)
        }
      })
      .catch((err) => log.error('load-failed', { message: String(err) }))
    return () => {
      cancelled = true
    }
  }, [])

  const currentProvider = useMemo(
    () => providers.find((p) => p.provider === provider),
    [providers, provider],
  )
  const isConfigured = authStatus.find((s) => s.provider === provider)?.configured ?? false

  const handleSaveKey = async () => {
    if (!provider || !apiKey.trim()) return
    const ok = await window.ai?.setKey(provider, apiKey.trim())
    if (ok) {
      setKeySaved(true)
      setApiKey('')
      setAuthStatus((prev) =>
        prev.map((s) => (s.provider === provider ? { ...s, configured: true } : s)),
      )
      setTimeout(() => setKeySaved(false), 1500)
      log.info('key-saved', { provider })
    }
  }

  const handleSend = () => {
    const text = input
    if (text.trim()) {
      send(text.trim(), { provider, model, systemPrompt: systemPrompt.trim() || undefined })
      setInput('')
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Bot className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t('clear')}
        </button>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-[260px_1fr]">
        {/* 配置面板 */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <label
              htmlFor="ai-provider"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              {t('provider')}
            </label>
            <select
              id="ai-provider"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value)
                const p = providers.find((x) => x.provider === e.target.value)
                if (p && p.models.length > 0) setModel(p.models[0].id)
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {providers.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-model"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              {t('model')}
            </label>
            <select
              id="ai-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {(currentProvider?.models ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.reasoning ? ' 🧠' : ''}
                </option>
              ))}
            </select>
            {currentProvider && currentProvider.models.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{t('noModels')}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="ai-system-prompt"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              {t('systemPrompt')}
            </label>
            <textarea
              id="ai-system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <KeyRound className="h-3.5 w-3.5" />
              {isConfigured ? (
                <span className="text-emerald-600 dark:text-emerald-400">{t('configured')}</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">{t('notConfigured')}</span>
              )}
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              placeholder={t('apiKeyPlaceholder')}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              disabled={!provider || !apiKey.trim()}
              className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {keySaved ? t('saved') : t('saveKey')}
            </button>
            {!isConfigured && <p className="text-xs text-slate-400">{t('keyHint')}</p>}
          </div>
        </div>

        {/* 对话面板 */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !isStreaming && (
              <p className="mt-10 text-center text-sm text-slate-400">{t('empty')}</p>
            )}
            {messages.map((m) => (
              <div
                key={m.id ?? `${m.role}-${m.content.slice(0, 24)}`}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isStreaming && streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                  {streamingText}
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cyan-500 align-middle" />
                </div>
              </div>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {t('error')}: {error}
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!isStreaming) handleSend()
                  }
                }}
                rows={2}
                placeholder={t('placeholder')}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={abort}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-slate-700 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
                >
                  <Square className="h-4 w-4" />
                  {t('stop')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || !model}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-cyan-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {t('send')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
