/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}

// logger / logAPI 全局类型由 src/lib/logger.ts 中的 `declare global` 提供（单一来源）
