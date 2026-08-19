// 插件运行时 preload —— 提供给独立插件窗口。
// 在 contextIsolation:false 下通过 ipcRenderer 与主进程 plugin.api 分发器通信，
// 并暴露一个精简但兼容的 window.ztools 对象供插件调用。
const electron = require('electron')

const ipcRenderer = electron.ipcRenderer

function ipcSendSync(apiName, args) {
  const result = ipcRenderer.sendSync('plugin.api', apiName, args)
  if (result instanceof Error) throw result
  return result
}

async function ipcInvoke(apiName, args) {
  try {
    return await ipcRenderer.invoke('plugin.api', apiName, args)
  } catch (e) {
    throw new Error(
      String(e && e.message ? e.message : e)
        .replace(/^.*?Error:/, '')
        .trim(),
    )
  }
}

const pluginEntry = ipcRenderer.sendSync('get-plugin-entry')

window.ztools = {
  getAppName: () => 'ZTools',
  getPathForFile: (file) => (electron.webUtils ? electron.webUtils.getPathForFile(file) : null),
  isMacOs: () => process.platform === 'darwin',
  isMacOS: () => process.platform === 'darwin',
  isWindows: () => process.platform === 'win32',
  isLinux: () => process.platform === 'linux',
  getPath: (name) => ipcSendSync('getPath', name),
  showOpenDialog: (options) => ipcSendSync('showOpenDialog', options),
  showSaveDialog: (options) => ipcSendSync('showSaveDialog', options),
  copyText: (text) => ipcRenderer.sendSync('copy-text', text),
  copyImage: (image) => ipcRenderer.sendSync('copy-image', image),
  copyFile: (filePath) => ipcRenderer.sendSync('copy-file', filePath),
  getCopyedFiles: () => ipcRenderer.sendSync('get-copyed-files'),
  shellOpenExternal: (url) => ipcRenderer.sendSync('shell-open-external', url),
  shellOpenPath: (fullPath) => ipcRenderer.sendSync('shell-open-path', fullPath),
  shellShowItemInFolder: (fullPath) => ipcRenderer.sendSync('shell-show-item-in-folder', fullPath),
  shellBeep: () => ipcRenderer.sendSync('shell-beep'),
  showToast: (message, options = {}) =>
    ipcRenderer.invoke('plugin:show-toast', { message, ...options }),
  showNotification: async (body) => ipcRenderer.invoke('show-notification', body),
  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),
  getPlatform: () => process.platform,
  db: {
    put: (doc) => ipcRenderer.sendSync('db:put', doc),
    get: (id) => ipcRenderer.sendSync('db:get', id),
    remove: (docOrId) => ipcRenderer.sendSync('db:remove', docOrId),
    bulkDocs: (docs) => ipcRenderer.sendSync('db:bulk-docs', docs),
    allDocs: (key) => ipcRenderer.sendSync('db:all-docs', key),
    postAttachment: (id, attachment, type) =>
      ipcRenderer.sendSync('db:post-attachment', id, attachment, type),
    getAttachment: (id) => ipcRenderer.sendSync('db:get-attachment', id),
    getAttachmentType: (id) => ipcRenderer.sendSync('db:get-attachment-type', id),
    promises: {
      put: async (doc) => ipcRenderer.invoke('db:put', doc),
      get: async (id) => ipcRenderer.invoke('db:get', id),
      remove: async (docOrId) => ipcRenderer.invoke('db:remove', docOrId),
      bulkDocs: async (docs) => ipcRenderer.invoke('db:bulk-docs', docs),
      allDocs: async (key) => ipcRenderer.invoke('db:all-docs', key),
    },
  },
  dbStorage: {
    setItem: (key, value) => ipcRenderer.sendSync('db-storage:set-item', key, value),
    getItem: (key) => ipcRenderer.sendSync('db-storage:get-item', key),
    removeItem: (key) => ipcRenderer.sendSync('db-storage:remove-item', key),
  },
  onPluginEnter: async (callback) => {
    if (typeof callback !== 'function') return
    window.__ztoolsEnterCallback = callback
    if (window.__ztoolsPendingEnter) {
      const payload = window.__ztoolsPendingEnter
      window.__ztoolsPendingEnter = null
      callback(payload)
    }
  },
  onPluginReady: async (callback) => {
    window.ztools.onPluginEnter(callback)
  },
  onPluginOut: async (callback) => {
    if (typeof callback === 'function') {
      ipcRenderer.on('plugin-out', (_e, isKill) => callback(isKill))
    }
  },
  outPlugin: async (isKill) => ipcRenderer.invoke('out-plugin', isKill),
  createBrowserWindow: (url, options, callback) => {
    if (typeof callback === 'function') {
      window.__ztoolsBrowserWindowCallback = callback
    }
    const result = ipcSendSync('createBrowserWindow', { url, options })
    return result && result.success ? result.windowId : null
  },
  getPrimaryDisplay: () => ipcRenderer.sendSync('get-primary-display'),
  getAllDisplays: () => ipcRenderer.sendSync('get-all-displays'),
  getCursorScreenPoint: () => ipcRenderer.sendSync('get-cursor-screen-point'),
  getWebContentsId: () => ipcRenderer.sendSync('get-web-contents-id'),
  isDev: () => ipcRenderer.sendSync('is-dev'),
}

// 插件进入事件（主进程在窗口 ready 后发送）
ipcRenderer.on('on-plugin-enter', (_event, launchParam) => {
  if (window.__ztoolsEnterCallback) {
    window.__ztoolsEnterCallback(launchParam)
  } else {
    window.__ztoolsPendingEnter = launchParam
  }
})

// 兼容子窗口回调通知
ipcRenderer.on('plugin-browser-window-created', (_event, payload) => {
  if (typeof window.__ztoolsBrowserWindowCallback === 'function') {
    window.__ztoolsBrowserWindowCallback(payload)
  }
})

// 插件上下文：暴露给插件识别自身
window.__PLUGIN_CONTEXT__ = {
  name: pluginEntry && pluginEntry.name,
  path: pluginEntry && pluginEntry.path,
}
