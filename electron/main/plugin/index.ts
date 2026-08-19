import { ipcMain, protocol, net, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pluginMarket } from './market'
import { installer } from './installer'
import { registry } from './registry'
import { runner } from './runner'
import { initPluginRuntime, bindRunningContext } from './api'
import { getRuntimePreloadPath } from './shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CHANGED_EVENT = 'plugins-changed'

/** 仓库内置插件 preload 源文件（随源码一起分发，打包后经 extraResources 置于 resources） */
function resolveRuntimePreloadSource(): string {
  // 打包后：resources/plugin-preload.js
  if (process.resourcesPath) {
    const packaged = path.join(process.resourcesPath, 'plugin-preload.js')
    if (fs.existsSync(packaged)) return packaged
  }
  // 开发/构建期间：项目源码目录
  const root = process.env.APP_ROOT || path.join(__dirname, '../..')
  const source = path.join(root, 'electron/main/plugin/plugin-preload.js')
  return fs.existsSync(source) ? source : path.join(root, 'resources/plugin-preload.js')
}

/**
 * 将仓库内置的插件 preload 运行时写入用户数据目录，供插件窗口注入。
 * 打包后 preload 静态文件未必随 asar 直出，因此在启动时统一落地到 userData。
 */
function ensureRuntimePreload(): void {
  const dest = getRuntimePreloadPath()
  try {
    const content = fs.readFileSync(resolveRuntimePreloadSource(), 'utf-8')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, content, 'utf-8')
  } catch (error) {
    console.error('[Plugin] 写入插件运行时失败:', error)
  }
}

/**
 * 初始化插件子系统：写入运行时、注册 plugin.api 分发、绑定运行上下文、注册 IPC。
 * @param notifyWeb 宿主侧变更通知回调（通常向主窗口发送 events）
 */
export function initPluginSubsystem(
  notifyWeb?: (channel: string, ...args: unknown[]) => void,
): void {
  ensureRuntimePreload()
  initPluginRuntime()
  bindRunningContext({ getRunning: () => runner.getRunning() })

  // 注册 plugin-icon 协议，将 plugin-icon://path 代理到 file://path
  // request.url 已被 Electron 标准协议层解码，直接使用即可；构造 file:// URL 时需对空格等特殊字符进行编码
  protocol.handle('plugin-icon', (request) => {
    const filePath = decodeURIComponent(request.url.slice('plugin-icon://'.length))
    return net.fetch('file:///' + filePath)
  })

  const notify = (): void => {
    notifyWeb?.(CHANGED_EVENT)
  }
  installer.setOnPluginsChanged(notify)
  registry.setOnPluginsChanged(notify)
  runner.setOnRunningChanged(() => notify)

  // ── 插件市场 ──
  ipcMain.handle('plugin:market-list', () => pluginMarket.fetchPluginMarket())
  ipcMain.handle('plugin:market-recommendations', (_e, limit?: number) =>
    pluginMarket.fetchRecommendations(limit),
  )
  ipcMain.handle('plugin:market-install', (_e, plugin: { name: string; downloadUrl?: string }) =>
    installer.installFromMarket(plugin),
  )
  ipcMain.handle('plugin:market-cancel', (_e, name: string) => installer.cancelDownload(name))
  ipcMain.handle('plugin:market-readme', (_e, pluginName: string) =>
    pluginMarket.fetchReadme(pluginName),
  )
  ipcMain.handle('plugin:market-clear-cache', () => {
    pluginMarket.clearCache()
  })

  // ── 已安装插件 ──
  ipcMain.handle('plugin:list', () => registry.list())
  ipcMain.handle('plugin:delete', (_e, pluginPath: string) => registry.delete(pluginPath))

  // ── 本地导入 ──
  ipcMain.handle('plugin:import-from-file', async () => {
    const result = await dialog.showOpenDialog({
      title: '导入插件',
      filters: [
        { name: 'ZTools 插件', extensions: ['zpx', 'zip'] },
      ],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, cancelled: true }
    }
    return installer.installFromPath(result.filePaths[0])
  })

  // ── 插件运行 ──
  ipcMain.handle('plugin:launch', (_e, pluginPath: string) => {
    const plugin = registry.list().find((p) => p.path === pluginPath)
    if (!plugin) return { success: false, error: '插件不存在' }
    return runner.launch(plugin)
  })
  ipcMain.handle('plugin:close', (_e, pluginPath: string) => runner.closePlugin(pluginPath))
  ipcMain.handle('plugin:running', () => runner.getRunningPlugins())
}

export { runner, registry, installer, pluginMarket }
