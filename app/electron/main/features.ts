import { createMainFeature } from '@electron-template/feature-ai-chat/main'

export async function initEnabledMainFeatures(): Promise<void> {
  createMainFeature().initialize()
}
