import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, Boxes, Download, Check, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import { PluginDetailModal, type PluginDetailData } from '@/components/plugin/PluginDetailModal'

/** 简易插值：t('key', { count: 3 }) → 替换 {count} */
type Vars = Record<string, string | number>

export function formatT(raw: string, vars?: Vars): string {
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ''))
}

/** 将 file:// logo 转为 plugin-icon:// 协议，解决 http 主窗口下图片显示问题 */
export function logoUrl(url: string | undefined): string {
  return url ? url.replace(/^file:\/\//, 'plugin-icon://') : ''
}

interface PluginItem {
  name: string
  version: string
  title?: string
  description?: string
  logo?: string
  author?: string
  homepage?: string
  [key: string]: unknown
}

type DownloadState = Record<
  string,
  'downloading' | 'installing' | 'success' | 'error' | 'cancelled'
>

export function PluginMarket() {
  const { t } = useLanguage()
  const [plugins, setPlugins] = useState<PluginItem[]>([])
  const [installed, setInstalled] = useState<InstalledPluginInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [pulling, setPulling] = useState(false)
  const [downloads, setDownloads] = useState<DownloadState>({})
  const [detailPlugin, setDetailPlugin] = useState<PluginDetailData | null>(null)

  const installedNames = useMemo(() => new Set(installed.map((p) => p.name)), [installed])

  const refreshInstalled = async () => {
    try {
      const list = await window.plugin.listInstalled()
      setInstalled(list)
    } catch {
      // ignore
    }
  }

  const fetchMarket = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const result = await window.plugin.marketList()
      if (result.success) {
        setPlugins(result.data || [])
      } else {
        setError(result.error || t('market.failed'))
      }
    } catch {
      setError(t('market.failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 首屏加载插件市场与本机已装插件（数据拉取，非同步副作用）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMarket()
    void refreshInstalled()
    const unsubChanged = window.plugin.onPluginsChanged(() => {
      void refreshInstalled()
    })
    const unsubProgress = window.plugin.onDownloadProgress((payload) => {
      setDownloads((prev) => ({
        ...prev,
        [payload.pluginName]: payload.status as DownloadState[string],
      }))
      if (payload.status === 'success') {
        toast.success(formatT(t('market.toast.installed'), { title: payload.pluginName }))
        void refreshInstalled()
      } else if (payload.status === 'error') {
        toast.error(payload.error || t('market.error'))
      }
    })
    return () => {
      unsubChanged()
      unsubProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const install = async (plugin: { name: string; downloadUrl?: string }) => {
    if (installedNames.has(plugin.name)) return
    setDownloads((prev) => ({ ...prev, [plugin.name]: 'downloading' }))
    const result = await window.plugin.installFromMarket({ name: plugin.name })
    if (!result.success) {
      setDownloads((prev) => ({ ...prev, [plugin.name]: 'error' }))
      toast.error(result.error || t('market.error'))
    }
    await refreshInstalled()
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return plugins
    return plugins.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(kw) ||
        (p.name || '').toLowerCase().includes(kw) ||
        (p.description || '').toLowerCase().includes(kw) ||
        (p.author || '').toLowerCase().includes(kw),
    )
  }, [plugins, keyword])

  const stateFor = (name: string) => downloads[name]
  const installingNames = new Set(
    Object.keys(downloads).filter(
      (k) => downloads[k] === 'downloading' || downloads[k] === 'installing',
    ),
  )

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('market.title')}
          </h1>
          <span className="text-sm text-foreground-muted">
            （{formatT(t('myplugins.count'), { count: installed.length })} / 全部插件 {plugins.length} 个）
          </span>
        </div>
        <button
          onClick={() => {
            setPulling(true)
            window.plugin.marketClearCache().then(() => {
              void fetchMarket(true).finally(() => setPulling(false))
            })
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-accent/50 hover:text-accent"
        >
          <RefreshCw className={`h-4 w-4 ${pulling ? 'animate-spin' : ''}`} />
          {t('market.refresh')}
        </button>
      </div>

      {/* Search */}
      <div className="relative my-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('market.search')}
          className="w-full rounded-2xl border border-border-default bg-surface py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent/50 focus:outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-foreground-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-3 text-sm">{t('market.loading')}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-foreground-muted">
          <AlertTriangle className="h-10 w-10 text-accent" />
          <p className="mt-3 text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-foreground-muted">
          <Boxes className="h-10 w-10" />
          <p className="mt-3 text-sm">{t('market.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin) => {
            const isInstalled = installedNames.has(plugin.name)
            const state = stateFor(plugin.name)
            const isDownloading = installingNames.has(plugin.name)
            return (
              <div
                key={plugin.name}
                className="group flex flex-col rounded-3xl border border-border-default bg-surface/90 p-5 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.5)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.5)] cursor-pointer"
                onClick={() =>
                  setDetailPlugin({
                    name: plugin.name,
                    title: plugin.title,
                    version: plugin.version,
                    description: plugin.description,
                    author: plugin.author,
                    homepage: plugin.homepage,
                    logo: plugin.logo,
                    downloadUrl: plugin.downloadUrl as string | undefined,
                    downloadCount: plugin.downloadCount as number | undefined,
                    installed: installedNames.has(plugin.name),
                  })
                }
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-hover">
                    {plugin.logo ? (
                      <img
                        src={logoUrl(plugin.logo)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Boxes className="h-6 w-6 text-foreground-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {plugin.title || plugin.name}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-foreground-muted">
                      {plugin.author ? `${t('market.author')}: ${plugin.author}` : plugin.name}
                    </p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-foreground-secondary">
                  {plugin.description || '—'}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-foreground-muted">v{plugin.version}</span>
                  {isInstalled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1.5 text-xs font-medium text-accent">
                      <Check className="h-3.5 w-3.5" />
                      {t('market.installed')}
                    </span>
                  ) : isDownloading || state === 'success' ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover px-3 py-1.5 text-xs font-medium text-foreground-muted"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {state === 'installing' ? t('market.installing') : t('market.downloading')}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        void install(plugin)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:opacity-90"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t('market.install')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PluginDetailModal
        plugin={detailPlugin || { name: '' }}
        open={detailPlugin !== null}
        onClose={() => setDetailPlugin(null)}
        onInstall={() => {
          if (detailPlugin) install(detailPlugin)
        }}
        onLaunch={(p) => {
          void window.plugin.launch(p.path || '')
        }}
      />
    </>
  )
}

export default PluginMarket
