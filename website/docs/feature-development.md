---
sidebar_position: 3
title: 功能开发指南
description: 往壳里加小工具的操作手册 —— 建模块、写页面、开关，照着做就行。
---

# 功能开发指南

> 你只需要知道一件事：**这个应用是个"壳"，你往里面加一个个独立的小工具**。
> 加一个工具只需三步：**建模块 → 写页面 → 开关**。照着下面做就行，不需要理解内部原理。

## 三分钟上手

```bash
pnpm feature:new my-tool   # 1. 造一个叫 my-tool 的新工具（一切自动接好）
pnpm install               # 2. 链接依赖（只在新建时做一次）
pnpm dev                   # 3. 启动应用，侧边栏点 "my-tool" 就是你的页面
```

然后打开 `packages/feature-my-tool/src/renderer.tsx`，把示例代码换成你的工具逻辑。

## 开关：让某个工具"显示 / 隐藏"

所有工具的开关在一个文件里：`app/shared/features.ts`

```ts
// app/shared/features.ts
export const enabledFeatures = ['ai-chat', 'example', 'my-tool'] as const
```

- **数组里有的 id** → 这个工具会出现在侧边栏
- **从数组删掉某个 id** → 它就从侧边栏消失（代码还在，随时能加回来）
- 改完**重启 `pnpm dev`** 生效

> 内置模块：`ai-chat`（AI 聊天）、`example`（示例）。`my-tool` 是你自己建的那个。

## 一个工具模块长什么样

```
packages/feature-my-tool/
├── package.json              # 不用管
└── src/
    ├── renderer.tsx          # ★ 主要在这里写页面（React 组件）
    ├── renderer/bridge.ts    # window.myToolBridge 的类型声明（不用管）
    ├── main/index.ts         # 主进程逻辑（IPC 处理，暂时不用管）
    ├── preload/index.ts      # 暴露给页面的桥（暂时不用管）
    ├── shared/protocol.ts    # IPC 通道名（用到主进程能力时改这里）
    └── locales/
        ├── zh-CN.json        # 中文文案
        └── en-US.json        # 英文文案
```

**日常 90% 的时间，你只碰两个文件：`renderer.tsx`（页面）和 `locales/*.json`（文案）。**

## 写你的第一个工具（改页面）

打开 `packages/feature-my-tool/src/renderer.tsx`：

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function MyToolPage() {
  const { t } = useTranslation('myTool')   // 取文案：t('xxx')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-white p-6 text-slate-900 dark:bg-black dark:text-white">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('inputPlaceholder')}
        className="rounded-md border border-slate-300 bg-transparent px-3 py-2 outline-none dark:border-white/20"
      />
      <button
        type="button"
        onClick={() => setResult(`你输入了：${input}`)}
        className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        {t('run')}
      </button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}

export function createRendererFeature() {
  return {
    routes: [{ path: 'my-tool', element: <MyToolPage /> }],
    navigation: [
      { to: '/my-tool', icon: /* 选个 lucide-react 图标 */, key: 'nav.my-tool', ns: 'myTool' },
    ],
    fullBleedPaths: [],
    locales: { 'zh-CN': { myTool: zhCN }, 'en-US': { myTool: enUS } },
  }
}
```

要点：

- **样式**：直接写 Tailwind 类名即可，亮 / 暗色自动适配（参照上面 `dark:` 写法）。
- **图标**：从 `lucide-react` 选，如 `import { Wrench } from 'lucide-react'`。
- **文案**：不要写死中文 / 英文，放到 `locales/zh-CN.json` 和 `en-US.json`：

```json
// packages/feature-my-tool/src/locales/zh-CN.json
{
  "title": "我的工具",
  "inputPlaceholder": "输入点什么…",
  "run": "运行",
  "nav": { "my-tool": "我的工具" }
}
```

```json
// packages/feature-my-tool/src/locales/en-US.json
{
  "title": "My Tool",
  "inputPlaceholder": "Type something…",
  "run": "Run",
  "nav": { "my-tool": "My Tool" }
}
```

## 进阶：让页面调用"主进程能力"（IPC）

如果工具需要 Node / Electron 能力（读文件、存数据、调系统），按三步走：

**① 主进程注册处理** → `packages/feature-my-tool/src/main/index.ts`

```ts
import { ipcMain } from 'electron'
import { MY_TOOL_SAY_HI_CHANNEL } from '../shared/protocol'

export function createMainFeature() {
  return {
    initialize() {
      ipcMain.handle(MY_TOOL_SAY_HI_CHANNEL, (_e, name: string) => `你好，${name}`)
    },
  }
}
```

**② 通道名** → `packages/feature-my-tool/src/shared/protocol.ts`

```ts
export const MY_TOOL_SAY_HI_CHANNEL = 'feature-my-tool:say-hi'
```

**③ preload 桥暴露给页面** → `packages/feature-my-tool/src/preload/index.ts`

```ts
export function createPreloadFeature() {
  return {
    expose() {
      contextBridge.exposeInMainWorld('myToolBridge', {
        sayHi: (name: string) => ipcRenderer.invoke('feature-my-tool:say-hi', name),
      })
    },
  }
}
```

然后页面里直接调：

```tsx
const msg = await window.myToolBridge.sayHi('小明')
setResult(msg)
```

> `window.myToolBridge` 的名字 = 你的工具 id 转小驼峰 + `Bridge`（`my-tool` → `myToolBridge`）。

## 质量检查

```bash
pnpm typecheck   # 类型错误检查
pnpm lint:fix    # 代码风格自动修复
pnpm test        # 单元测试
```

提交前跑一遍，绿色就是没问题。

## 常见问题

**侧边栏没看到我的模块？**
→ 检查 `app/shared/features.ts` 的 `enabledFeatures` 里有没有你的 id；确认后重启 `pnpm dev`。

**页面报"桥接不可用 / Bridge unavailable"？**
→ 功能没启用，或改完主进程 / preload 后没重启。重启 `pnpm dev` 即可。

**改了主进程 / preload 代码不生效？**
→ 主进程和 preload 的改动必须**重启** `pnpm dev`（不能热更新），只有页面（renderer）能热更新。

**想删除一个模块？**
→ 删掉 `packages/feature-<id>` 目录，从 `enabledFeatures` 移除 id，再删掉 `package.json` 里对应的依赖即可。

**参考**：`packages/feature-example` 是一个能完整跑通的最小示例，遇到不懂的照着它抄。
