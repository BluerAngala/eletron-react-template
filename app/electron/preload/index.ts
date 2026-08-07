import { contextBridge, ipcRenderer } from 'electron'
import { exposeEnabledPreloadFeatures } from './features'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function sendLog(level: LogLevel, scope: string, message: string, data?: Record<string, unknown>) {
  ipcRenderer.send('log:write', {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(data && Object.keys(data).length > 0 ? { data } : {}),
  })
}

// 渲染进程统一日志入口（转发到主进程统一落盘）
contextBridge.exposeInMainWorld('logger', {
  debug: (scope: string, message: string, data?: Record<string, unknown>) =>
    sendLog('debug', scope, message, data),
  info: (scope: string, message: string, data?: Record<string, unknown>) =>
    sendLog('info', scope, message, data),
  warn: (scope: string, message: string, data?: Record<string, unknown>) =>
    sendLog('warn', scope, message, data),
  error: (scope: string, message: string, data?: Record<string, unknown>) =>
    sendLog('error', scope, message, data),
})

// 日志查看 API（供日志页面使用）
contextBridge.exposeInMainWorld('logAPI', {
  read: () => ipcRenderer.invoke('log:read') as Promise<unknown[]>,
  clear: () => ipcRenderer.invoke('log:clear') as Promise<void>,
  onLogEvent: (listener: (entry: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, entry: unknown) => listener(entry)
    ipcRenderer.on('log:event', handler)
    return () => ipcRenderer.off('log:event', handler)
  },
})

exposeEnabledPreloadFeatures()

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

// biome-ignore lint/correctness/useHookAtTopLevel: 非 React hook，仅名称以 use 开头的加载屏辅助函数
const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  if (ev.data.payload === 'removeLoading') removeLoading()
}

setTimeout(removeLoading, 4999)
