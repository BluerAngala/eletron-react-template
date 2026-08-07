export const enabledFeatures = ['ai-chat'] as const

export type FeatureId = 'ai-chat'

export function isFeatureEnabled(feature: FeatureId): boolean {
  return enabledFeatures.includes(feature as never)
}
