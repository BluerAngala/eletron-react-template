import { createPreloadFeature } from '@electron-template/feature-ai-chat/preload'

export function exposeEnabledPreloadFeatures(): void {
  createPreloadFeature().expose()
}
