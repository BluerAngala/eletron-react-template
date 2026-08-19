import { pluginDb } from './store'
import { physicalFs } from './physicalFs'
import type { InstalledPlugin } from './shared'

const artifactFs = physicalFs.promises

/**
 * 已装插件注册表：负责插件列表读取、卸载。
 */
class Registry {
  private notifyPluginsChanged: () => void = () => {}

  setOnPluginsChanged(cb: () => void): void {
    this.notifyPluginsChanged = cb
  }

  list(): InstalledPlugin[] {
    const list = pluginDb.dbGet('plugins')
    return Array.isArray(list) ? (list as InstalledPlugin[]) : []
  }

  getByName(name: string): InstalledPlugin | undefined {
    return this.list().find((p) => p.name === name)
  }

  private writeInstalled(plugins: InstalledPlugin[]): void {
    pluginDb.dbPut('plugins', plugins)
  }

  async delete(pluginPath: string): Promise<{ success: boolean; error?: string }> {
    const plugins = this.list()
    const index = plugins.findIndex((p) => p.path === pluginPath)
    if (index === -1) return { success: false, error: '插件不存在' }
    const plugin = plugins[index]
    plugins.splice(index, 1)
    this.writeInstalled(plugins)
    this.notifyPluginsChanged()
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
