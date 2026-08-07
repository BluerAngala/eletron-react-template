import { createPreloadFeature as createAiChatFeature } from '@electron-template/feature-ai-chat/preload'
import type { PreloadFeatureRegistration } from '@electron-template/feature-contract'
import { createPreloadFeature as createExampleFeature } from '@electron-template/feature-example/preload'
import { enabledFeatures } from '../../shared/features'

// 可选模块的 preload 注册器（id → 创建函数）。新增模块在这里加一行。
const preloadRegistry: Record<string, () => PreloadFeatureRegistration> = {
  'ai-chat': createAiChatFeature,
  example: createExampleFeature,
}

export function exposeEnabledPreloadFeatures(): void {
  for (const id of enabledFeatures) {
    preloadRegistry[id]?.().expose()
  }
}
