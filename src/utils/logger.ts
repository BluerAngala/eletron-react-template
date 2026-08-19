import log from 'electron-log/renderer'

// 渲染进程日志 — 自动通过 IPC 转发到主进程写文件
export const logger = log

// 便捷方法
export const logInfo = (message: string, ...args: unknown[]) => log.info(message, ...args)
export const logWarn = (message: string, ...args: unknown[]) => log.warn(message, ...args)
export const logError = (message: string, ...args: unknown[]) => log.error(message, ...args)
export const logDebug = (message: string, ...args: unknown[]) => log.debug(message, ...args)
