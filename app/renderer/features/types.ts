import type { LucideIcon } from 'lucide-react'

export interface FeatureNavigationItem {
  to: string
  icon: LucideIcon
  key: string
  /** 可选：文案所在的多语言命名空间（功能包自带的导航文案用） */
  ns?: string
}

export interface RendererFeature {
  id: string
  navigation: FeatureNavigationItem[]
  fullBleedPaths?: string[]
}
