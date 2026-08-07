// scripts/new-feature.mjs —— 生成一个新的可插拔功能包并自动接入宿主
//
//   pnpm feature:new <id>     # id 为 kebab-case，如 json-tools
//
// 自动完成 4 件事：
//   1) 生成 packages/feature-<id>/ 骨架（renderer / main / preload / locales / 契约）
//   2) 在 app/shared/features.ts 的 enabledFeatures 加入 '<id>'（默认启用）
//   3) 在 4 张注册表（renderer / i18n / main / preload）各加一行 loader
//   4) 在 package.json 添加 workspace 依赖
//
// 完成后：pnpm install && pnpm lint:fix，重启 pnpm dev 即可在侧边栏看到新模块。
// 参考：packages/feature-example（手写一个模块时的范本）
//
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const [id] = process.argv.slice(2)

// ── 校验 id ──
const ID_RE = /^[a-z][a-z0-9-]*$/
if (!id || !ID_RE.test(id)) {
  console.error('用法: pnpm feature:new <id>   （id 为 kebab-case，如 json-tools）')
  process.exit(1)
}
if (id === 'contract') {
  console.error('"contract" 是契约包名，不能用作功能 id')
  process.exit(1)
}

const pascal = id
  .split('-')
  .map((s) => s[0].toUpperCase() + s.slice(1))
  .join('') // json-tools → JsonTools
const camel = pascal[0].toLowerCase() + pascal.slice(1) // JsonTools → jsonTools
const pkgName = `@electron-template/feature-${id}`
const dir = path.resolve('packages', `feature-${id}`)
const ns = camel // i18n 命名空间 + 导航 ns
const bridge = `${camel}Bridge` // window 全局桥名
const pingChannel = `feature-${id}:ping`
const channelConst = `${id.toUpperCase().replaceAll('-', '_')}_PING_CHANNEL` // JSON_TOOLS_PING_CHANNEL

const sharedFeatures = path.resolve('app/shared/features.ts')
const packageFile = path.resolve('package.json')
const registries = [
  {
    file: 'app/renderer/features/renderer.ts',
    fn: 'createRendererFeature',
    sub: '/renderer',
    anchor: 'const featureRegistry: Record<string, () => RendererFeatureRegistration> = {\n',
  },
  {
    file: 'app/renderer/features/i18n.ts',
    fn: 'createRendererFeature',
    sub: '/renderer',
    anchor: 'const localeRegistry: Record<string, () => RendererFeatureRegistration> = {\n',
  },
  {
    file: 'app/electron/main/features.ts',
    fn: 'createMainFeature',
    sub: '/main',
    anchor: 'const mainRegistry: Record<string, () => MainFeatureRegistration> = {\n',
  },
  {
    file: 'app/electron/preload/features.ts',
    fn: 'createPreloadFeature',
    sub: '/preload',
    anchor: 'const preloadRegistry: Record<string, () => PreloadFeatureRegistration> = {\n',
  },
]

// ── 预检：目录与开关不能冲突 ──
try {
  await mkdir(dir, { recursive: false })
} catch {
  console.error(`packages/feature-${id} 已存在，换个 id 试试`)
  process.exit(1)
}
const featuresSource = await readFile(sharedFeatures, 'utf8')
if (featuresSource.includes(`'${id}'`)) {
  console.error(`enabledFeatures 已包含 ${id}`)
  process.exit(1)
}

// ── 1) 生成功能包骨架 ──
const files = {
  'package.json': `{
  "name": "${pkgName}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./renderer": "./src/renderer/index.ts",
    "./main": "./src/main/index.ts",
    "./preload": "./src/preload/index.ts"
  },
  "dependencies": {
    "@electron-template/feature-contract": "workspace:*"
  },
  "peerDependencies": {
    "electron": "^42.1.0",
    "i18next": "^26.3.6",
    "lucide-react": "^1.25.0",
    "react": "^19.2.7",
    "react-i18next": "^17.0.11",
    "react-router-dom": "^7.18.1"
  }
}
`,
  'src/index.ts': `export { createMainFeature } from './main'
export { createPreloadFeature } from './preload'
export { createRendererFeature } from './renderer'
`,
  'src/shared/protocol.ts': `// 本功能包内跨进程共享的协议：IPC 通道名与消息结构（kebab-case 命名）
export const ${channelConst} = '${pingChannel}'
`,
  'src/main/index.ts': `import { ipcMain } from 'electron'
import type { MainFeatureRegistration } from '@electron-template/feature-contract'
import { ${channelConst} } from '../shared/protocol'

let initialized = false

export function createMainFeature(): MainFeatureRegistration {
  return {
    initialize() {
      if (initialized) return
      initialized = true
      // 演示：注册一个主进程 IPC，供渲染进程经 preload 桥调用
      ipcMain.handle(${channelConst}, () => ({
        pong: true,
        timestamp: new Date().toISOString(),
      }))
    },
  }
}
`,
  'src/preload/index.ts': `import { contextBridge, ipcRenderer } from 'electron'
import type { PreloadFeatureRegistration } from '@electron-template/feature-contract'
import { ${channelConst} } from '../shared/protocol'

export function createPreloadFeature(): PreloadFeatureRegistration {
  return {
    expose() {
      contextBridge.exposeInMainWorld('${bridge}', {
        ping: () =>
          ipcRenderer.invoke(${channelConst}) as Promise<{
            pong: boolean
            timestamp: string
          }>,
      })
    },
  }
}
`,
  'src/renderer/index.ts': `export { createRendererFeature } from '../renderer'
`,
  'src/renderer/bridge.ts': `export interface ${pascal}Bridge {
  ping(): Promise<{ pong: boolean; timestamp: string }>
}

declare global {
  interface Window {
    ${bridge}?: ${pascal}Bridge
  }
}
`,
  'src/renderer.tsx': `import type { RendererFeatureRegistration } from '@electron-template/feature-contract'
import { Puzzle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import type { ${pascal}Bridge } from './renderer/bridge'

function ${pascal}Page() {
  const { t } = useTranslation('${ns}')
  const [result, setResult] = useState('')

  const ping = async () => {
    // window.${bridge} 由本功能的 preload 暴露；功能未启用时不存在
    if (!window.${bridge}) {
      setResult(t('bridgeMissing'))
      return
    }
    const data: Awaited<ReturnType<${pascal}Bridge['ping']>> = await window.${bridge}.ping()
    setResult(t('pongAt', { time: new Date(data.timestamp).toLocaleTimeString() }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-white p-8 text-slate-900 dark:bg-black dark:text-white">
      <Puzzle className="size-8 opacity-70" />
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-center text-sm text-slate-500 dark:text-white/70">
        {t('description')}
      </p>
      <button
        type="button"
        onClick={() => void ping()}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        {t('pingButton')}
      </button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}

export function createRendererFeature(): RendererFeatureRegistration {
  return {
    routes: [{ path: '${id}', element: <${pascal}Page /> }],
    navigation: [{ to: '/${id}', icon: Puzzle, key: 'nav.${id}', ns: '${ns}' }],
    fullBleedPaths: [],
    locales: {
      'zh-CN': { ${ns}: zhCN },
      'en-US': { ${ns}: enUS },
    },
  }
}
`,
  'src/locales/zh-CN.json': `{
  "title": "${id} 功能",
  "description": "由 pnpm feature:new ${id} 生成的占位功能：页面、IPC 与多语言都在 packages/feature-${id} 内，通过 app/shared/features.ts 的 enabledFeatures 开关。",
  "pingButton": "调用 IPC（主进程 ⇄ 渲染进程演示）",
  "pongAt": "主进程响应：pong @ {{time}}",
  "bridgeMissing": "桥接不可用，请确认该功能已启用并重启应用。",
  "nav": {
    "${id}": "${id}"
  }
}
`,
  'src/locales/en-US.json': `{
  "title": "${id} Feature",
  "description": "Placeholder feature generated by pnpm feature:new ${id}. Page, IPC, and i18n all live in packages/feature-${id}, toggled by enabledFeatures in app/shared/features.ts.",
  "pingButton": "Call IPC (main ⇄ renderer demo)",
  "pongAt": "Main process replied: pong @ {{time}}",
  "bridgeMissing": "Bridge unavailable. Enable the feature and restart the app.",
  "nav": {
    "${id}": "${id}"
  }
}
`,
}

for (const [relPath, content] of Object.entries(files)) {
  const target = path.join(dir, relPath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, content)
}

// ── 2) enabledFeatures 加入 '<id>' ──
const match = featuresSource.match(/export const enabledFeatures = \[([^\]]*)\] as const/)
if (!match) throw new Error(`无法解析 ${sharedFeatures} 中的 enabledFeatures`)
const ids = match[1]
  .split(',')
  .map((s) => s.trim().replaceAll(/['"]/g, ''))
  .filter(Boolean)
ids.push(id)
const next = `export const enabledFeatures = [${ids.map((i) => `'${i}'`).join(', ')}] as const`
await writeFile(sharedFeatures, featuresSource.replace(match[0], next))

// ── 3) 四处注册表各加一行 loader ──
for (const { file, fn, sub, anchor } of registries) {
  const filePath = path.resolve(file)
  let source = await readFile(filePath, 'utf8')
  const importLine = `import { ${fn} as create${pascal}Feature } from '${pkgName}${sub}'`
  source = source.replace(
    "import { enabledFeatures } from '../../shared/features'",
    `${importLine}\nimport { enabledFeatures } from '../../shared/features'`,
  )
  if (!source.includes(anchor)) throw new Error(`注册表锚点未匹配: ${file}`)
  source = source.replace(anchor, `${anchor}  '${id}': create${pascal}Feature,\n`)
  await writeFile(filePath, source)
}

// ── 4) package.json 添加 workspace 依赖 ──
const pkg = JSON.parse(await readFile(packageFile, 'utf8'))
pkg.dependencies[pkgName] = 'workspace:*'
await writeFile(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)

console.log(
  `✅ 已生成 ${path.relative(process.cwd(), dir)} 并接入宿主（enabledFeatures + 4 张注册表 + workspace 依赖）`,
)
console.log('下一步：')
console.log('  1. pnpm install     # 链接新 workspace 包')
console.log('  2. pnpm lint:fix    # 整理 import 顺序')
console.log('  3. 重启 pnpm dev     # 侧边栏出现新模块')
console.log(`  4. 编辑 ${path.relative(process.cwd(), dir)}/src/renderer.tsx 开始写你的工具`)
