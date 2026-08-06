import { create } from 'zustand'

/**
 * AI 对话配置（厂商 / 模型 / 系统提示词）。
 * 用轻量 zustand store 承载，让配置面板和 assistant-ui 的 adapter 都能随时读到最新值，
 * 避免因 props 变化重建 runtime 导致会话状态被清空。
 */
interface AssistantConfigState {
  provider: string
  model: string
  systemPrompt: string
  setProvider: (provider: string) => void
  setModel: (model: string) => void
  setSystemPrompt: (systemPrompt: string) => void
}

export const useAssistantConfig = create<AssistantConfigState>((set) => ({
  provider: '',
  model: '',
  systemPrompt: '',
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
}))
