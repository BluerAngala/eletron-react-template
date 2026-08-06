import { app, ipcMain } from 'electron'
import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'
// Pure cjs module does not support named exports, so we need to import the default export and access the autoUpdater property
import updater from 'electron-updater'

const autoUpdater = updater.autoUpdater
let cancellationToken = new updater.CancellationToken()
let isDownloading = false

// IPC handler 与事件监听只注册一次，避免 createWindow 多次调用时重复注册
let initialized = false
// 当前窗口引用：用于把更新事件推送到前台窗口
let winRef: Electron.BrowserWindow | null = null

function sendToWindow(channel: string, payload: unknown) {
  if (winRef && !winRef.isDestroyed()) {
    winRef.webContents.send(channel, payload)
  }
}

export function update(win: Electron.BrowserWindow) {
  winRef = win

  // When set to false, the update download will be triggered through the API
  autoUpdater.autoDownload = false
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  if (initialized) return
  initialized = true

  // start check
  autoUpdater.on('checking-for-update', () => {})
  // update available
  autoUpdater.on('update-available', (arg: UpdateInfo) => {
    sendToWindow('update-can-available', {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    })
  })
  // update not available
  autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
    sendToWindow('update-can-available', {
      update: false,
      version: app.getVersion(),
      newVersion: arg?.version,
    })
  })

  // Checking for updates
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    try {
      return await autoUpdater.checkForUpdates()
    } catch (error) {
      const resolvedError = error instanceof Error ? error : new Error('Network error')
      return { message: resolvedError.message, error: resolvedError }
    }
  })

  // Start downloading and feedback on progress
  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    if (isDownloading) return

    isDownloading = true
    startDownload(
      (error, progressInfo) => {
        if (error) {
          isDownloading = false
          // feedback download error message
          event.sender.send('update-error', { message: error.message, error })
        } else {
          // feedback update progress message
          event.sender.send('download-progress', progressInfo)
        }
      },
      () => {
        isDownloading = false
        // feedback update downloaded message
        event.sender.send('update-downloaded')
      },
    )
  })

  // Cancel downloading
  ipcMain.handle('cancel-download', () => {
    cancellationToken.cancel()
    cancellationToken = new updater.CancellationToken()
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall(false, true)
  })
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  const onDownloadProgress = (info: ProgressInfo) => callback(null, info)
  const onError = (error: Error) => {
    cleanup()
    callback(error, null)
  }
  const onDownloaded = (event: UpdateDownloadedEvent) => {
    cleanup()
    complete(event)
  }

  const cleanup = () => {
    autoUpdater.off('download-progress', onDownloadProgress)
    autoUpdater.off('error', onError)
    autoUpdater.off('update-downloaded', onDownloaded)
  }

  autoUpdater.on('download-progress', onDownloadProgress)
  autoUpdater.on('error', onError)
  autoUpdater.once('update-downloaded', onDownloaded)
  autoUpdater.downloadUpdate(cancellationToken)
}
