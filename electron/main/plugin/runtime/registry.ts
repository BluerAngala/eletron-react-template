import { pluginDb } from '../store'
import { physicalFs } from '../physicalFs'
import type { InstalledPlugin } from '../shared'

const artifactFs = physicalFs.promises

/**
 * 已装插件注册表：负责插件列表读取、卸载。
 * 支持三层来源：内置插件（memory）+ 用户插件（electron-store）。
 */
class Registry {
  /** 内置插件列表（内存，每次启动时从 plugins/ 扫描） */
  private builtinPlugins: InstalledPlugin[] = []
  private notifyPluginsChanged: () => void = () => {}

  setOnPluginsChanged(cb: () => void): void {
    this.notifyPluginsChanged = cb
  }

  /** 注册内置插件 */
  registerBuiltin(plugins: InstalledPlugin[]): void {
    this.builtinPlugins = plugins
    this.notifyPluginsChanged()
  }

  /**
   * 返回完整的插件列表（内置插件 + 用户安装插件）。
   * 同名内置插件不会重复出现——用户安装的版本优先。
   */
  list(): InstalledPlugin[] {
    const userPlugins = pluginDb.dbGet('plugins')
    const userList = Array.isArray(userPlugins) ? (userPlugins as InstalledPlugin[]) : []

    // 内置插件中，排除已被用户安装覆盖的同名插件
    const userNames = new Set(userList.map((p) => p.name))
    const builtin = this.builtinPlugins.filter((b) => !userNames.has(b.name))

    return [...builtin, ...userList]
  }

  getByName(name: string): InstalledPlugin | undefined {
    // 先查用户插件，再查内置插件
    const userPlugin = this.list().find((p) => p.name === name)
    return userPlugin
  }

  private writeInstalled(plugins: InstalledPlugin[]): void {
    pluginDb.dbPut('plugins', plugins)
  }

  async delete(pluginPath: string): Promise<{ success: boolean; error?: string }> {
    const plugins = this.list()
    const index = plugins.findIndex((p) => p.path === pluginPath)
    if (index === -1) return { success: false, error: '插件不存在' }

    const plugin = plugins[index]

    // 内置插件不可删除
    if (plugin.isBuiltin) {
      return { success: false, error: '内置插件不可卸载' }
    }

    // 从用户插件列表中移除
    const userPlugins = Array.isArray(pluginDb.dbGet('plugins'))
      ? (pluginDb.dbGet('plugins') as InstalledPlugin[])
      : []
    const filtered = userPlugins.filter((p) => p.path !== pluginPath)
    this.writeInstalled(filtered)
    this.notifyPluginsChanged()

    // 删除文件
    try {
      await Promise.all([
        artifactFs.rm(plugin.path, { force: true }),
        artifactFs.rm(`${plugin.path}.unpacked`, { recursive: true, force: true }),
      ])
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '删除文件失败' }
    }
    return { success: true }
  }
}

export const registry = new Registry()
export type { InstalledPlugin }
