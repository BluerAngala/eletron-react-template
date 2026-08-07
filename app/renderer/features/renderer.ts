import { createRendererFeature as createAiChatFeature } from '@electron-template/feature-ai-chat/renderer'
import type { RendererFeatureRegistration } from '@electron-template/feature-contract'
import { createRendererFeature as createExampleFeature } from '@electron-template/feature-example/renderer'
import type { RouteObject } from 'react-router-dom'
import { enabledFeatures } from '../../shared/features'
import type { FeatureNavigationItem } from './types'

// 可选模块的渲染层注册器（id → 创建函数）。新增模块在这里加一行。
const featureRegistry: Record<string, () => RendererFeatureRegistration> = {
  'ai-chat': createAiChatFeature,
  example: createExampleFeature,
}

// 只装配 enabledFeatures 中启用的模块
const active = enabledFeatures
  .filter((id) => id in featureRegistry)
  .map((id) => featureRegistry[id]())

export const featureRoutes: RouteObject[] = active.flatMap((feature) => feature.routes)
export const featureNavigation: FeatureNavigationItem[] = active.flatMap(
  (feature) => feature.navigation,
)
export const fullBleedFeaturePaths = new Set(active.flatMap((feature) => feature.fullBleedPaths))
