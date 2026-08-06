import { KeyRound, Settings, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ElectronRuntimeProvider } from '@/components/assistant/ElectronRuntimeProvider'
import { Sidebar } from '@/components/assistant/Sidebar'
import { ThreadView } from '@/components/assistant/ThreadView'
import type { AiAuthStatus, AiListEntry } from '@/lib/ai'
import { useAssistantConfig } from '@/lib/assistant-config'
import { createLogger } from '@/lib/logger'

const log = createLogger('ai-page')

// 紧凑控件：中性灰、无暖色（GPT 风格）
const selectCls =
  'h-8 rounded-lg border border-black/10 bg-transparent px-2 text-sm text-black outline-none transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-[#1f1f1f] dark:text-white dark:hover:bg-white/10'

const iconBtnCls =
  'flex h-8 w-8 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10 dark:hover:text-white'

export function AiChat() {
  const { t } = useTranslation('ai')
  const { provider, model, systemPrompt, setProvider, setModel, setSystemPrompt } =
    useAssistantConfig()

  const [providers, setProviders] = useState<AiListEntry[]>([])
  const [authStatus, setAuthStatus] = useState<AiAuthStatus[]>([])
  const [apiKey, setApiKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
  }, [setProvider, setModel])

  // 设置弹窗：Esc 关闭
  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen])

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

  const handleChangeProvider = (next: string) => {
    setProvider(next)
    const p = providers.find((x) => x.provider === next)
    if (p && p.models.length > 0) setModel(p.models[0].id)
  }

  return (
    <ElectronRuntimeProvider>
      <div className="flex h-full bg-white font-sans text-slate-900 dark:bg-black dark:text-white">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

        {/* 主区：顶部 toolbar + Thread */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 顶部 toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
            {!sidebarOpen && <span className="w-2" />}
            <select
              value={provider}
              onChange={(e) => handleChangeProvider(e.target.value)}
              className={selectCls}
              aria-label={t('provider')}
            >
              {providers.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={selectCls}
              aria-label={t('model')}
            >
              {(currentProvider?.models ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.reasoning ? ' 🧠' : ''}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={iconBtnCls}
                title={t('settings')}
              >
                <Settings className="size-4" />
              </button>
            </div>
          </div>

          {/* 设置弹窗（不挤压主界面） */}
          {settingsOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={t('settings')}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSettingsOpen(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSettingsOpen(false)
              }}
            >
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-[#1f1f1f]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {t('settings')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    title={t('close')}
                    className="flex size-7 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="ai-system-prompt"
                      className="mb-1 block text-xs font-medium text-slate-500 dark:text-white"
                    >
                      {t('systemPrompt')}
                    </label>
                    <textarea
                      id="ai-system-prompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-black/10 bg-transparent px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/60"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white">
                      <KeyRound className="size-3.5" />
                      {isConfigured ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {t('configured')}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          {t('notConfigured')}
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                      placeholder={t('apiKeyPlaceholder')}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/60"
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-white">{t('keyHint')}</p>

                  <button
                    type="button"
                    onClick={handleSaveKey}
                    disabled={!provider || !apiKey.trim()}
                    className="h-9 w-full rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-slate-300"
                  >
                    {keySaved ? t('saved') : t('saveKey')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thread 主体 */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ThreadView />
          </div>
        </div>
      </div>
    </ElectronRuntimeProvider>
  )
}
