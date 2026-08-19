import { httpGet } from './http'
import { pluginDb } from './store'

export const PLUGIN_MARKET_API_BASE = 'https://z-tools.top/api/market'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 分钟缓存
let marketCache: { data: MarketPlugin[]; timestamp: number } | null = null

export interface MarketPlugin {
  name: string
  version: string
  title?: string
  description?: string
  logo?: string
  author?: string
  homepage?: string
  size?: number
  downloadCount?: number
  updatedAt?: number
  publishedAt?: number
  categoryId?: number | null
  categoryTitle?: string
  [key: string]: unknown
}

export interface PluginMarketResult {
  success: boolean
  data?: MarketPlugin[]
  storefront?: unknown
  error?: string
}

const RECOMMEND_LIMIT = 12

/**
 * 插件市场 API（匿名模式）。
 * 从 ZTools 线上市场拉取插件列表，数据写回本地缓存以便离线降级。
 */
class PluginMarket {
  async fetchPluginMarket(): Promise<PluginMarketResult> {
    // 5 分钟内缓存命中，直接返回
    if (marketCache && Date.now() - marketCache.timestamp < CACHE_TTL_MS) {
      return { success: true, data: marketCache.data }
    }

    try {
      const timestamp = Date.now()
      const platform = process.platform
      const [marketResponse, recommendations] = await Promise.all([
        httpGet<{ data?: unknown }>(
          `${PLUGIN_MARKET_API_BASE}/plugins?limit=${RECOMMEND_LIMIT}&platform=${encodeURIComponent(platform)}&t=${timestamp}`,
        ),
        this.fetchRecommendations(RECOMMEND_LIMIT).catch(() => []),
      ])
      const plugins = this.collectPlugins(marketResponse.data)
      pluginDb.dbPut('plugin-market-version', String(timestamp))
      pluginDb.dbPut('plugin-market-data', plugins)
      marketCache = { data: plugins, timestamp: Date.now() }
      void recommendations
      return { success: true, data: plugins }
    } catch (error) {
      // 网络失败时降级使用本地缓存
      const cached = pluginDb.dbGet('plugin-market-data')
      if (Array.isArray(cached)) {
        return { success: true, data: cached as MarketPlugin[] }
      }
      return { success: false, error: error instanceof Error ? error.message : '获取失败' }
    }
  }

  async fetchRecommendations(limit = RECOMMEND_LIMIT): Promise<MarketPlugin[]> {
    const timestamp = Date.now()
    const platform = process.platform
    const response = await httpGet<{ items?: MarketPlugin[] }>(
      `${PLUGIN_MARKET_API_BASE}/plugins/recommendations?limit=${limit}&platform=${encodeURIComponent(platform)}&t=${timestamp}`,
    )
    const items = Array.isArray(response.data?.items) ? response.data.items : []
    return items.filter((p) => !!p?.name)
  }

  /** 清除市场缓存，下次请求将重新拉取 */
  clearCache(): void {
    marketCache = null
  }

  /**
   * 解析市场下载地址。优先使用插件自带 downloadUrl，否则走官方接口解析。
   */
  async resolveDownloadUrl(plugin: { name: string; downloadUrl?: string }): Promise<string> {
    const pluginName = typeof plugin?.name === 'string' ? plugin.name : ''
    if (!pluginName) return ''
    if (typeof plugin?.downloadUrl === 'string' && plugin.downloadUrl.trim()) {
      return plugin.downloadUrl.trim()
    }
    const response = await httpGet<{
      zpxDownloadUrl?: string
      downloadUrl?: string
    }>(`${PLUGIN_MARKET_API_BASE}/plugins/download?name=${encodeURIComponent(pluginName)}`)
    const data = response.data || {}
    if (typeof data.zpxDownloadUrl === 'string' && data.zpxDownloadUrl.trim()) {
      return data.zpxDownloadUrl.trim()
    }
    if (typeof data.downloadUrl === 'string' && data.downloadUrl.trim()) {
      return data.downloadUrl.trim()
    }
    return ''
  }

  /**
   * 获取插件 README Markdown 内容。
   */
  async fetchReadme(
    pluginName: string,
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const response = await httpGet<{ content?: string; error?: string }>(
        `${PLUGIN_MARKET_API_BASE}/plugins/readme?name=${encodeURIComponent(pluginName)}`,
      )
      const data = response.data || {}
      if (!data.content) {
        return { success: false, error: data.error || '暂无详情' }
      }
      return { success: true, content: data.content }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '加载失败' }
    }
  }

  private collectPlugins(value: unknown): MarketPlugin[] {
    const data = (typeof value === 'string' ? JSON.parse(value) : value) as {
      categories?: Array<{ plugins?: MarketPlugin[] }>
    } | null
    const byName = new Map<string, MarketPlugin>()
    for (const category of data?.categories || []) {
      for (const plugin of category.plugins || []) {
        if (plugin?.name) byName.set(plugin.name, plugin)
      }
    }
    return [...byName.values()]
  }
}

export const pluginMarket = new PluginMarket()
