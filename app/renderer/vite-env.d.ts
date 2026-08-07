/// <reference types="vite/client" />

interface Window {
  // Exposed by `app/electron/preload/index.ts`.
  ipcRenderer: import('electron').IpcRenderer
}

// logger / logAPI 全局类型由 app/renderer/lib/logger.ts 中的 `declare global` 提供（单一来源）
