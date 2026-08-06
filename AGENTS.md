# 仓库指南

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 二次开发的 Electron + React 桌面应用模板。
技术栈：Electron 42 · React 19 · TypeScript 6 · Vite 8 · TailwindCSS v4 · pnpm · Biome

---

## 开发工作流（必须遵守）

### 1. 设计阶段：UI/UX 设计系统

前端页面/组件开发前，**必须先用设计技能生成设计系统**，禁止直接写代码。

**技能优先级**：
1. **`ui-ux-pro-max`** — 生成设计系统（配色、排版、风格、UX 规范）
2. **`gpt-taste`** — Awwwards 级别的设计工程（GSAP 动效、AIDA 结构、Bento 网格）
3. **`design-taste-frontend`** — 反模板化前端设计

**工作流**：
```bash
# 生成设计系统
python3 /Users/bluer/.agents/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格>" --design-system -p "项目名"

# 查询具体领域
python3 /Users/bluer/.agents/skills/ui-ux-pro-max/scripts/search.py "<关键词>" --domain <style|color|typography|ux|landing>
```

**设计红线**：
- ❌ 禁止默认模板样式（无设计感的卡片、无聊的布局）
- ❌ 禁止 Emoji 作为图标（用 lucide-react 图标）
- ❌ 禁止硬编码颜色值（用 Tailwind 类或 CSS 变量）
- ❌ 禁止 6 行以上的标题文字墙
- ✅ 必须有视觉层次、间距节奏、微交互动效
- ✅ 必须遵循 AIDA 结构（Attention → Interest → Desire → Action）

> 技能参考：`skill://ui-ux-pro-max`、`skill://gpt-taste`、`skill://design-taste-frontend`

### 2. 实现阶段：代码规范

规划和设计完成后，按以下规范实现：

- 新组件放 `src/components/<name>/index.tsx`
- 新页面放 `src/pages/<Name>.tsx`
- 新增路由：`src/routes/index.tsx` 注册
- IPC 通道命名：`kebab-case`
- 样式：TailwindCSS v4，禁止硬编码颜色
- **多语言**：新增 UI 文案必须走 i18n（见下方国际化规范），禁止硬编码中英文
- **日志**：业务关键路径用统一 logger 埋点（见下方日志规范），禁止裸 `console.log`

---

## 国际化（i18n）规范

采用 `i18next` + `react-i18next`，语言资源按命名空间拆分。

```
src/locales/
  zh-CN/  {common, home, logs, errors}.json
  en-US/  {common, home, logs, errors}.json
```

- 每个组件通过 `useTranslation('namespace')` 指定命名空间，`t('key')` 不带命名空间前缀
- 新增语言：新建 `src/locales/<code>/` + 在 `src/i18n/index.ts` 的 `SUPPORTED_LANGUAGES` 与 `resources` 注册
- 新增文案：在对应命名空间 json 的 zh-CN / en-US 同步补充
- 语言切换入口在侧边栏底部（下拉选择），持久化于 `localStorage`

---

## 日志规范

统一结构化日志系统，主进程集中落盘（详见 `docs/logging-standard.md`）。

```ts
// 主进程
import { createLogger } from './logger'
const log = createLogger('main')
log.info('window-created', { width, height })

// 渲染进程
import { createLogger } from '@/lib/logger'
const log = createLogger('home')
log.warn('api-degraded', { retry: 2 })
```

- 事件名用 kebab-case，结构化字段放 `data`
- 敏感字段自动打码；日志按天轮转 + 清理（见规范文档）
- 日志页面在 `/logs`，支持级别筛选 / 复制 / 清空 / 实时推送

---

## 目录规范

```
src/                    渲染进程（React 组件、样式、类型）
  components/           可复用组件（每个组件一个目录，入口 index.tsx）
  pages/                页面级组件（Home / Logs）
  contexts/             React Context（如 ThemeContext）
  i18n/                 i18n 初始化与语言配置
  locales/              语言资源（zh-CN / en-US，按命名空间拆分）
  lib/                  工具库（logger 等）
  routes/               路由配置
  index.css             Tailwind v4 全局样式
electron/               主进程
  main/                 主进程逻辑（窗口、IPC、日志、自动更新）
  preload/              Preload 脚本（contextBridge）
test/                   测试
  e2e/                  Playwright E2E
  *.test.ts             Vitest 单元测试
public/                 公共静态资源
docs/                   规范文档（logging-standard.md）
```

---

## 代码质量工具（Biome）

单一工具同时做代码检查与格式化，零配置陷阱。

| 工具 | 命令 | 用途 |
|------|------|------|
| Biome | `pnpm lint` / `pnpm lint:fix` | 代码检查 + 导入排序（lint:fix 自动修复） |
| Biome | `pnpm format` / `pnpm format:check` | 格式化 |
| TypeScript | `pnpm typecheck` | 类型检查 |
| Vitest | `pnpm test` | 单元测试 |
| Playwright | `pnpm test:e2e` | E2E 测试 |

**提交前预检**：
```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

> CI 会强制执行同样检查（`.github/workflows/quality.yml`），不过全不给推送合并。

---

## IPC 通信约定

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

> 参考：`electron/main/index.ts`、`electron/preload/index.ts`

---

## 发布流程

打 `v*` 标签自动触发 `.github/workflows/release.yml`，三平台打包并发布 GitHub Release。

```bash
pnpm version patch   # 或 minor / major
git push --tags
```

---

## 配置文件索引

| 文件 | 用途 |
|------|------|
| [`vite.config.ts`](vite.config.ts) | Vite + Electron 构建配置 |
| [`tsconfig.json`](tsconfig.json) | TypeScript 严格编译选项 |
| [`electron-builder.json`](electron-builder.json) | 打包发布配置（publish 指向 GitHub） |
| [`biome.json`](biome.json) | Biome 代码检查与格式化配置 |
| [`.github/workflows/`](.github/workflows/) | CI/CD 流水线（quality / release） |
| [`docs/logging-standard.md`](docs/logging-standard.md) | 日志规范文档 |

