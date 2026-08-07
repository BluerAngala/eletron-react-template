import { createRendererFeature } from '@electron-template/feature-ai-chat/renderer'

const aiChat = createRendererFeature()

export const featureRoutes = aiChat.routes
export const featureNavigation = aiChat.navigation
export const fullBleedFeaturePaths = new Set(aiChat.fullBleedPaths)
