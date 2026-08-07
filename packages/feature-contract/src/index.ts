import type { Resource } from 'i18next'
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'

export interface RendererFeatureRegistration {
  routes: RouteObject[]
  navigation: { to: string; icon: LucideIcon; key: string }[]
  fullBleedPaths: string[]
  locales: Resource
}

export interface MainFeatureRegistration {
  initialize(): void
}

export interface PreloadFeatureRegistration {
  expose(): void
}
