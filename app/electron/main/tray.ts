import path from 'node:path'
import { app, Menu, nativeImage, Tray } from 'electron'
import Store from 'electron-store'
import { createLogger } from './logger'

const logger = createLogger('tray')

const settings = new Store({ name: 'app-settings' })
const CLOSE_TO_TRAY_KEY = 'closeToTray'

export interface TrayHandle {
  /** 是否开启「关闭窗口时最小化到托盘」 */
  isCloseToTray(): boolean
  /** 是否为用户主动退出（此时不再拦截窗口关闭） */
  isQuitting(): boolean
  /** 真正退出应用（退出前会标记，绕过托盘拦截） */
  quit(): void
}

/**
 * 系统托盘：显示/隐藏主窗口、关闭到托盘开关、退出。
 *
 * - 默认「关闭窗口即退出」，与普通桌面应用行为一致；
 * - 通过托盘菜单勾选「关闭窗口时最小化到托盘」后，关闭窗口改为隐藏到托盘，
 *   再次点击托盘菜单「显示主窗口」恢复。
 */
export function setupTray(getWindow: () => Electron.BrowserWindow | null): TrayHandle {
  let quitting = false

  const quit = () => {
    quitting = true
    app.quit()
  }

  const showWindow = () => {
    const win = getWindow()
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  }

  // 图标：开发态来自 resources/public，打包后静态资源被复制进 dist。
  const iconPath = path.join(process.env.VITE_PUBLIC || '', 'logo-32.png')
  const tray = new Tray(nativeImage.createFromPath(iconPath))
  tray.setToolTip(app.getName())

  const refreshMenu = () => {
    const closeToTray = Boolean(settings.get(CLOSE_TO_TRAY_KEY, false))
    const menu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: showWindow,
      },
      { type: 'separator' },
      {
        label: '关闭窗口时最小化到托盘',
        type: 'checkbox',
        checked: closeToTray,
        click: (item) => {
          settings.set(CLOSE_TO_TRAY_KEY, item.checked)
          logger.info('close-to-tray-changed', { enabled: item.checked })
        },
      },
      { type: 'separator' },
      { label: '退出', click: quit },
    ])
    tray.setContextMenu(menu)
  }

  refreshMenu()

  return {
    isCloseToTray: () => Boolean(settings.get(CLOSE_TO_TRAY_KEY, false)),
    isQuitting: () => quitting,
    quit,
  }
}
