import { describe, expect, it } from 'vitest'
import { enabledFeatures, isFeatureEnabled } from '../app/renderer/features/enabled'

describe('feature registry', () => {
  it('reports the configured AI feature state', () => {
    expect(isFeatureEnabled('ai-chat')).toBe(enabledFeatures.includes('ai-chat'))
  })
})
