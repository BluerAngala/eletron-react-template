import { createRendererFeature as createAiChatFeature } from '@electron-template/feature-ai-chat/renderer'
import type { RendererFeatureRegistration } from '@electron-template/feature-contract'
import { createRendererFeature as createExampleFeature } from '@electron-template/feature-example/renderer'
import type { Resource } from 'i18next'
import { enabledFeatures } from '../../shared/features'

// 可选模块的多语言注册器（id → 创建函数）。新增模块在这里加一行。
const localeRegistry: Record<string, () => RendererFeatureRegistration> = {
  'ai-chat': createAiChatFeature,
  example: createExampleFeature,
}

export async function getFeatureResources(): Promise<Resource> {
  const resources: Resource = {}
  for (const id of enabledFeatures) {
    if (!(id in localeRegistry)) continue
    const { locales } = localeRegistry[id]()
    for (const [language, namespaces] of Object.entries(locales)) {
      resources[language] = { ...resources[language], ...namespaces }
    }
  }
  return resources
}
