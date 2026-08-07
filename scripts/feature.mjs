import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const configFile = path.resolve('app/shared/features.ts')
const rendererFile = path.resolve('app/renderer/features/renderer.ts')
const mainFeaturesFile = path.resolve('app/electron/main/features.ts')
const preloadFeaturesFile = path.resolve('app/electron/preload/features.ts')
const i18nFeaturesFile = path.resolve('app/renderer/features/i18n.ts')
const packageFile = path.resolve('package.json')
const supportedFeatures = new Set(['ai-chat'])
const [command, feature] = process.argv.slice(2)

if (command === 'list') {
  console.log([...supportedFeatures].join('\n'))
  process.exit(0)
}

if (!['add', 'remove'].includes(command) || !supportedFeatures.has(feature)) {
  console.error('Usage: pnpm feature:<add|remove> ai-chat')
  console.error('Available features: ai-chat')
  process.exit(1)
}

const source = await readFile(configFile, 'utf8')
const match = source.match(/export const enabledFeatures = \[(.*?)\] as const/)
if (!match) throw new Error(`Could not read enabledFeatures from ${configFile}`)

const enabled = match[1]
  .split(',')
  .map((entry) => entry.trim().replaceAll(/["']/g, ''))
  .filter(Boolean)

const next =
  command === 'add' ? [...new Set([...enabled, feature])] : enabled.filter((id) => id !== feature)
const replacement = `export const enabledFeatures = [${next.map((id) => `'${id}'`).join(', ')}] as const`

await writeFile(configFile, source.replace(match[0], replacement))
await writeFile(rendererFile, createRendererRegistry(next))
await writeFile(mainFeaturesFile, createMainFeatures(next))
await writeFile(preloadFeaturesFile, createPreloadFeatures(next))
await writeFile(i18nFeaturesFile, createI18nFeatures(next))
await updatePackageDependencies(next)
console.log(`${command === 'add' ? 'Enabled' : 'Disabled'} feature: ${feature}`)

function createRendererRegistry(features) {
  if (!features.includes('ai-chat')) {
    return `import type { RouteObject } from 'react-router-dom'\nimport type { FeatureNavigationItem } from './types'\n\nexport const featureRoutes: RouteObject[] = []\nexport const featureNavigation: FeatureNavigationItem[] = []\nexport const fullBleedFeaturePaths = new Set<string>()\n`
  }

  return `import { createRendererFeature } from '@electron-template/feature-ai-chat/renderer'\n\nconst aiChat = createRendererFeature()\n\nexport const featureRoutes = aiChat.routes\nexport const featureNavigation = aiChat.navigation\nexport const fullBleedFeaturePaths = new Set(aiChat.fullBleedPaths)\n`
}

function createMainFeatures(features) {
  if (!features.includes('ai-chat')) {
    return `export async function initEnabledMainFeatures(): Promise<void> {}\n`
  }

  return `import { createMainFeature } from '@electron-template/feature-ai-chat/main'\n\nexport async function initEnabledMainFeatures(): Promise<void> {\n  createMainFeature().initialize()\n}\n`
}

function createPreloadFeatures(features) {
  if (!features.includes('ai-chat')) {
    return `export function exposeEnabledPreloadFeatures(): void {}\n`
  }

  return `import { createPreloadFeature } from '@electron-template/feature-ai-chat/preload'\n\nexport function exposeEnabledPreloadFeatures(): void {\n  createPreloadFeature().expose()\n}\n`
}

function createI18nFeatures(features) {
  if (!features.includes('ai-chat')) {
    return `import type { Resource } from 'i18next'\n\nexport async function getFeatureResources(): Promise<Resource> {\n  return {}\n}\n`
  }

  return `import { createRendererFeature } from '@electron-template/feature-ai-chat/renderer'\nimport type { Resource } from 'i18next'\n\nexport async function getFeatureResources(): Promise<Resource> {\n  return createRendererFeature().locales\n}\n`
}

async function updatePackageDependencies(features) {
  const packageJson = JSON.parse(await readFile(packageFile, 'utf8'))
  const dependency = '@electron-template/feature-ai-chat'
  if (features.includes('ai-chat')) {
    packageJson.dependencies[dependency] = 'workspace:*'
  } else {
    delete packageJson.dependencies[dependency]
  }
  await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`)
}
