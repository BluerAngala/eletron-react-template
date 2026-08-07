import type { LucideIcon } from 'lucide-react'

export interface FeatureNavigationItem {
  to: string
  icon: LucideIcon
  key: string
}

export interface RendererFeature {
  id: string
  navigation: FeatureNavigationItem[]
  fullBleedPaths?: string[]
}
