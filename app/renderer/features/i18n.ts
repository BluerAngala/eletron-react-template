import { createRendererFeature } from '@electron-template/feature-ai-chat/renderer'
import type { Resource } from 'i18next'

export async function getFeatureResources(): Promise<Resource> {
  return createRendererFeature().locales
}
