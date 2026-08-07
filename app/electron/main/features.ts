import { createMainFeature as createAiChatFeature } from '@electron-template/feature-ai-chat/main'
import type { MainFeatureRegistration } from '@electron-template/feature-contract'
import { createMainFeature as createExampleFeature } from '@electron-template/feature-example/main'
import { enabledFeatures } from '../../shared/features'

// 可选模块的主进程注册器（id → 创建函数）。新增模块在这里加一行。
const mainRegistry: Record<string, () => MainFeatureRegistration> = {
  'ai-chat': createAiChatFeature,
  example: createExampleFeature,
}

export async function initEnabledMainFeatures(): Promise<void> {
  for (const id of enabledFeatures) {
    mainRegistry[id]?.().initialize()
  }
}
